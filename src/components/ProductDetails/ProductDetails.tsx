import React from "react";
import styles from "./ProductDetails.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "@firebase/firestore";
import { useLocation } from "react-router-dom";
import { firestore } from "../../firebase";
import Header from "../Header/Header";
import { FaMailBulk } from "react-icons/fa";
import { FaCartPlus, FaMessage } from "react-icons/fa6";

const ProductDetails = () => {
  const location = useLocation();
  const { productName } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState(location.state || null);

  React.useEffect(() => {
    if (!product) {
      const fetchProduct = async () => {
        try {
          if (!productName) {
            console.log("Product name is undefined!");
            navigate("/error");
            return;
          }
          const productRef = doc(firestore, "Products", productName);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            setProduct(productSnap.data());
          } else {
            console.log("No such document!");
            navigate("/error");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          navigate("/error");
        }
      };

      fetchProduct();
    }
  }, [product, productName, navigate]);

  const handleAddToCart = () => {
    console.log("Add to Cart clicked!", product);
    // add-to-cart here
  };

  const handleContactSeller = () => {
    console.log("Contact Seller clicked!");
    // contact seller logic, open a chat
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div>
      {/* <div style={{ backgroundColor: "red" }}> 
        <Header />
      </div> */}
      <div className={styles.productDetailsContainer}>
        <img
          className={styles.productImage}
          src={product.images[0]}
          alt={product.name}
        />
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productPrice}>Rs. {product.price}</p>
          <p className={styles.productDescription}>
            <b> Description:</b> {product.description}
          </p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              Add to Cart{" "}
              <FaCartPlus
                style={{
                  fontSize: "20px",
                  marginLeft: "5px",
                  marginTop: "-2px",
                }}
              />
            </button>
            <button
              className={styles.contactSellerButton}
              onClick={handleContactSeller}
            >
              Contact Seller{" "}
              <FaMessage
                style={{
                  fontSize: "20px",
                  marginLeft: "5px",
                  marginTop: "-2px",
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
