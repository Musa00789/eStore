import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import styles from "./Chat.module.css";
import Header from "../../../components/Header/Header";
import Loader from "../../../components/Loader/Loader";

const Chat = () => {
  const location = useLocation();
  const { sellerID, productName, productID } = location.state;

  //   const { sellerID, productID } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<null | { id: string; name: string }>(null);
  const [product, setProduct] = useState<null | {
    title: string;
    description: string;
  }>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sellerChats, setSellerChats] = useState<any[]>([]); // to store chats with sellers

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          console.log("User is not logged in. Redirecting to login...");
          navigate("/login"); // Redirect to login if the user is not logged in
          return;
        }

        // Fetch user details
        const userDoc = await getDoc(doc(firestore, "Users", uid));
        if (!userDoc.exists()) {
          console.log("User document not found. Redirecting to error page...");
          navigate("/error"); // Redirect to error if user document doesn't exist
          return;
        }
        setUser({ id: uid, ...(userDoc.data() as any) });

        // Fetch active chats with sellers
        const chatQuery = query(
          collection(firestore, `Chats`),
          orderBy("timestamp", "asc")
        );
        const querySnapshot = await getDocs(chatQuery);
        const chats = querySnapshot.docs.filter(
          (doc) => doc.id.includes(uid) // Assuming the chat involves the current user
        );
        setSellerChats(chats);

        // If no chat with the seller, create a new chat
        if (chats.length === 0) {
          console.log(
            "No existing chat with this seller. Creating a new one..."
          );
          const newChat = {
            sellerID: sellerID,
            userID: uid,
            timestamp: new Date(),
          };
          const chatRef = await addDoc(collection(firestore, "Chats"), newChat);
          console.log("New chat created with ID:", chatRef.id);
          setSellerChats([...sellerChats, chatRef]); // Optionally, add it to the state
        }

        // Fetch product details if productID is provided
        if (productID) {
          console.log("Fetching product details...");
          const productDoc: any = await getDoc(
            doc(firestore, "Products", productID)
          );
          if (productDoc.exists()) {
            setProduct(productDoc.data());
            console.log("Product fetched:", productDoc.data());
          } else {
            console.log("Product not found. Redirecting to error page...");
            navigate("/error"); // Redirect to error if product is not found
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/error"); // If any error occurs, navigate to the error page
      }
    };

    fetchData();
  }, [sellerID, productID, navigate]);

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    try {
      const chatRef = collection(
        firestore,
        `Chats/${sellerID || "general"}/Messages`
      );
      await addDoc(chatRef, {
        text: messageInput,
        senderID: user?.id,
        timestamp: new Date(),
        ...(productID ? { productID } : {}),
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
        <div className={styles.chatHeader}>
          <h2>
            {sellerID ? `Chat with Seller ${sellerID}` : "Chats with Sellers"}
          </h2>
          {product && (
            <p className={styles.productDetails}>
              {`Product: ${product.title}`} - {product.description}
            </p>
          )}
        </div>

        {sellerChats.length === 0 ? (
          <div className={styles.noChats}>
            <p>Buy products to start chatting with sellers</p>
          </div>
        ) : (
          <div className={styles.chatList}>
            {sellerChats.map((chat, index) => (
              <div
                key={index}
                className={styles.chatPreview}
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                <p>{chat.data().productName || "Product"}</p>
              </div>
            ))}
          </div>
        )}

        {sellerID && (
          <div className={styles.chatMessages}>
            <div className={styles.chatBox}>
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
            <div className={styles.chatInputContainer}>
              <input
                type="text"
                value={messageInput}
                placeholder={
                  productID
                    ? `Discussing: ${product?.title}`
                    : "Type your message here..."
                }
                onChange={(e) => setMessageInput(e.target.value)}
                className={styles.chatInput}
              />
              <button onClick={sendMessage} className={styles.sendButton}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
