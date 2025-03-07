import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import styles from "./Notification.module.css"; // Import the CSS module

const Notifications = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(firestore, "Users", uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setEmailNotifications(data.emailNotifications || false);
          setSmsNotifications(data.smsNotifications || false);
        }
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(firestore, "Users", uid);
      try {
        await updateDoc(userDocRef, { emailNotifications, smsNotifications });
        setMessage("Notification settings updated successfully!");
      } catch (error: any) {
        setMessage("Error updating notifications: " + error.message);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Notifications</h3>
      {message && <p className={styles.message}>{message}</p>}
      <form
        className={styles.formContainer}
        onSubmit={handleUpdateNotifications}
      >
        <div className={styles.checkboxContainer}>
          <label>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
            />{" "}
            Email Notifications
          </label>
        </div>
        <div className={styles.checkboxContainer}>
          <label>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(e) => setSmsNotifications(e.target.checked)}
            />{" "}
            SMS Notifications
          </label>
        </div>
        <button type="submit" className={styles.button}>
          Update Notifications
        </button>
      </form>
    </div>
  );
};

export default Notifications;
