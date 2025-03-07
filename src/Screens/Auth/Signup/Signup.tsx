import React from "react";
import styles from "./Signup.module.css";
import { auth, firestore } from "../../../firebase";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { doc, setDoc } from "@firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { Formik, Field, ErrorMessage, Form } from "formik";
import { SignUpValidationSchema } from "../../../components/FormValidations/Validations";

const Signup = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const userId = credentials.user.uid;

      await setDoc(doc(firestore, "Users", userId), {
        name: values.name,
        phone: values.phone,
        email: values.email,
        status: values.status,
      });

      console.log("User registered successfully");
      if (values.status === "Seller") {
        navigate("/Seller");
      } else if (values.status === "Admin") {
        navigate("/Admin");
      } else {
        navigate("/Buyer");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.glassView}>
        <button
          className={styles.backButton}
          onClick={() => {
            navigate(-1);
          }}
        >
          <FaArrowLeft />
        </button>
        <h1 className={styles.heading}>Sign Up</h1>
        <Formik
          initialValues={{
            name: "",
            phone: "",
            email: "",
            password: "",
            status: "Admin",
          }}
          validationSchema={SignUpValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className={styles.inputContainer}>
              <label htmlFor="name" className={styles.inputLabel}>
                Name
              </label>
              <Field
                className={styles.inputFields}
                name="name"
                placeholder="Enter your name"
              />
              <ErrorMessage name="name" component="div" className="error" />

              <label htmlFor="phone" className={styles.inputLabel}>
                Phone
              </label>
              <Field
                className={styles.inputFields}
                name="phone"
                placeholder="Enter your phone number"
              />
              <ErrorMessage name="phone" component="div" className="error" />

              <label htmlFor="email" className={styles.inputLabel}>
                Email
              </label>
              <Field
                className={styles.inputFields}
                name="email"
                type="email"
                placeholder="Enter your email"
              />
              <ErrorMessage name="email" component="div" className="error" />

              <label htmlFor="password" className={styles.inputLabel}>
                Password
              </label>
              <Field
                className={styles.inputFields}
                name="password"
                type="password"
                placeholder="Enter your password"
              />
              <ErrorMessage name="password" component="div" className="error" />

              <label htmlFor="status" className={styles.inputLabel}>
                User Type
              </label>
              <div className={styles.userTypeSelection}>
                <label className={styles.radioLabel}>
                  <Field
                    className={styles.radioInput}
                    type="radio"
                    name="status"
                    value="Seller"
                  />
                  <h6>Seller</h6>
                </label>
                <label className={styles.radioLabel}>
                  <Field
                    className={styles.radioInput}
                    type="radio"
                    name="status"
                    value="Buyer"
                  />
                  <h6>Buyer</h6>
                </label>
              </div>
              <ErrorMessage name="status" component="div" className="error" />

              <button
                className={styles.btn}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;
