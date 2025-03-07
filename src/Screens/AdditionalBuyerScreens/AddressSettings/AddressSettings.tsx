import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import styles from "./AddressSettings.module.css"; // Import the CSS module

const AddressSettings = () => {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateValue, setStateValue] = useState("");
  const [zip, setZip] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAddress = async () => {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const userDocRef = doc(firestore, "Users", uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setAddress(data.address || "");
          setCity(data.city || "");
          setStateValue(data.state || "");
          setZip(data.zip || "");
        }
      }
    };

    fetchAddress();
  }, []);

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(firestore, "Users", uid);
      try {
        await updateDoc(userDocRef, { address, city, state: stateValue, zip });
        setMessage("Address updated successfully!");
      } catch (error: any) {
        setMessage("Error updating address: " + error.message);
      }
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Address Settings</h3>
      {message && <p className={styles.message}>{message}</p>}
      <form className={styles.formContainer} onSubmit={handleUpdateAddress}>
        <label>
          Address:
          <input
            type="text"
            className={styles.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>
        <label>
          City:
          <input
            type="text"
            className={styles.input}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </label>
        <label>
          State:
          <input
            type="text"
            className={styles.input}
            value={stateValue}
            onChange={(e) => setStateValue(e.target.value)}
            required
          />
        </label>
        <label>
          Zip Code:
          <input
            type="text"
            className={styles.input}
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            required
          />
        </label>
        <button type="submit" className={styles.button}>
          Update Address
        </button>
      </form>
    </div>
  );
};

export default AddressSettings;
