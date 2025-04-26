// src/pages/Checkout/CheckoutForm.tsx
import React, { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import styles from "./Checkout.module.css";
import { CheckOutValidationSchema } from "../../../components/FormValidations/Validations";
import { auth, firestore } from "../../../firebase";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import Footer from "../../../components/Footer/Footer";
import { FaHome } from "react-icons/fa";
import Header from "../../../components/Header/Header";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state;

  // Redirect if no item data
  useEffect(() => {
    if (!item || !item.price) {
      alert("No item data found, redirecting to home.");
      navigate("/");
    }
  }, [item, navigate]);

  // Load user data into name/email/address/phone only
  const [initialValues, setInitialValues] = useState({
    baseAmount: item?.price || 0,
    taxes: parseFloat(((item?.price || 0) * 0.18).toFixed(2)),
    netAmount: parseFloat(
      ((item?.price || 0) - (item?.price || 0) * 0.18).toFixed(2)
    ),
    totalAmount: parseFloat(((item?.price || 0) * 1.18).toFixed(2)),
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentMethod: "COD",
  });
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      try {
        const snap = await getDoc(doc(firestore, "Users", uid));
        if (snap.exists()) {
          const u = snap.data();
          setInitialValues((v) => ({
            ...v,
            name: u.name || "",
            email: u.email || "",
            address: u.address || "",
            phone: u.phone || "",
          }));
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

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
        // fetchCartItems(auth.currentUser.uid); // Refresh cart
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <>
      <button
        style={{ margin: 10, borderRadius: 10 }}
        onClick={() => navigate("/")}
      >
        <FaHome size={21} />
      </button>
      <div className={styles.checkoutContainer}>
        <h1>Checkout</h1>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={CheckOutValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setCardError(null);
            try {
              if (values.paymentMethod === "Stripe") {
                if (!stripe || !elements) {
                  throw new Error(
                    "Payment system not ready. Please try again shortly."
                  );
                }
                // Create PaymentIntent
                const resp = await fetch("http://localhost:4242/pay", {
                  method: "POST",
                  mode: "cors",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount: values.totalAmount }),
                });
                if (!resp.ok) {
                  const text = await resp.text();
                  throw new Error(`Payment initialization failed: ${text}`);
                }

                const orderRef = doc(
                  firestore,
                  "Users",
                  auth.currentUser!.uid,
                  "Orders",
                  item.cartId
                );
                await setDoc(orderRef, item);

                // Update user totals
                const userRef = doc(firestore, "Users", auth.currentUser!.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  await setDoc(userRef, {
                    ...userData,
                    totalEarned:
                      (userData.totalEarned || 0) + Number(item.price),
                  });
                }

                await removeFromCart(item);
                alert("Payment successful—order placed!");
              }

              if (values.paymentMethod === "COD") {
                const orderRef = doc(
                  firestore,
                  "Users",
                  auth.currentUser!.uid,
                  "Orders",
                  item.cartId
                );
                await setDoc(orderRef, item);
                await removeFromCart(item);
                alert("Order placed successfully! Pay on delivery.");
              }

              navigate("/");
            } catch (err: any) {
              console.error("Checkout error:", err);
              setCardError(err.message || "An unexpected error occurred.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting }) => (
            <Form className={styles.form}>
              <div className={styles.fieldGrid}>
                <div className={styles.fieldContainer}>
                  <label>Base Amount</label>
                  <Field
                    name="baseAmount"
                    type="number"
                    readOnly
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label>Taxes (18%)</label>
                  <Field
                    name="taxes"
                    type="number"
                    readOnly
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label>Net Amount</label>
                  <Field
                    name="netAmount"
                    type="number"
                    readOnly
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label>Total Amount</label>
                  <Field
                    name="totalAmount"
                    type="number"
                    readOnly
                    className={styles.inputField}
                  />
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.fieldContainer}>
                  <label>Name</label>
                  <Field
                    name="name"
                    type="text"
                    className={styles.inputField}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className={styles.error}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label>Email</label>
                  <Field
                    name="email"
                    type="email"
                    className={styles.inputField}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className={styles.error}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label>Address</label>
                  <Field
                    name="address"
                    type="text"
                    className={styles.inputField}
                  />
                  <ErrorMessage
                    name="address"
                    component="div"
                    className={styles.error}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label>Phone</label>
                  <Field
                    name="phone"
                    type="text"
                    className={styles.inputField}
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className={styles.error}
                  />
                </div>
              </div>

              {/* ── Payment method select (unchanged) ── */}
              <div
                className={styles.fieldContainer}
                style={{ gridColumn: "span 2" }}
              >
                <label>Payment Method</label>
                <Field
                  as="select"
                  name="paymentMethod"
                  className={styles.inputField}
                >
                  <option value="COD">COD</option>
                  {/* <option value="Debit Card">Debit Card</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Paypal">Paypal</option> */}
                  <option value="Stripe">Stripe</option>
                </Field>
              </div>

              {/* ── ONLY add these three Stripe Elements when Stripe is chosen ── */}
              {values.paymentMethod === "Stripe" && (
                <div
                  className={styles.fieldGrid}
                  style={{ gridColumn: "span 2" }}
                >
                  <div className={styles.fieldContainer}>
                    <label>Card Number</label>
                    <CardNumberElement className={styles.inputField} />
                  </div>
                  <div className={styles.fieldContainer}>
                    <label>Expiry Date</label>
                    <CardExpiryElement className={styles.inputField} />
                  </div>
                  <div className={styles.fieldContainer}>
                    <label>CVC</label>
                    <CardCvcElement className={styles.inputField} />
                  </div>
                  {cardError && <div className={styles.error}>{cardError}</div>}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing…" : "Place Order"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
