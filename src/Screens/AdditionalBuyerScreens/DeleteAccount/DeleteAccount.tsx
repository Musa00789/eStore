import React, { useState } from "react";
import { auth, firestore } from "../../../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import styles from "./DeleteAccount.module.css"; // Import the CSS module

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const userDocRef = doc(firestore, "Users", uid);
        await deleteDoc(userDocRef);
        await deleteUser(user);
        setMessage("Account deleted successfully.");
        navigate("/login");
      } else {
        setMessage("No user is logged in.");
      }
    } catch (error: any) {
      setMessage("Error deleting account: " + error.message);
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Delete Account</h3>
      {message && <p className={styles.message}>{message}</p>}
      <button className={styles.button} onClick={handleDeleteAccount}>
        Delete Account
      </button>
    </div>
  );
};

export default DeleteAccount;
