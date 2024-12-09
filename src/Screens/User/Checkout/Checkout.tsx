import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import styles from "./Checkout.module.css";

const Checkout = () => {
  const initialValues = {
    name: "",
    email: "",
    address: "",
    phone: "",
    totalAmount: 0,
    taxes: 0,
    amountPayable: 0,
    paymentMethod: "COD",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    address: Yup.string()
      .min(10, "Address must be at least 10 characters")
      .required("Address is required"),
    phone: Yup.string()
      .matches(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits")
      .required("Phone number is required"),
    totalAmount: Yup.number()
      .positive("Total amount must be positive")
      .required("Total amount is required"),
    taxes: Yup.number()
      .positive("Taxes must be positive")
      .required("Taxes are required"),
    amountPayable: Yup.number()
      .positive("Amount payable must be positive")
      .required("Amount payable is required"),
    paymentMethod: Yup.string()
      .oneOf(
        ["COD", "Debit Card", "Credit Card", "Paypal", "Stripe"],
        "Invalid payment method"
      )
      .required("Payment method is required"),
  });

  const handleSubmit = (values: any, { setSubmitting }: any) => {
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2));
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Checkout</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className={styles.formContainer}>
            <div className={styles.fieldContainer}>
              <label htmlFor="name">Name</label>
              <Field name="name" type="text" className={styles.inputField} />
              <ErrorMessage
                name="name"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.fieldContainer}>
              <label htmlFor="email">Email</label>
              <Field name="email" type="email" className={styles.inputField} />
              <ErrorMessage
                name="email"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.fieldContainer}>
              <label htmlFor="address">Address</label>
              <Field name="address" type="text" className={styles.inputField} />
              <ErrorMessage
                name="address"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.fieldContainer}>
              <label htmlFor="phone">Phone Number</label>
              <Field name="phone" type="text" className={styles.inputField} />
              <ErrorMessage
                name="phone"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.fieldContainer}>
              <label htmlFor="totalAmount">Total Amount</label>
              <Field
                name="totalAmount"
                type="number"
                className={styles.inputField}
              />
              <ErrorMessage
                name="totalAmount"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.fieldContainer}>
              <label htmlFor="taxes">Taxes</label>
              <Field name="taxes" type="number" className={styles.inputField} />
              <ErrorMessage
                name="taxes"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.fieldContainer}>
              <label htmlFor="amountPayable">Amount Payable</label>
              <Field
                name="amountPayable"
                type="number"
                className={styles.inputField}
              />
              <ErrorMessage
                name="amountPayable"
                component="div"
                className={styles.error}
              />
            </div>

            <div className={styles.fieldContainer}>
              <label htmlFor="paymentMethod">Payment Method</label>
              <Field
                as="select"
                name="paymentMethod"
                className={styles.inputField}
              >
                <option value="COD">Cash on Delivery</option>
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
  );
};

export default Checkout;
