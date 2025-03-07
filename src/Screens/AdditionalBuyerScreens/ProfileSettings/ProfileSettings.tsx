import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import styles from "./ProfileSettings.module.css"; // Import the CSS module

const ProfileSettings = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(firestore, "Users", uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
        }
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(firestore, "Users", uid);
      try {
        await updateDoc(userDocRef, { name, phone });
        setMessage("Profile updated successfully!");
      } catch (error: any) {
        setMessage("Error updating profile: " + error.message);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Profile Settings</h3>
      {message && <p className={styles.message}>{message}</p>}
      <form className={styles.formContainer} onSubmit={handleUpdateProfile}>
        <label>
          Name:
          <input
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Phone:
          <input
            type="text"
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <button type="submit" className={styles.button}>
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
