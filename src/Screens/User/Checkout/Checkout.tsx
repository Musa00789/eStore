import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import styles from "./Checkout.module.css";
import { CheckOutValidationSchema } from "../../../components/FormValidations/Validations";

const Checkout = (item: any) => {
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
        validationSchema={CheckOutValidationSchema}
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
