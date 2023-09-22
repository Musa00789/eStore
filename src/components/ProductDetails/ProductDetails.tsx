import React from "react";
import styles from "./ProductDetails.module.css";
import { FaXmark, FaBucket, FaCartPlus } from "react-icons/fa6";

const ProductDetails = ({ product, onClose }: any) => {
  return (
    <div className={styles.productDetailsContainer}>
      <div className={styles.productDetailsContent}>
        <button onClick={onClose} className={styles.closeButton}>
          <FaXmark />
        </button>
        <h2 className={styles.productName}>{product.name}</h2>
        <img
          src={product.images[0]}
          alt={product.name}
          className={styles.productImage}
        />
        <h4>Details:</h4>
        <p>
          {product.description && product.description.length > 80
            ? `${product.description.substring(0, 70)}...`
            : product.description}
        </p>
        <p>
          <h5>Price:</h5> Rs. {product.price}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          <button className={styles.buyBtn}>
            Buy <FaBucket />
          </button>
          <button className={styles.buyBtn}>
            Add to cart <FaCartPlus />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
