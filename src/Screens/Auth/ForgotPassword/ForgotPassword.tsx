import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
import Footer from "../../../components/Footer/Footer";
import styles from "./ForgotPassword.module.css";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { FaHome } from "react-icons/fa";
import * as Yup from "yup";
import { ForgotPasswordSchema } from "../../../components/FormValidations/Validations";

// Validation schema for email only

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState("");

  // Handle Password Reset
  const handleForgotPassword = async (values: any, { setSubmitting }: any) => {
    const { email } = values;

    try {
      await sendPasswordResetEmail(auth, email);
      setStatusMessage("Password reset link sent! Check your email.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setStatusMessage("Failed to send reset email. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className={styles.main}>
      <div className={styles.glassView}>
        <button
          className={styles.homeBtn}
          onClick={() => {
            navigate("/");
          }}
        >
          <FaHome />
        </button>

        <h1 className={styles.heading}>Reset Your Password</h1>

        {/* Formik for handling email input */}
        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleForgotPassword}
        >
          {({ isSubmitting }) => (
            <Form className={styles.inputContainer}>
              <div>
                <Field
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="error" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.btn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending link..." : "Send Reset Link"}
              </button>

              {/* Status message (Success/Error) */}
              {statusMessage && (
                <p
                  className={
                    statusMessage.includes("Failed")
                      ? styles.error
                      : styles.success
                  }
                >
                  {statusMessage}
                </p>
              )}
            </Form>
          )}
        </Formik>

        {/* Back to Login */}
        <p className={styles.signup}>
          Remember your password?{" "}
          <span onClick={() => navigate("/Login")} className={styles.signupBtn}>
            Log In
          </span>
        </p>

        {/* New User Signup */}
        <p className={styles.signup}>
          New to us?{" "}
          <span
            onClick={() => navigate("/Signup")}
            className={styles.signupBtn}
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* Footer Component */}
      {/* <Footer /> */}
    </div>
  );
};

export default ForgotPassword;
