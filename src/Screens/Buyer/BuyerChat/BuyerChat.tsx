import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  setDoc,
} from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import styles from "./BuyerChat.module.css";
import Header from "../../../components/Header/Header";
import Loader from "../../../components/Loader/Loader";
import { FaPaperPlane } from "react-icons/fa6";

interface User {
  id: string;
  name: string;
}

interface Message {
  text: string;
  senderID: string;
  timestamp: any;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  productId: string;
  productName: string;
}

interface Product {
  title: string;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const { sellerId, productName, productId } = location.state || {};
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sellerChats, setSellerChats] = useState<Chat[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sellerNames, setSellerNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchBuyerData();

    return () => {
      if (currentChatId) {
        console.log("Unsubscribing from messages...");
        unsubscribeFromMessages();
      }
    };
  }, [sellerId, productId, navigate]);

  const fetchBuyerData = async () => {
    console.log("Fetching buyer data...");
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      console.log("Current user UID:", uid);

      if (!uid) {
        console.warn("User is not logged in.");
        alert("You need to log in to access the chat.");
        navigate("/login");
        return;
      }

      const buyerDoc = await getDoc(doc(firestore, "Users", uid));
      console.log("Buyer document fetched:", buyerDoc.exists());

      if (!buyerDoc.exists()) {
        console.error("Buyer document does not exist.");
        navigate("/error");
        return;
      }

      const buyerData = buyerDoc.data() as User;
      setUser({ id: uid, name: buyerData.name });
      console.log("Buyer data set:", buyerData);

      const chatQuery = query(
        collection(firestore, "Chats"),
        where("participants", "array-contains", uid),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(chatQuery);
      console.log("Chats fetched:", querySnapshot.size);

      const fetchedChats = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as Chat),
        id: doc.id,
      }));
      setSellerChats(fetchedChats);
      console.log("Seller chats set:", fetchedChats);

      if (productId) {
        const productDoc = await getDoc(doc(firestore, "Products", productId));
        console.log("Product document fetched:", productDoc.exists());

        if (productDoc.exists()) {
          setProduct(productDoc.data() as Product);
          console.log("Product set:", productDoc.data());
        }
      }

      if (sellerId && productId) {
        console.log(
          "Seller ID and Product ID provided. Checking for existing chats..."
        );
        const existingChat = fetchedChats.find(
          (chat) =>
            chat.participants.includes(sellerId) && chat.productId === productId
        );
        console.log("Existing chat found:", !!existingChat);

        if (existingChat) {
          setCurrentChatId(existingChat.id);
          console.log("Current chat ID set to:", existingChat.id);
          subscribeToMessages(existingChat.id);
        } else {
          console.log("No existing chat. Starting a new chat...");
          await startNewChat(uid, sellerId, productId);
        }
      }

      const sellerNamePromises = fetchedChats.map(async (chat) => {
        const sellerId = chat.participants.find((id) => id !== uid);
        if (sellerId) {
          const sellerName = await getSellerName(sellerId);
          return { sellerId, sellerName };
        }
        return null;
      });

      const sellerNameResults = await Promise.all(sellerNamePromises);
      console.log("Seller names fetched:", sellerNameResults);

      const namesMap = sellerNameResults.reduce((acc, result) => {
        if (result) {
          acc[result.sellerId] = result.sellerName;
        }
        return acc;
      }, {} as { [key: string]: string });

      setSellerNames(namesMap);
      console.log("Seller names set:", namesMap);

      setChats(fetchedChats);
    } catch (error) {
      console.error("Error loading data:", error);
      navigate("/error");
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async (
    userId: string,
    sellerId: string,
    productId: string
  ) => {
    console.log("Starting new chat...");
    try {
      const chatRef = doc(
        firestore,
        "Chats",
        `${userId}-${sellerId}-${productId}`
      );

      // Check if the chat already exists
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [userId, sellerId],
          productId,
          productName: productName || "",
          timestamp: serverTimestamp(),
        });
        console.log("New chat document created:", chatRef.id);
      }

      // Check if messages already exist in this chat
      const messagesRef = collection(firestore, `Chats/${chatRef.id}/Messages`);
      const messagesSnapshot = await getDocs(messagesRef);

      if (messagesSnapshot.empty) {
        console.log("No messages exist, sending initial message...");
        await addDoc(messagesRef, {
          text: `Hi! I want to know about ${productName || "your product"}.`,
          senderID: userId,
          timestamp: serverTimestamp(),
        });
        console.log("Initial message sent.");
      } else {
        console.log("Messages already exist, skipping initial message.");
      }

      setCurrentChatId(chatRef.id);
      subscribeToMessages(chatRef.id);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
    fetchBuyerData();
  };

  const unsubscribeFromMessages = () => {
    console.log("Clearing messages and unsubscribing...");
    setMessages([]);
  };

  const getSellerName = async (sellerId: string) => {
    console.log("Fetching seller name for ID:", sellerId);
    try {
      if (sellerNames[sellerId]) {
        console.log("Seller name already cached:", sellerNames[sellerId]);
        return sellerNames[sellerId];
      }

      const sellerDoc = await getDoc(doc(firestore, "Users", sellerId));
      console.log("Seller document fetched:", sellerDoc.exists());

      if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data() as User;
        setSellerNames((prev) => ({ ...prev, [sellerId]: sellerData.name }));
        console.log("Seller name fetched and set:", sellerData.name);
        return sellerData.name || "Seller";
      }
    } catch (error) {
      console.error("Error fetching seller's name:", error);
    }
    return "Seller";
  };

  const subscribeToMessages = useCallback(
    (chatId: string) => {
      console.log("Subscribing to messages for chat ID:", chatId);
      const messagesQuery = query(
        collection(firestore, `Chats/${chatId}/Messages`),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
        console.log("Messages snapshot received:", querySnapshot.size);
        const loadedMessages = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Message;
          return { ...data, id: doc.id };
        });

        console.log("Messages loaded:", loadedMessages);
        setMessages(loadedMessages);

        const unreadMessages = querySnapshot.docs.filter(
          (doc) => !doc.data().read && doc.data().senderID !== user?.id
        );

        for (const msg of unreadMessages) {
          const messageRef = doc(firestore, `Chats/${chatId}/Messages`, msg.id);
          await updateDoc(messageRef, { read: true });
          console.log("Message marked as read:", msg.id);
        }
      });

      return unsubscribe;
    },
    [user?.id]
  );

  const handleChatSelection = async (chatId: string) => {
    console.log("Chat selected with ID:", chatId);
    setLoading(true);

    try {
      setCurrentChatId(chatId);
      subscribeToMessages(chatId);
    } catch (error) {
      console.error("Error loading chat messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    console.log("Sending message...");
    if (!messageInput.trim() || !currentChatId) {
      console.warn("Message input is empty or no chat selected.");
      return;
    }

    try {
      const chatRef = collection(firestore, `Chats/${currentChatId}/Messages`);
      await addDoc(chatRef, {
        text: messageInput,
        senderID: user?.id,
        timestamp: serverTimestamp(),
        read: false,
      });
      console.log("Message sent:", messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.main}>
      <Header user={user} />
      <div className={styles.chatContainer}>
        <div className={styles.sidebar}>
          <h2>Your Chats</h2>
          {chats.length === 0 ? (
            <p>No active chats.</p>
          ) : (
            chats.map((chat) => {
              const sellerId = chat.participants.find((id) => id !== user?.id);
              const sellerName = sellerId
                ? sellerNames[sellerId] || "Seller"
                : "Unknown";
              return (
                <div
                  key={chat.id}
                  className={styles.chatPreview}
                  onClick={() => handleChatSelection(chat.id)}
                >
                  <p>
                    Chat with {sellerName} about{" "}
                    <strong>{chat.productName || "a product"}</strong>
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.chatBox}>
          {currentChatId ? (
            <>
              <div className={styles.messages}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${styles.message} ${
                      msg.senderID === user?.id ? styles.sent : styles.received
                    }`}
                  >
                    {msg.text}
                    <span
                      className={styles.tick}
                      style={{
                        color: "grey",
                      }}
                    >
                      {msg.senderID === user?.id ? (msg.read ? "✔✔" : "✔") : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.inputContainer}>
                <input
                  className={styles.chatInput}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                />
                <button className={styles.sendButton} onClick={sendMessage}>
                  Send <FaPaperPlane />{" "}
                </button>
              </div>
            </>
          ) : (
            <p>Select a chat to start messaging with a seller.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
