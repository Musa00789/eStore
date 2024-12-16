import React, { useState, useEffect } from "react";
import { firestore, auth } from "../../../firebase";
import { getDoc, doc, updateDoc } from "@firebase/firestore";
import { useNavigate } from "react-router-dom";
import profile from "../../../assets/profile.jpg";
import styles from "./Profile.module.css";

const Profile = () => {
  const [userData, setUserData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const uid: any = auth.currentUser?.uid;
        if (!uid) {
          navigate("/Login");
          return;
        }
        const docRef = doc(firestore, "Users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setName(data.name || "");
          setPhone(data.phone || "");
          setStatus(data.status || "");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    getProfile();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/Login");
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const uid: any = auth.currentUser?.uid;
      const docRef = doc(firestore, "Users", uid);

      await updateDoc(docRef, {
        name,
        phone,
        status,
      });

      setUserData((prevData: any) => ({
        ...prevData,
        name,
        phone,
        status,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className={styles.profileContainer}>
      {/* Profile Card */}
      <div className={styles.profileCard}>
        <img src={profile} className={styles.profilePic} alt="Profile" />
        <h1 className={styles.greetings}>
          Welcome,{" "}
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          ) : (
            userData.name
          )}
        </h1>
        <div className={styles.detailsContainer}>
          <h2 className={styles.dataTitle}>Email:</h2>
          <p className={styles.userData}>{userData.email}</p>

          <h2 className={styles.dataTitle}>Contact:</h2>
          {isEditing ? (
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.inputField}
            />
          ) : (
            <p className={styles.userData}>{userData.phone}</p>
          )}

          <h2 className={styles.dataTitle}>Status:</h2>
          {isEditing ? (
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={styles.inputField}
            />
          ) : (
            <p className={styles.userData}>{userData.status}</p>
          )}
        </div>

        {/* Buttons */}
        <div className={styles.buttonContainer}>
          {isEditing ? (
            <>
              <button className={styles.saveButton} onClick={handleSave}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className={styles.editButton} onClick={handleEdit}>
              Edit Profile
            </button>
          )}
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
