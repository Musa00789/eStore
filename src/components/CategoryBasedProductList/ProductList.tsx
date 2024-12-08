import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProductList.module.css";
import { FaArrowRight, FaCartPlus, FaEye } from "react-icons/fa6";
import { addToCart } from "../addToCart";

const ProductList = ({ products, searchQuery, productType }: any) => {
  const navigate = useNavigate();

  // Filter products by productType and searchQuery
  const filteredProducts = products
    .filter(
      (product: any) =>
        product.type === productType && // Match product type
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) // Match search query
    )
    .slice(0, 7); // Limit to 5 products

  const showViewAllButton =
    products.filter((product: any) => product.type === productType).length > 7;

  return (
    <div className={styles.productsContainer}>
      {filteredProducts.map((product: any, index: any) => (
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

      {/* "View All" Button */}
      {showViewAllButton && (
        <button
          className={styles.viewAllBtn}
          onClick={() => navigate("/products")} // Adjust the route for the "View All" page
        >
          View All{" "}
          <FaArrowRight
            style={{
              fontSize: "1rem",
              marginLeft: "0.5rem",
              marginTop: "0.3rem",
            }}
          />
        </button>
      )}
    </div>
  );
};

export default ProductList;
