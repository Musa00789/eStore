import React from "react";
import styles from "./Categories.module.css";
import { useLocation, useNavigate } from "react-router-dom";

const Categories = ({ products }: { products: any[] }) => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const product = location.state();
  console.log("categories" + products);

  const filterAndNavigate = (categoryName: string) => {
    try {
      console.log(products);
      const filteredProducts = products.filter(
        (product: any) => product.type === categoryName
      );
      navigate("/allSameCategoryProducts", {
        state: filteredProducts,
      });
    } catch (error) {
      console.log("Error moving forward" + error);
    }
  };

  return (
    <div>
      <h1 className={styles.bodyHeading}>All Categories</h1>
      <div className={styles.categoriesContainer}>
        <div
          className={styles.category}
          onClick={() => filterAndNavigate("Mobiles")}
        >
          <img className={styles.productImageCategory} src="/Mobile.svg" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Mobiles</h3>
          </div>
        </div>
        <div
          className={styles.category}
          onClick={() => filterAndNavigate("Vehicle")}
        >
          <img className={styles.productImageCategory} src="/Car.svg" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Vehicles</h3>
          </div>
        </div>
        <div
          className={styles.category}
          onClick={() => filterAndNavigate("Property")}
        >
          <img className={styles.productImageCategory} src="/Property.svg" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Property For Sale</h3>
          </div>
        </div>
        <div
          className={styles.category}
          onClick={() => filterAndNavigate("Fashion")}
        >
          <img className={styles.productImageCategory} src="/Fashion.png" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Fashion & Beauty</h3>
          </div>
        </div>
        <div
          className={styles.category}
          onClick={() => filterAndNavigate("Electronics")}
        >
          <img className={styles.productImageCategory} src="/Appliances.jpg" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>
              Electronics & Home Appliances
            </h3>
          </div>
        </div>
        <div
          className={styles.category}
          onClick={() => filterAndNavigate("Furniture")}
        >
          <img className={styles.productImageCategory} src="/Furniture.jpg" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Furniture & Home Decor</h3>
          </div>
        </div>
        <div
          className={styles.category}
          onClick={() => filterAndNavigate("Bike")}
        >
          <img className={styles.productImageCategory} src="/Bikes.jpg" />
          <div className={styles.productDetails}>
            <h3 className={styles.productName}>Bikes</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
