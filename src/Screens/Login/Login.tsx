import React, { useState } from "react";
import { signInWithEmailAndPassword } from "@firebase/auth";
import { auth, firestore } from "../../firebase";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "@firebase/firestore";

const Login = () => {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

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
          navigate("/Home");
        }
      } else {
        alert("User document does not exist");
      }
    } catch (error) {
      alert(`Error logging in: ${error.message}`);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.glassView}>
        <h1 className={styles.heading}>Log In</h1>
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
        <p className={styles.signup}>
          Create new account!{" "}
          <span
            onClick={() => {
              navigate("/Signup");
            }}
            className={styles.signupBtn}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};
export default Login;
