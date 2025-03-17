import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import styles from "./SellerChat.module.css";
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

const SellerChat: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [buyerNames, setBuyerNames] = useState<{ [key: string]: string }>({});
  const [currentBuyerName, setCurrentBuyerName] = useState<string>("");

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          alert("You need to log in to access the chat.");
          navigate("/login");
          return;
        }

        const sellerDoc = await getDoc(doc(firestore, "Users", uid));
        if (!sellerDoc.exists()) {
          navigate("/error");
          return;
        }
        const sellerData = sellerDoc.data() as User;
        setUser({ id: uid, name: sellerData.name });

        const chatQuery = query(
          collection(firestore, "Chats"),
          where("participants", "array-contains", uid),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(chatQuery);
        const fetchedChats = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as Chat),
          id: doc.id,
        }));

        const buyerNamePromises = fetchedChats.map(async (chat) => {
          const buyerId = chat.participants.find((id) => id !== uid);
          if (buyerId) {
            const buyerName = await getBuyerName(buyerId);
            return { buyerId, buyerName };
          }
          return null;
        });

        const buyerNameResults = await Promise.all(buyerNamePromises);
        const namesMap = buyerNameResults.reduce((acc, result) => {
          if (result) {
            acc[result.buyerId] = result.buyerName;
          }
          return acc;
        }, {} as { [key: string]: string });

        setBuyerNames(namesMap);
        setChats(fetchedChats);
      } catch (error) {
        console.error("Error loading data:", error);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [navigate]);

  const getBuyerName = async (buyerId: string) => {
    try {
      if (buyerNames[buyerId]) return buyerNames[buyerId];

      const buyerDoc = await getDoc(doc(firestore, "Users", buyerId));
      if (buyerDoc.exists()) {
        const buyerData = buyerDoc.data() as User;
        setBuyerNames((prev) => ({ ...prev, [buyerId]: buyerData.name }));
        return buyerData.name || "Buyer";
      }
    } catch (error) {
      console.error("Error fetching buyer's name:", error);
    }
    return "Buyer";
  };

  const subscribeToMessages = useCallback(
    (chatId: string) => {
      const messagesQuery = query(
        collection(firestore, `Chats/${chatId}/Messages`),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
        const loadedMessages = querySnapshot.docs.map((doc) => {
          const data = doc.data() as Message;
          return { ...data, id: doc.id };
        });

        const unreadMessages = querySnapshot.docs.filter(
          (doc) => !doc.data().read && doc.data().senderID !== user?.id
        );

        for (const msg of unreadMessages) {
          const messageRef = doc(firestore, `Chats/${chatId}/Messages`, msg.id);
          await updateDoc(messageRef, { read: true });
        }

        setMessages(loadedMessages);
        scrollToBottom();
      });

      return unsubscribe;
    },
    [user?.id]
  );

  const handleChatSelection = async (chatId: string) => {
    setLoading(true);
    try {
      setCurrentChatId(chatId);
      const selectedChat = chats.find((chat) => chat.id === chatId);
      if (selectedChat) {
        const buyerId = selectedChat.participants.find((id) => id !== user?.id);
        const buyerName = buyerId ? buyerNames[buyerId] || "Buyer" : "Unknown";
        setCurrentBuyerName(buyerName);
      }
      subscribeToMessages(chatId);
    } catch (error) {
      console.error("Error loading chat messages:", error);
    } finally {
      setLoading(false);
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
        read: false,
      });
      setMessageInput("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) return <Loader />;

  return (
    <div className={styles.main}>
      <div className={styles.chatContainer}>
        <div className={styles.sidebar}>
          <h2>Your Chats</h2>
          {chats.length === 0 ? (
            <p>No active chats.</p>
          ) : (
            chats.map((chat) => {
              const buyerId = chat.participants.find((id) => id !== user?.id);
              const buyerName = buyerId
                ? buyerNames[buyerId] || "Buyer"
                : "Unknown";
              return (
                <div
                  key={chat.id}
                  className={styles.chatPreview}
                  onClick={() => handleChatSelection(chat.id)}
                >
                  <p>
                    Chat with {buyerName} about{" "}
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
              <div className={styles.chatHeader}>
                <h2>Chat with {currentBuyerName}</h2>
              </div>
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
                  onKeyDown={handleKeyPress}
                />
                <button className={styles.sendButton} onClick={sendMessage}>
                  <FaPaperPlane /> Send
                </button>
              </div>
            </>
          ) : (
            <p>Select a chat to start messaging with a buyer.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerChat;
