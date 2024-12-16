// ProductDetails component for displaying product details
import React, { useEffect, useState } from "react";
import styles from "./ProductDetails.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, increment } from "@firebase/firestore";
import { useLocation } from "react-router-dom";
import { auth, firestore } from "../../../firebase";
import { FaCartPlus, FaCreditCard, FaMessage, FaTruck } from "react-icons/fa6";
import Header from "../../../components/Header/Header";
import Loader from "../../../components/Loader/Loader";

const ProductDetails = () => {
  const location = useLocation();
  const { productName } = useParams();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state || null);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
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
      incrementField(product.id, "views");
      incrementField(product.id, "clicks");
      fetchProduct();
      getUser();
    }
  }, [product, productName, navigate]);

  const incrementField = async (productId: string, field: string) => {
    try {
      const productRef = doc(firestore, "Products", productId);
      await updateDoc(productRef, {
        [field]: increment(1),
      });
    } catch (error) {
      console.error(`Error incrementing ${field}:`, error);
    }
  };

  const handleAddToCart = () => {
    console.log("Add to Cart clicked!", product);
    // Implement add-to-cart logic here
  };

  const handleSizeChange = (size: any) => {
    setSelectedSize(size);
  };

  const handleContactSeller = () => {
    if (product) {
      console.log("Contact Seller clicked!", product);
      navigate("/User/chat", {
        state: {
          sellerId: product.sellerId,
          productName: product.name,
          productId: product.id,
        },
      });
    }
  };
  const getUser = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const docRef = doc(firestore, "Users", uid);
      const docSnap: any = await getDoc(docRef);
      setUser(docSnap.data());
    } catch (error) {
      navigate("/error");
    }
  };

  if (!product) return <Loader />;

  return (
    <div>
      <Header user={user} />
      <div className={styles.productDetailsContainer}>
        <img
          className={styles.productImage}
          src={product.images[0]}
          alt={product.name}
        />
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productPrice}>Rs. {product.price}</p>
          <p className={styles.productDescription}>{product.description}</p>
          <div className={styles.buttonGroup}>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              <FaCartPlus
                style={{
                  marginRight: "5px",
                  marginTop: "-2px",
                  fontSize: "1.3rem",
                }}
              />{" "}
              Add to Cart
            </button>
            <button
              className={styles.contactSellerButton}
              onClick={handleContactSeller}
            >
              <FaMessage
                style={{
                  marginRight: "5px",
                  marginTop: "-2px",
                  fontSize: "1.3rem",
                }}
              />{" "}
              Contact Seller
            </button>
          </div>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h3>
                <FaTruck
                  style={{
                    fontSize: "1.5rem",
                    marginRight: "5px",
                    marginBottom: "4px",
                  }}
                />{" "}
                Free Shipping
              </h3>
              <p>Free Shipping in Pakistan on orders above Rs.4000.</p>
            </div>
            <div className={styles.feature}>
              <h3>
                <FaCreditCard
                  style={{
                    fontSize: "1.2rem",
                    marginRight: "5px",
                    marginBottom: "4px",
                  }}
                />
                Secure Payment
              </h3>
              <p>Visa, Mastercard and Cash on Delivery are accepted.</p>
            </div>
          </div>
          <div className={styles.sizeSection}>
            <h3>Size: {selectedSize}</h3>
            <div className={styles.sizeOptions}>
              {product.Size?.map((size: string, index: number) => (
                <button
                  key={index}
                  className={`${styles.sizeButton} ${
                    size === selectedSize ? styles.selectedSizeButton : ""
                  }`}
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
