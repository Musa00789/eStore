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
} from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import styles from "./BuyerChat.module.css";
import Header from "../../../components/Header/Header";
import Loader from "../../../components/Loader/Loader";

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

const Chat: React.FC = () => {
  const location = useLocation();
  const { sellerId, productName, productId } = location.state || {};
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sellerNames, setSellerNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchBuyerData = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          alert("You need to log in to access the chat.");
          navigate("/login");
          return;
        }

        const buyerDoc = await getDoc(doc(firestore, "Users", uid));
        if (!buyerDoc.exists()) {
          navigate("/error");
          return;
        }
        const buyerData = buyerDoc.data() as User;
        setUser({ id: uid, name: buyerData.name });

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

        const sellerNamePromises = fetchedChats.map(async (chat) => {
          const sellerId = chat.participants.find((id) => id !== uid);
          if (sellerId) {
            const sellerName = await getSellerName(sellerId);
            return { sellerId, sellerName };
          }
          return null;
        });

        const sellerNameResults = await Promise.all(sellerNamePromises);
        const namesMap = sellerNameResults.reduce((acc, result) => {
          if (result) {
            acc[result.sellerId] = result.sellerName;
          }
          return acc;
        }, {} as { [key: string]: string });

        setSellerNames(namesMap);
        setChats(fetchedChats);
      } catch (error) {
        console.error("Error loading data:", error);
        navigate("/error");
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, [navigate]);

  const getSellerName = async (sellerId: string) => {
    try {
      if (sellerNames[sellerId]) return sellerNames[sellerId];

      const sellerDoc = await getDoc(doc(firestore, "Users", sellerId));
      if (sellerDoc.exists()) {
        const sellerData = sellerDoc.data() as User;
        setSellerNames((prev) => ({ ...prev, [sellerId]: sellerData.name }));
        return sellerData.name || "Seller";
      }
    } catch (error) {
      console.error("Error fetching seller's name:", error);
    }
    return "Seller";
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
      });

      return unsubscribe;
    },
    [user?.id]
  );

  const handleChatSelection = async (chatId: string) => {
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
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                />
                <button onClick={sendMessage}>Send</button>
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
