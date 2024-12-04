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
    status: "",
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
          status: user.status,
        }).then(() => {
          navigate("/");
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
          <label className={styles.inputLabel}>Name</label>
          <input
            className={styles.inputFields}
            name="name"
            placeholder="Enter your name"
            required
            value={user.name}
            onChange={getUserData}
          />
          <label className={styles.inputLabel}>Phone</label>
          <input
            className={styles.inputFields}
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            required
            value={user.phone}
            onChange={getUserData}
          />
          <label className={styles.inputLabel}>Email</label>
          <input
            className={styles.inputFields}
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            value={user.email}
            onChange={getUserData}
          />
          <label className={styles.inputLabel}>Password</label>
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
          <label className={styles.inputLabel}>User Type</label>
          <div className={styles.userTypeSelection}>
            <input
              className={styles.radioInput}
              type="radio"
              name="status"
              value="Admin"
              defaultChecked
            />
            <label className={styles.radioLabel}>Admin</label>
            <input
              className={styles.radioInput}
              type="radio"
              name="status"
              value="User"
            />
            <label className={styles.radioLabel}>User</label>
          </div>
          <button className={styles.btn} type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
