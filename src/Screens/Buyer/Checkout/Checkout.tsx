import React, { useEffect, useState } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import styles from "./Checkout.module.css";
import { CheckOutValidationSchema } from "../../../components/FormValidations/Validations";
import { auth, firestore } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Footer from "../../../components/Footer/Footer";
import { FaHome } from "react-icons/fa";
import Header from "../../../components/Header/Header";

const CheckoutForm: React.FC = () => {
  const [initialValues, setInitialValues] = useState({
    baseAmount: "",
    taxes: "",
    netAmount: "",
    totalAmount: "",
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentMethod: "COD",
  });
  const [user, setUser] = useState<any>();

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
      <Header user={user} />
      <button
        style={{
          margin: "10px",
          borderRadius: "10px",
        }}
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
              resetForm();
            }, 1000);
          }}
        >
          {({ values, setFieldValue, isSubmitting }) => {
            useEffect(() => {
              const base = parseFloat(values.baseAmount);
              if (!isNaN(base)) {
                const tax = base * 0.18;
                setFieldValue("taxes", parseFloat(tax.toFixed(2)));
                setFieldValue("netAmount", parseFloat((base - tax).toFixed(2)));
                setFieldValue(
                  "totalAmount",
                  parseFloat((base + tax).toFixed(2))
                );
              }
            }, [values.baseAmount, setFieldValue]);

            return (
              <Form className={styles.form}>
                <div className={styles.fieldGrid}>
                  <div className={styles.fieldContainer}>
                    <label htmlFor="baseAmount">Base Amount</label>
                    <Field
                      name="baseAmount"
                      type="number"
                      className={styles.inputField}
                    />
                    <ErrorMessage
                      name="baseAmount"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div className={styles.fieldContainer}>
                    <label htmlFor="taxes">Taxes (18%)</label>
                    <Field
                      name="taxes"
                      type="number"
                      className={styles.inputField}
                      readOnly
                    />
                    <ErrorMessage
                      name="taxes"
                      component="div"
                      className={styles.error}
                    />
                  </div>

                  <div className={styles.fieldContainer}>
                    <label htmlFor="netAmount">Net Amount (Base - Tax)</label>
                    <Field
                      name="netAmount"
                      type="number"
                      className={styles.inputField}
                      readOnly
                    />
                    <ErrorMessage
                      name="netAmount"
                      component="div"
                      className={styles.error}
                    />
                  </div>
                  <div className={styles.fieldContainer}>
                    <label htmlFor="totalAmount">
                      Total Amount (Base + Tax)
                    </label>
                    <Field
                      name="totalAmount"
                      type="number"
                      className={styles.inputField}
                      readOnly
                    />
                    <ErrorMessage
                      name="totalAmount"
                      component="div"
                      className={styles.error}
                    />
                  </div>

                  <div className={styles.fieldContainer}>
                    <label htmlFor="name">Name</label>
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
                    <label htmlFor="email">Email</label>
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
                    <label htmlFor="address">Address</label>
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
                    <label htmlFor="phone">Phone Number</label>
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

                  {/* Payment Method spans both columns */}
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
                    <ErrorMessage
                      name="paymentMethod"
                      component="div"
                      className={styles.error}
                    />
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
            );
          }}
        </Formik>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutForm;
