import React, { useState } from "react";
import styles from "./Signup.module.css";
import { auth, firestore } from "../../firebase";
import { createUserWithEmailAndPassword } from "@firebase/auth";
import { doc, setDoc } from "@firebase/firestore";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [user, setUser] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const getUserData = (event: any) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      ).then(async (credentials) => {
        const userId = credentials.user.uid;
        await setDoc(doc(firestore, "Users", userId), {
          name: user.name,
          phone: user.phone,
          email: user.email,
          status: "User",
        }).then(() => {
          navigate("/Home");
        });
      });
    } catch (error) {
      const errorMessage = error;
      alert(`${errorMessage}`);
    }
  };
  return (
    <div className={styles.main}>
      <div className={styles.glassView}>
        <h1 className={styles.heading}>Sign Up</h1>
        <form className={styles.inputContainer} onSubmit={handleSubmit}>
          <input
            className={styles.inputFields}
            name="name"
            placeholder="Enter your name"
            required
            value={user.name}
            onChange={getUserData}
          />
          <input
            className={styles.inputFields}
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            required
            value={user.phone}
            onChange={getUserData}
          />
          <input
            className={styles.inputFields}
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={user.email}
            onChange={getUserData}
          />
          <input
            className={styles.inputFields}
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="off"
            required
            value={user.password}
            onChange={getUserData}
          />
          <button className={styles.btn} type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
