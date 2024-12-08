import React from "react";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth, firestore } from "../../firebase";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "@firebase/firestore";
import { FaGoogle, FaFacebook, FaHome } from "react-icons/fa";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { LoginValidationSchema } from "../../components/FormValidations/Validations";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (
    values: any,
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const userDoc = await getDoc(
        doc(firestore, "Users", userCredential.user.uid)
      );

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userStatus = userData?.status;

        if (userStatus === "Admin") {
          navigate("/Admin");
        } else {
          navigate("/");
        }
      } else {
        alert("User document does not exist");
      }
    } catch (error) {
      setFieldError("password", "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
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
        <h1 className={styles.heading}>Welcome Back</h1>
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={LoginValidationSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className={styles.inputContainer}>
              <div>
                <Field
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="Enter email"
                />
                <ErrorMessage name="email" component="div" className="error" />
              </div>
              <div>
                <Field
                  className={styles.input}
                  type="password"
                  name="password"
                  placeholder="Enter password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error"
                />
              </div>
              <button
                type="submit"
                className={styles.btn}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in ..." : "Log In"}
              </button>
            </Form>
          )}
        </Formik>
        <p className={styles.signup}>
          Forgot your password?{" "}
          <span
            onClick={() => {
              navigate("/ForgotPassword");
            }}
            className={styles.signupBtn}
          >
            Reset it
          </span>
        </p>
        <p className={styles.signup}>
          New to us?{" "}
          <span
            onClick={() => {
              navigate("/Signup");
            }}
            className={styles.signupBtn}
          >
            Sign Up
          </span>
        </p>
        <div>
          <button className={styles.loginWithBtn}>
            <FaGoogle className={styles.loginWithIcon} /> Login with Google
          </button>
          <button className={styles.loginWithBtn}>
            <FaFacebook className={styles.loginWithIcon} /> Login with Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
