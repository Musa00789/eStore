import React, { useEffect, useState } from "react";
import { firestore, auth } from "../../../firebase";
import {
  getDoc,
  doc,
  getDocs,
  collection,
  deleteDoc,
} from "@firebase/firestore";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import Footer from "../../../components/Footer/Footer";
import Loader from "../../../components/Loader/Loader";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userAuth) => {
      if (userAuth) {
        getUser(userAuth);
        getCartItems();
        getDeliveredOrders();
      } else {
        alert("User not authenticated.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getUser = async (userAuth: any) => {
    try {
      const userRef = doc(firestore, "Users", userAuth.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUser(docSnap.data());
      } else {
        alert("No user data found.");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const getCartItems = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const collectionRef = collection(firestore, "Users", userId, "Cart");
      const querySnapshot = await getDocs(collectionRef);

      if (!querySnapshot.empty) {
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            price: data.price || 0,
            quantity: data.quantity || 0,
          };
        });
        setCartItems(items);

        const total = items.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        setCartTotal(total);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const getDeliveredOrders = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const collectionRef = collection(firestore, "Users", userId, "Orders");
      const querySnapshot = await getDocs(collectionRef);

      if (!querySnapshot.empty) {
        const orders = querySnapshot.docs.map((doc) => doc.data());
        setDeliveredOrders(orders);
      } else {
        setDeliveredOrders([]);
      }
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
    }
  };

  const removeCartItem = async (itemId: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      const itemRef = doc(firestore, "Users", userId, "Cart", itemId);
      await deleteDoc(itemRef);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
      const updatedTotal = cartItems
        .filter((item) => item.id !== itemId)
        .reduce((acc, item) => acc + item.price * item.quantity, 0);
      setCartTotal(updatedTotal);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/Login");
    });
  };

  return (
    <div className={styles.profileContainer}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <FaArrowLeft /> Back
      </button>

      {loading ? (
        // <div className={styles.loader}>Loading...</div>
        <Loader />
      ) : user ? (
        <div className={styles.profileContent}>
          {/* Profile Section */}
          <div className={styles.profileCard}>
            {user?.photoURL ? (
              <img
                src={user?.photoURL}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : (
              <div className={styles.defaultProfile}>
                {user?.name ? user?.name[0] : "?"}
              </div>
            )}
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <p>{user?.phone}</p>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>

          {/* Cart Items Section */}
          <div className={styles.section}>
            <h3>Cart Items</h3>
            {cartItems.length > 0 ? (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <img
                            src={item.images}
                            alt={item.name}
                            className={styles.cartImage}
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price}</td>
                        <td>
                          <button
                            className={styles.removeButton}
                            onClick={() => removeCartItem(item.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={styles.cartTotal}>Total: ${cartTotal}</p>
              </>
            ) : (
              <p>No items in cart.</p>
            )}
          </div>

          {/* Delivered Orders Section */}
          <div className={styles.section}>
            <h3>Delivered Orders</h3>
            {deliveredOrders.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map((order, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={order.images}
                          alt={order.name}
                          className={styles.cartImage}
                        />
                      </td>
                      <td>{order.name}</td>
                      <td>{order.quantity}</td>
                      <td>${order.price}</td>
                      <td>Delivered</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No delivered orders.</p>
            )}
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
      <Footer />
    </div>
  );
};

export default Profile;
