import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebase";
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  setDoc,
  DocumentData,
} from "@firebase/firestore";
import styles from "./Cart.module.css";
import { FaArrowLeft, FaTrashCan } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getItems(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const getItems = async (uid: string) => {
    try {
      const collectionRef = collection(firestore, "Users", uid, "Cart");
      const querySnapshot = await getDocs(collectionRef);
      if (!querySnapshot.empty) {
        const cartItems = querySnapshot.docs.map((doc) => doc.data());
        setCart(cartItems);
        setLoading(false);
      } else {
        setCart([]);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const increaseQuantity = async (item: {
    cartId: string;
    quantity: number;
  }) => {
    try {
      if (auth.currentUser?.uid) {
        const itemRef = doc(
          firestore,
          "Users",
          auth.currentUser.uid,
          "Cart",
          item.cartId
        );

        const updatedItem = { ...item, quantity: item.quantity + 1 };
        await updateDoc(itemRef, updatedItem);
        getItems(auth.currentUser.uid);
      }
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  const decreaseQuantity = async (item: {
    cartId: string;
    quantity: number;
  }) => {
    if (item.quantity > 1) {
      try {
        if (auth.currentUser?.uid) {
          const itemRef = doc(
            firestore,
            "Users",
            auth.currentUser.uid,
            "Cart",
            item.cartId
          );
          const updatedItem = { ...item, quantity: item.quantity - 1 };
          await updateDoc(itemRef, updatedItem);
          getItems(auth.currentUser?.uid || "");
        }
      } catch (error) {
        console.error("Error decreasing quantity:", error);
      }
    } else {
      try {
        if (auth.currentUser?.uid) {
          const itemRef = doc(
            firestore,
            "Users",
            auth.currentUser.uid,
            "Cart",
            item.cartId
          );
          await updateDoc(itemRef, {
            // cart: arrayRemove(item),
            quantity: 0,
          });
          getItems(auth.currentUser.uid);
        } else {
          console.error("User ID is undefined");
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }
  };

  const checkOut = (item: any) => {
    try {
      if (auth.currentUser?.uid) {
        const itemRef = doc(
          firestore,
          "Users",
          auth.currentUser?.uid,
          "Orders",
          item.cartId
        );
        setDoc(itemRef, item).then(async () => {
          await deleteFromCart(item);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteFromCart = async (item: any) => {
    try {
      if (auth.currentUser?.uid) {
        const itemRef = doc(
          firestore,
          "Users",
          auth.currentUser.uid,
          "Cart",
          item.cartId
        );
        await deleteDoc(itemRef);
        getItems(auth.currentUser?.uid || "");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  return (
    <div>
      {/* <button
        className={styles.backNavigator}
        onClick={() => {
          navigate(-1);
        }}
      >
        <FaArrowLeft />
      </button> */}
      <h1
        style={{
          textAlign: "center",
          color: "#28a745",
          fontWeight: "700",
        }}
      >
        Your Items
      </h1>
      {cart.length > 0 ? (
        <div className={styles.cartContainer}>
          {cart.map((item: any) => (
            <div className={styles.productContainer} key={item.cartId}>
              <img
                className={styles.productImg}
                src={item.images}
                alt={item.name}
              />
              <div className={styles.productInfo}>
                <h3 className={styles.pName}>{item.name}</h3>
                <p className={styles.pDescription}>
                  {item.description && item.description.length > 75
                    ? `${item.description.substring(0, 70)} . . .`
                    : item.description}
                </p>
                <div className={styles.priceAndQuantity}>
                  <div className={styles.price}>
                    <h6>Price: </h6>
                    <span className={styles.pPrice}>{item.price}</span>
                  </div>
                  <div className={styles.quantityControl}>
                    <button
                      className={styles.quantityButton}
                      onClick={() => decreaseQuantity(item)}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button
                      className={styles.quantityButton}
                      onClick={() => increaseQuantity(item)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  checkOut(item);
                  navigate("/User/checkout", { state: item });
                }}
                className={styles.checkOutBtn}
              >
                Check Out
              </button>
              <button
                onClick={() => {
                  deleteFromCart(item);
                }}
                className={styles.delBtn}
              >
                <FaTrashCan />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p
          style={{
            textAlign: "center",
            color: "#28a745",
            fontWeight: "700",
          }}
        >
          Lets add some items to the cart!{" "}
          <button className={styles.homeButton} onClick={() => navigate(-1)}>
            {" "}
            <FaHome style={{ marginTop: "-5px" }} /> Home
          </button>
        </p>
      )}
    </div>
  );
};

export default Cart;
