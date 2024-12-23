import React, { useEffect, useState } from "react";
import styles from "./ProductDetails.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc, increment, getDoc } from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import { FaCartPlus, FaCreditCard, FaMessage, FaTruck } from "react-icons/fa6";
import Header from "../../../components/Header/Header";
import Loader from "../../../components/Loader/Loader";
import { addToCart } from "../../../components/addToCart";
import { FaInfoCircle } from "react-icons/fa";

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state; // Product object from navigation state

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!product) {
      console.error("No product data received!");
      navigate("/error");
      return;
    }
    setSelectedImage(product.images[0]); // Set first image as default
    incrementField(product.id, "views"); // Increment views
    incrementField(product.id, "clicks"); // Increment clicks
    fetchUser();
  }, [product, navigate]);

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
    if (product) {
      addToCart(product);
      alert("Added to cart!");
    }
  };

  const handleContactSeller = () => {
    navigate("/User/chat", {
      state: {
        sellerId: product.sellerId,
        productName: product.name,
        productId: product.id,
      },
    });
  };

  const handleGetQuotes = () => {
    alert("Get Quotes functionality coming soon!");
  };

  const fetchUser = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const userRef = doc(firestore, "Users", uid);
      const userSnap: any = await getDoc(userRef);
      setUser(userSnap.data());
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const renderCategorySpecificContent = () => {
    switch (product.type) {
      case "Fashion":
        return (
          <div className={styles.sizeSection}>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              <FaCartPlus /> Add to Cart
            </button>
            <h3>Select Size:</h3>
            <div className={styles.sizeOptions}>
              {product.Size?.map((size: string, index: number) => (
                <button
                  key={index}
                  className={`${styles.sizeButton} ${
                    size === selectedSize ? styles.selectedSizeButton : ""
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        );
      case "Bike":
      case "Vehicle":
        return (
          <button
            className={styles.viewDetailsButton}
            onClick={() => navigate("/vehicle-details", { state: product })}
          >
            View Details
          </button>
        );
      case "Mobiles":
        return (
          <div>
            <button
              className={styles.specificationsButton}
              onClick={() => alert("Specifications coming soon!")}
            >
              <FaInfoCircle /> View Specifications
            </button>
            <table className={styles.specificationsTable}>
              <tbody>
                <tr>
                  <td>Brand:</td>
                  <td>{product.brand}</td>
                </tr>
                <tr>
                  <td>Model:</td>
                  <td>{product.model}</td>
                </tr>
                <tr>
                  <td>Warranty:</td>
                  <td>{product.warranty || "No Warranty"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "Property":
        return (
          <div>
            <button
              className={styles.contactSellerButton}
              onClick={handleContactSeller}
            >
              Contact Seller
            </button>
            <button
              className={styles.getQuotesButton}
              onClick={handleGetQuotes}
            >
              Get Quotes
            </button>
            <p className={styles.productDescription}>{product.description}</p>
          </div>
        );
      case "Electronics":
      case "Furniture":
        return (
          <button className={styles.addToCartButton} onClick={handleAddToCart}>
            <FaCartPlus /> Add to Cart
          </button>
        );
      default:
        return null;
    }
  };

  if (!product) return <Loader />;

  return (
    <div>
      <Header user={user} />
      <div className={styles.productDetailsContainer}>
        {/* Image Gallery */}
        <div className={styles.imageGallery}>
          <img
            className={styles.productImage}
            src={selectedImage || ""}
            alt={product.name}
          />
          <div className={styles.thumbnailContainer}>
            {product.images?.map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt="Thumbnail"
                className={`${styles.thumbnail} ${
                  image === selectedImage ? styles.selectedThumbnail : ""
                }`}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.productInfo}>
          <h1 className={styles.productName}>{product.name}</h1>
          <p className={styles.productPrice}>Rs. {product.price}</p>
          <p className={styles.productDescription}>{product.description}</p>
          <div className={styles.buttonGroup}>
            {renderCategorySpecificContent()}
          </div>
          {product.type === "Property" ||
          product.type === "Bike" ||
          product.type === "Vehicle" ? (
            <div>
              <p>
                More details about the product can be obtained by contacting the
                seller as the products cannot be delivered by the company
              </p>
            </div>
          ) : (
            <div className={styles.features}>
              <div
                style={{ backgroundColor: "#c5c5c5" }}
                className={styles.feature}
              >
                <FaTruck
                  size={34}
                  style={{
                    // fontSize: "1.5rem",
                    marginRight: "5px",
                    marginBottom: "4px",
                  }}
                />{" "}
                Free Shipping in Pakistan on orders above Rs.4000.
              </div>
              <div
                style={{ backgroundColor: "#cecece" }}
                className={styles.feature}
              >
                <FaCreditCard
                  size={34}
                  style={{
                    // fontSize: "1.2rem",
                    marginRight: "5px",
                    marginBottom: "4px",
                  }}
                />{" "}
                Visa, Mastercard and Cash on Delivery are accepted.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
