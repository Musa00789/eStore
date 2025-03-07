import React, { useState } from "react";
import { auth } from "../../../firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import styles from "./ChangePassword.module.css";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirmation do not match");
      return;
    }

    const user = auth.currentUser;
    if (user && user.email) {
      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setMessage("Password updated successfully!");
        setCurrentPassword("");
        setConfirmPassword("");
        setNewPassword("");
      } catch (error: any) {
        setMessage("Error updating password: " + error.message);
      }
    } else {
      setMessage("No user is logged in.");
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Change Password</h3>
      {message && <p className={styles.message}>{message}</p>}
      <form className={styles.formContainer} onSubmit={handleChangePassword}>
        <label>
          Current Password:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Confirm New Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Change Password</button>
      </form>
    </div>
  );
};

export default ChangePassword;
