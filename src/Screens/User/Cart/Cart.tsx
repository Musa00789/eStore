import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebase";
import { doc, getDocs, collection, updateDoc } from "@firebase/firestore";
import styles from "./Cart.module.css";

// TODO: enhance cart UI and add checkout button functionality

const Cart = () => {
  const [cart, setCart] = useState<any>([]);
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

  const getItems = async (uid) => {
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
  const increaseQuantity = async (item) => {
    try {
      const itemRef = doc(
        firestore,
        "Users",
        auth.currentUser.uid,
        "Cart",
        item.cartId
      );
      const updatedItem = { ...item, quantity: item.quantity + 1 };
      await updateDoc(itemRef, updatedItem);
      getItems(auth.currentUser?.uid);
    } catch (error) {
      console.error("Error increasing quantity:", error);
    }
  };

  const decreaseQuantity = async (item) => {
    if (item.quantity > 1) {
      try {
        const itemRef = doc(
          firestore,
          "Users",
          auth.currentUser.uid,
          "Cart",
          item.cartId
        );
        const updatedItem = { ...item, quantity: item.quantity - 1 };
        await updateDoc(itemRef, updatedItem);
        getItems(auth.currentUser?.uid);
      } catch (error) {
        console.error("Error decreasing quantity:", error);
      }
    } else {
      removeFromCart(item);
    }
  };

  const removeFromCart = async (item) => {
    try {
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
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  return (
    <div>
      <h1>Cart</h1>
      {cart.length > 0 ? (
        <div className={styles.main}>
          {cart.map((item) => (
            <div className={styles.productContainer} key={item.cartId}>
              <img className={styles.productImg} src={item.images} />
              <div>
                <h3 className={styles.pName}>{item.name}</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <h6 style={{ fontWeight: "600" }}>Price: </h6>
                  <span className={styles.pPrice}> {item.price}</span>
                </div>
                <p>
                  {item.description && item.description.length > 75
                    ? `${item.description.substring(0, 75)}...`
                    : item.description}
                </p>
              </div>
              <div>
                <button className={styles.checkOutBtn}>Check Out</button>
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
          ))}
        </div>
      ) : (
        <p>Your cart is empty.</p>
      )}
    </div>
  );
};
export default Cart;
