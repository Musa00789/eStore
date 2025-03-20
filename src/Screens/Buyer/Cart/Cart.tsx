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
import { FaTrashCan, FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.css";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCartItems(user.uid);
      } else {
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const fetchCartItems = async (uid: string) => {
    try {
      const collectionRef = collection(firestore, "Users", uid, "Cart");
      const querySnapshot = await getDocs(collectionRef);
      if (!querySnapshot.empty) {
        const cartItems = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            cartId: doc.id,
            name: data.name || "", // Ensure name exists
            price: data.price || 0, // Ensure price is a number
            quantity: Array.isArray(data.quantity)
              ? data.quantity[0]
              : data.quantity || 1, // Ensure quantity is a number
            images: data.images || "", // Ensure images field exists
          };
        });

        setCart(cartItems);

        // Calculate total price
        const total = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setCartTotal(total);
        setLoading(false);
      } else {
        setCart([]);
        setCartTotal(0);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setLoading(false);
    }
  };

  const updateQuantity = async (item: any, newQuantity: number) => {
    try {
      if (auth.currentUser?.uid) {
        const itemRef = doc(
          firestore,
          "Users",
          auth.currentUser.uid,
          "Cart",
          item.cartId
        );
        await updateDoc(itemRef, { quantity: newQuantity });
        fetchCartItems(auth.currentUser.uid); // Refresh cart
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeFromCart = async (item: any) => {
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
        fetchCartItems(auth.currentUser.uid); // Refresh cart
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const handleCheckout = async (item: any) => {
    try {
      if (auth.currentUser?.uid) {
        const orderRef = doc(
          firestore,
          "Users",
          auth.currentUser.uid,
          "Orders",
          item.cartId
        );
        await setDoc(orderRef, item); // Move to Orders collection
        await removeFromCart(item); // Remove from cart
        navigate("/Buyer/checkout", { state: item });
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  return (
    <div className={styles.cartPage}>
      <button className={styles.backButton} onClick={() => navigate("/")}>
        <FaArrowLeft /> Back
      </button>
      <h1 className={styles.pageTitle}>Your Cart</h1>

      {loading ? (
        <p className={styles.loadingText}>Loading...</p>
      ) : cart.length > 0 ? (
        <>
          <table className={styles.cartTable}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.cartId}>
                  <td>
                    <img
                      src={item.images}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>${item.price}</td>
                  <td>
                    <div className={styles.quantityControls}>
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>${item.price * item.quantity}</td>
                  <td>
                    {item.type === "property" ? (
                      <button
                        className={styles.chatButton}
                        onClick={() =>
                          navigate("/chat", {
                            state: { sellerId: item.sellerId },
                          })
                        }
                      >
                        Chat with Seller
                      </button>
                    ) : (
                      <button
                        className={styles.checkoutButton}
                        onClick={() => handleCheckout(item)}
                      >
                        Checkout
                      </button>
                    )}
                    <button
                      className={styles.deleteButton}
                      onClick={() => removeFromCart(item)}
                    >
                      <FaTrashCan />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.cartSummary}>
            <h3>Total: ${cartTotal}</h3>
          </div>
        </>
      ) : (
        <div className={styles.emptyCart}>
          <p>Your cart is empty.</p>
          <button className={styles.homeButton} onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
