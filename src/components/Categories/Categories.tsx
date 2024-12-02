import React from "react";
import styles from "./Categories.module.css";

const Categories = () => {
  return (
    <div>
      <h1 className={styles.bodyHeading}>All Categories</h1>
      <div className={styles.categoriesContainer}>
        <div className={styles.category}>
          <img className={styles.productImageCategory} src="/logo.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Mobiles</h3>
          </div>
        </div>
        <div className={styles.category}>
          <img className={styles.productImageCategory} src="/logo.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Vehicles</h3>
          </div>
        </div>
        <div className={styles.category}>
          <img className={styles.productImageCategory} src="/logo.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Property For Sale</h3>
          </div>
        </div>
        <div className={styles.category}>
          <img className={styles.productImageCategory} src="/logo.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Fashion & Beauty</h3>
          </div>
        </div>
        <div className={styles.category}>
          <img className={styles.productImageCategory} src="/logo.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>
              Electronics & Home Appliances
            </h3>
          </div>
        </div>
        <div className={styles.category}>
          <img className={styles.productImageCategory} src="/logo.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Furniture & Home Decor</h3>
          </div>
        </div>
        <div className={styles.category}>
          <img className={styles.productImageCategory} src="/logo.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Bikes</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
