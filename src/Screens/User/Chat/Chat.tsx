import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import styles from "./Chat.module.css";
import Header from "../../../components/Header/Header";
import Loader from "../../../components/Loader/Loader";

interface User {
  id: string;
  name: string;
}

interface Product {
  title: string;
}

interface Message {
  text: string;
  senderID: string;
  timestamp: any;
}

interface Chat {
  id: string;
  participants: string[];
  productName: string;
}

const Chat: React.FC = () => {
  const location = useLocation();
  const { sellerId, productName, productId } = location.state || {};
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sellerChats, setSellerChats] = useState<Chat[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          alert("You need to log in to access the chat.");
          navigate("/login");
          return;
        }

        // Fetch User Data
        const userDoc = await getDoc(doc(firestore, "Users", uid));
        if (!userDoc.exists()) {
          navigate("/error");
          return;
        }
        const userData = userDoc.data() as User;
        setUser({ id: uid, name: userData.name });

        // Fetch Chats
        const chatQuery = query(
          collection(firestore, "Chats"),
          where("participants", "array-contains", uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(chatQuery);
        const chats = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Chat),
          id: doc.id,
        }));
        setSellerChats(chats);

        // Fetch Product Data
        if (productId) {
          const productDoc = await getDoc(
            doc(firestore, "Products", productId)
          );
          if (productDoc.exists()) {
            setProduct(productDoc.data() as Product);
          }
        }

        // Handle Chat Initialization
        if (sellerId && productId) {
          const existingChat = chats.find((chat) =>
            chat.participants.includes(sellerId)
          );
          if (existingChat) {
            setCurrentChatId(existingChat.id);
            subscribeToMessages(existingChat.id);
          } else {
            await startNewChat(uid, sellerId, productId);
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup subscriptions on unmount
    return () => {
      if (currentChatId) {
        unsubscribeFromMessages();
      }
    };
  }, [sellerId, productId, navigate]);

  const startNewChat = async (
    userId: string,
    sellerId: string,
    productId: string
  ) => {
    try {
      const productDoc = await getDoc(doc(firestore, "Products", productId));
      const product = productDoc.exists()
        ? (productDoc.data() as Product)
        : null;

      const chatRef = doc(firestore, "Chats", `${userId}-${sellerId}`);
      await setDoc(chatRef, {
        participants: [userId, sellerId],
        productId,
        productName: product?.title || "",
        timestamp: serverTimestamp(),
      });

      await addDoc(collection(chatRef, "Messages"), {
        text: `Hi! I want to know about ${product?.title || "your product"}.`,
        senderID: userId,
        timestamp: serverTimestamp(),
      });

      setCurrentChatId(chatRef.id);
      subscribeToMessages(chatRef.id);
    } catch (error) {
      console.error("Error starting new chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !currentChatId) return;

    try {
      const chatRef = collection(firestore, `Chats/${currentChatId}/Messages`);
      await addDoc(chatRef, {
        text: messageInput,
        senderID: user?.id,
        timestamp: serverTimestamp(),
      });
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const subscribeToMessages = useCallback((chatId: string) => {
    const messagesQuery = query(
      collection(firestore, `Chats/${chatId}/Messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const loadedMessages = querySnapshot.docs.map(
        (doc) => doc.data() as Message
      );
      setMessages(loadedMessages);
    });

    return unsubscribe;
  }, []);

  const unsubscribeFromMessages = () => {
    setMessages([]);
  };

  const handleSellerClick = async (chatId: string) => {
    setLoading(true);
    try {
      setCurrentChatId(chatId);
      subscribeToMessages(chatId);
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className={styles.main}>
      <Header user={user} />
      <div className={styles.chatContainer}>
        <div className={styles.sidebar}>
          <h2>Chats</h2>
          {sellerChats.length === 0 ? (
            <p>No active chats.</p>
          ) : (
            sellerChats.map((chat) => (
              <div
                key={chat.id}
                className={styles.chatPreview}
                onClick={() => handleSellerClick(chat.id)}
              >
                <p>
                  Chat with{" "}
                  {chat.productName || `Seller ${chat.participants[1]}`}
                </p>
              </div>
            ))
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
                  </div>
                ))}
              </div>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <p>Select a chat to start messaging.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
