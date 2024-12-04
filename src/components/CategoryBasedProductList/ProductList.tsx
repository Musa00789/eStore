import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProductList.module.css";
import { FaCartPlus, FaEye } from "react-icons/fa6";
import { addToCart } from "../addToCart";

const ProductList = ({ products, searchQuery }: any) => {
  const navigate = useNavigate();
  return (
    <div className={styles.productsContainer}>
      {products
        .filter((product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((product: any, index: any) => (
          <div key={index} className={styles.productCard}>
            <img
              className={styles.productImage}
              src={product.images[0]}
              alt={product.name}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>
                {product.name.length > 10
                  ? `${product.name.substring(0, 10)}...`
                  : product.name}
              </h3>
              <p className={styles.productDescription}>
                {product.description.length > 25
                  ? `${product.description.substring(0, 25)}...`
                  : product.description}
              </p>
              <p className={styles.productPrice}>Rs. {product.price}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <button
                onClick={() => {
                  navigate(`/product/${product.name}`, { state: product });
                }}
                className={styles.handlersBtn}
              >
                <FaEye />
              </button>
              <button
                onClick={() => {
                  addToCart(product);
                }}
                className={styles.handlersBtn}
              >
                <FaCartPlus />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default ProductList;
