import React, { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import styles from "./Checkout.module.css";
import { CheckOutValidationSchema } from "../../../components/FormValidations/Validations";
import { auth, firestore } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Footer from "../../../components/Footer/Footer";
import { FaHome } from "react-icons/fa";
import Header from "../../../components/Header/Header";
import { useLocation, useNavigate } from "react-router-dom";

const CheckoutForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state;

  // Handle missing state scenario
  useEffect(() => {
    if (!item || !item.price) {
      alert("No item data found, redirecting to home.");
      navigate("/");
    }
  }, [item, navigate]);

  // State for user data
  const [user, setUser] = useState<any>(null);

  // Set initial values with item price & pre-calculate amounts
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

  // Fetch user data and fill user-specific fields WITHOUT resetting amounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const userRef = doc(firestore, "Users", uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);

          // Only update user-specific fields, keep amounts intact
          setInitialValues((prev) => ({
            ...prev,
            name: userData.name || "",
            email: userData.email || "",
            address: userData.address || "",
            phone: userData.phone || "",
          }));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <button
        style={{
          margin: "10px",
          borderRadius: "10px",
        }}
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
          onSubmit={(values, { setSubmitting, resetForm }) => {
            console.log("Submitting values:", values);
            setTimeout(() => {
              alert("Order placed successfully!");
              setSubmitting(false);
              navigate("/Buyer/cart");
              // resetForm({
              //   values: {
              //     ...initialValues,
              //   },
              // });
            }, 1000);
          }}
        >
          {({ values, isSubmitting }) => (
            <Form className={styles.form}>
              <div className={styles.fieldGrid}>
                {/* Base Amount Field */}
                <div className={styles.fieldContainer}>
                  <label htmlFor="baseAmount">Base Amount</label>
                  <Field
                    name="baseAmount"
                    type="number"
                    className={styles.inputField}
                    readOnly
                  />
                </div>

                {/* Taxes */}
                <div className={styles.fieldContainer}>
                  <label htmlFor="taxes">Taxes (18%)</label>
                  <Field
                    name="taxes"
                    type="number"
                    className={styles.inputField}
                    readOnly
                  />
                </div>

                {/* Net Amount */}
                <div className={styles.fieldContainer}>
                  <label htmlFor="netAmount">Net Amount (Base - Tax)</label>
                  <Field
                    name="netAmount"
                    type="number"
                    className={styles.inputField}
                    readOnly
                  />
                </div>

                {/* Total Amount */}
                <div className={styles.fieldContainer}>
                  <label htmlFor="totalAmount">Total Amount (Base + Tax)</label>
                  <Field
                    name="totalAmount"
                    type="number"
                    className={styles.inputField}
                    readOnly
                  />
                </div>

                {/* User Fields */}
                <div className={styles.fieldContainer}>
                  <label htmlFor="name">Name</label>
                  <Field
                    name="name"
                    type="text"
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label htmlFor="email">Email</label>
                  <Field
                    name="email"
                    type="email"
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label htmlFor="address">Address</label>
                  <Field
                    name="address"
                    type="text"
                    className={styles.inputField}
                  />
                </div>
                <div className={styles.fieldContainer}>
                  <label htmlFor="phone">Phone Number</label>
                  <Field
                    name="phone"
                    type="text"
                    className={styles.inputField}
                  />
                </div>

                {/* Payment Method */}
                <div
                  className={styles.fieldContainer}
                  style={{ gridColumn: "span 2" }}
                >
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <Field
                    as="select"
                    name="paymentMethod"
                    className={styles.inputField}
                  >
                    <option value="COD">COD</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Paypal">Paypal</option>
                    <option value="Stripe">Stripe</option>
                  </Field>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </button>
            </Form>
          )}
        </Formik>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutForm;
