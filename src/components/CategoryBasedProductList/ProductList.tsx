import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProductList.module.css";
import { FaArrowRight, FaCartPlus, FaEye } from "react-icons/fa6";
import { addToCart } from "../addToCart";
import Loader from "../Loader/Loader";

const ProductList = ({ products, searchQuery, productType }: any) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const filteredProducts = products
    .filter(
      (product: any) =>
        product.type === productType &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 7);
  const filteredAllProducts = products.filter(
    (product: any) =>
      product.type === productType &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <p className={styles.productPrice}>
              Rs. {product.price === "" ? "0.00" : product.price}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <button
              onClick={() => {
                navigate(`/product/${product.name}`, { state: product });
              }}
              className={styles.handlersBtn}
              style={{
                width:
                  product.type === "Property" ||
                  product.type === "Bike" ||
                  product.type === "Vehicle" ||
                  product.type === "Furniture"
                    ? "200px" // Full width if Add to Cart is hidden
                    : "100px", // Split width if Add to Cart is shown
              }}
            >
              <FaEye />
            </button>

            {/* Add to Cart button (conditionally shown) */}
            {!(
              product.type === "Property" ||
              product.type === "Bike" ||
              product.type === "Vehicle" ||
              product.type === "Furniture"
            ) && (
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await addToCart(product);
                  } catch (error) {
                    console.error("Error adding to cart:", error);
                  }
                  setLoading(false);
                }}
                className={styles.handlersBtn}
                style={{ width: "100px" }} // Match width with Eye button
              >
                <FaCartPlus />
              </button>
            )}
          </div>
        </div>
      ))}

      {showViewAllButton && (
        <button
          className={styles.viewAllBtn}
          onClick={() =>
            navigate("/allSameCategoryProducts", { state: filteredAllProducts })
          }
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

      {loading && <Loader />}
    </div>
  );
};

export default ProductList;
