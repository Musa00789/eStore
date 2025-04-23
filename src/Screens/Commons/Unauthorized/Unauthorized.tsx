import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Unauthorized.module.css";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Access Denied</h1>
      <p className={styles.description}>
        Our payment validation indicates your subscription is{" "}
        <strong>inactive</strong>. To restore full access and get the site up
        and running, please contact the developer.
      </p>
      <div className={styles.actions}>
        <a href="mailto:mmusadar@example.com" className={styles.contactLink}>
          Contact Developer
        </a>
        {/* <button onClick={() => navigate("/")} className={styles.homeBtn}>
          Return to Home
        </button> */}
      </div>
    </div>
  );
};

export default Unauthorized;
