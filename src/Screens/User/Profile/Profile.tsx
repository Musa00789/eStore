import React, { useEffect, useState } from "react";
import { firestore, auth } from "../../../firebase";
import { getDoc, doc, getDocs, collection } from "@firebase/firestore";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<any>([]);
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
        alert("No data found.");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getCartItems = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User ID not found");
      }
      const collectionRef = collection(firestore, "Users", userId, "Cart");
      const querySnapshot = await getDocs(collectionRef);
      if (!querySnapshot.empty) {
        const cartItems = querySnapshot.docs.map((doc) => doc.data());
        setCartItems(cartItems);
        setLoading(false);
      } else {
        setCartItems([]);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getDeliveredOrders = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User ID not found");
      }
      const collectionRef = collection(firestore, "Users", userId, "Orders");
      const querySnapshot = await getDocs(collectionRef);
      if (!querySnapshot.empty) {
        const cartItems = querySnapshot.docs.map((doc) => doc.data());
        setDeliveredOrders(cartItems);
        setLoading(false);
      } else {
        setDeliveredOrders([]);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          navigate(-1);
        }}
      >
        <FaArrowLeft />
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <div>
          <div className={styles.profileContent}>
            <div className={styles.profileImage}>
              {user?.photoURL ? (
                <img
                  src={user?.photoURL}
                  alt="Profile"
                  className={styles.userImage}
                />
              ) : (
                <div className={styles.noUserImage}>
                  <span>{user?.name ? user?.name[0] : "?"}</span>
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>{user?.name}</h1>
              <h1 className={styles.userEmail}>{user?.email}</h1>
              <h1 className={styles.userPhone}>{user?.phone}</h1>
            </div>
          </div>
          <div className={styles.columnContainer}>
            {/* Orders in cart */}
            <div>
              <h5 className={styles.cartHeading}>Orders in cart</h5>
              <div className={styles.scrollableContainer}>
                <table className={styles.cartTable}>
                  <thead>
                    <tr className={styles.tableRow}>
                      <th className={styles.tableHeader}>Image</th>
                      <th className={styles.tableHeader}>Name</th>
                      <th className={styles.tableHeader}>Quantity</th>
                      <th className={styles.tableHeader}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item: any, index: number) => (
                      <tr className={styles.tableRow} key={index}>
                        <td>
                          <img
                            className={styles.cartImage}
                            src={item.images}
                            alt={item.name}
                          />
                        </td>
                        <td>
                          <p className={styles.tableData}>{item.name}</p>
                        </td>
                        <td>
                          <p className={styles.tableData}>{item.quantity}</p>
                        </td>
                        <td>
                          <p className={styles.tableData}>{item.price}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Orders Delivered */}
            <div>
              <h5 className={styles.cartHeading}>Orders Delivered</h5>
              <div className={styles.scrollableContainer}>
                <table className={styles.cartTable}>
                  <thead>
                    <tr className={styles.tableRow}>
                      <th className={styles.tableHeader}>Image</th>
                      <th className={styles.tableHeader}>Name</th>
                      <th className={styles.tableHeader}>Quantity</th>
                      <th className={styles.tableHeader}>Price</th>
                      <th className={styles.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredOrders.map((item: any, index: number) => (
                      <tr className={styles.tableRow} key={index}>
                        <td>
                          <img
                            className={styles.cartImage}
                            src={item.images}
                            alt={item.name}
                          />
                        </td>
                        <td>
                          <p className={styles.tableData}>{item.name}</p>
                        </td>
                        <td>
                          <p className={styles.tableData}>{item.quantity}</p>
                        </td>
                        <td>
                          <p className={styles.tableData}>{item.price}</p>
                        </td>
                        <td>
                          <p className={styles.tableData}>Delivered</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default Profile;
