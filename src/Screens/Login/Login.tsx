import React, { useState } from "react";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth, firestore } from "../../firebase";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "@firebase/firestore";
import { FaGoogle, FaFacebook } from "react-icons/fa";

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  const getUserData = (event: any) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleLogin = async (event: any) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
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
    } catch (error: any) {
      setAttempts((prev) => prev + 1);
      alert(`Error logging in: ${error.message}`);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.glassView}>
        <h1 className={styles.heading}>Welcome Back</h1>
        <form className={styles.inputContainer} onSubmit={handleLogin}>
          <input
            placeholder="Enter email"
            className={styles.input}
            type="email"
            name="email"
            required
            value={user.email}
            onChange={getUserData}
          />
          <input
            placeholder="Enter password"
            className={styles.input}
            type="password"
            name="password"
            required
            value={user.password}
            onChange={getUserData}
          />
          <button type="submit" className={styles.btn}>
            Log In
          </button>
        </form>
        {attempts >= 2 && (
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
        )}
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
            <FaGoogle className={styles.loginWithIcon} />
          </button>
          <button className={styles.loginWithBtn}>
            <FaFacebook className={styles.loginWithIcon} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
