import React, { useState, useEffect } from "react";
import { firestore, auth } from "../../../firebase";
import { getDoc, doc } from "@firebase/firestore";
import profile from "../../../assets/profile.jpg";
import styles from "./Profile.module.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const uid: any = auth.currentUser?.uid;
        const docRef = doc(firestore, "Users", uid);
        const docSnap = await getDoc(docRef);
        console.log(docSnap.data());
        await setUserData(docSnap.data());
      } catch (er) {
        const uid: any = auth.currentUser?.uid;
        if (!uid) {
          navigate("/Login");
        }
      }
    };
    getProfile();
  }, []);

  return (
    <div>
      <img src={profile} className={styles.profilePic} />
      <h1 className={styles.greetings}>Welcome, {userData.name}</h1>
      <h1 className={styles.userDetails}>Details</h1>
      <h1 className={styles.dataTitle}>Email:</h1>
      <h2 className={styles.userData}>{userData.email}</h2>
      <h1 className={styles.dataTitle}>Contact:</h1>
      <h2 className={styles.userData}>{userData.phone}</h2>
      <h1 className={styles.dataTitle}>Status:</h1>
      <h2 className={styles.userData}>{userData.status}</h2>
    </div>
  );
};
export default Profile;
