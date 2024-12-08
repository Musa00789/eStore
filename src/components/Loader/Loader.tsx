import React from "react";
import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loadingContainer}>
      <span className={styles.spinner}></span> {/* Add spinner styling */}
    </div>
  );
};
export default Loader;
