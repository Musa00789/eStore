import React, { useEffect, useState } from "react";
import styles from "./ProductDetails.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, updateDoc, increment, getDoc } from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import {
  FaCartPlus,
  FaCreditCard,
  FaMessage,
  FaPhone,
  FaTruck,
} from "react-icons/fa6";
import Header from "../../../components/Header/Header";
import Loader from "../../../components/Loader/Loader";
import { addToCart } from "../../../components/addToCart";
import { FaInfoCircle } from "react-icons/fa";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Footer from "../../../components/Footer/Footer";

const ProductDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state;

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    console.log("Product Details:", product);
    if (!product) {
      console.error("No product data received!");
      navigate("/error");
      return;
    }
    setSelectedImage(product.images[0]);
    incrementField(product.id, "views");
    incrementField(product.id, "clicks");
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
    if (!auth.currentUser?.uid) {
      alert("Login to chat with the seller");
      return;
    }
    navigate("/Buyer/chat", {
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
  const formatPrice = (price: number) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
  const extractCoordinates = (url: string) => {
    console.log("url", url);
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    console.log("match", match);
    if (match) {
      console.log("match", match);
      return {
        lat: parseFloat(match[1]),
        lng: parseFloat(match[2]),
      };
    }
    return null;
  };

  const renderMapFromUrl = (url: string) => {
    const coordinates = extractCoordinates(url);

    if (!coordinates) {
      return <p>Invalid location URL</p>;
    }

    const { lat, lng } = coordinates;

    const { isLoaded } = useJsApiLoader({
      googleMapsApiKey: "AIzaSyCGXjH2olWHaRbJBH4SRNGmYfX60skyWs8",
    });

    if (!isLoaded) return <Loader />;

    return (
      <GoogleMap
        mapContainerClassName={styles.mapContainer}
        center={{ lat, lng }}
        zoom={15}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    );
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
            <p className={styles.productDescription}>{product.description}</p>
          </div>
        );
      case "Bike":
      case "Vehicle":
        return (
          <div>
            <button
              className={styles.contactSellerButton}
              onClick={handleContactSeller}
            >
              Contact Seller
            </button>
            <button
              className={styles.viewDetailsButton}
              onClick={() => navigate("/vehicle-details", { state: product })}
            >
              View Details
            </button>
            <p className={styles.productDescription}>{product.description}</p>
          </div>
        );
      case "Mobiles":
        return (
          <div>
            <button
              className={styles.contactSellerButton}
              onClick={handleContactSeller}
            >
              <FaPhone /> Contact Seller
            </button>
            <button
              className={styles.contactSellerButton}
              style={{ backgroundColor: "dodgerblue" }}
              onClick={() => {
                addToCart(product);
              }}
            >
              <FaCartPlus /> Add to cart
            </button>
            <button
              className={styles.specificationsButton}
              onClick={() => alert("Specifications coming soon!")}
            >
              <FaInfoCircle /> View Specifications
            </button>
            <p className={styles.productDescription}>{product.description}</p>
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
          <div>
            <button
              className={styles.contactSellerButton}
              onClick={handleContactSeller}
            >
              Contact Seller
            </button>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              <FaCartPlus /> Add to Cart
            </button>
            <p className={styles.productDescription}>{product.description}</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (!product) return <Loader />;

  return (
    <div className={styles.pageContainer}>
      <Header user={user} />
      <div className={styles.content}>
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
            <p className={styles.productPrice}>
              {" "}
              Rs. {formatPrice(product.price)}
            </p>
            {/* <p className={styles.productDescription}>{product.description}</p> */}
            <div className={styles.buttonGroup}>
              {renderCategorySpecificContent()}
            </div>
            {product.type === "Property" ||
            product.type === "Bike" ||
            product.type === "Vehicle" ? (
              <div>
                <p>
                  More details about the product can be obtained by contacting
                  the seller as the products cannot be delivered by the company
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
        {product.type === "Mobiles" && (
          <div className={styles.specificationsContainer}>
            <h2>Specifications</h2>
            <table className={styles.specificationsTable}>
              <tbody>
                <tr>
                  <td>OS</td>
                  <td>Android 14 OS</td>
                </tr>
                <tr>
                  <td>UI</td>
                  <td>HIOS 14</td>
                </tr>
                <tr>
                  <td>Dimensions</td>
                  <td>168 x 76.4 x 7.7 mm</td>
                </tr>
                <tr>
                  <td>Weight</td>
                  <td>N/A</td>
                </tr>
                <tr>
                  <td>SIM</td>
                  <td>Dual Sim, Dual Standby (Nano-SIM)</td>
                </tr>
                <tr>
                  <td>Colors</td>
                  <td>
                    Stellar Shadow, Astral Ice, Magic Skin 3.0, Bumblebee
                    Edition
                  </td>
                </tr>
                <tr>
                  <td>Processor</td>
                  <td>
                    Octa-core (2 x 2.0 GHz Cortex-A75 + 6 x 1.8 GHz Cortex-A55),
                    Mediatek Helio G91 (12 nm), Mali-G52 MC2
                  </td>
                </tr>
                <tr>
                  <td>Display</td>
                  <td>
                    IPS LCD Capacitive Touchscreen, 16M Colors, Multitouch, 6.8
                    Inches, 1080 x 2460 Pixels (~396 PPI), 90Hz, 800 nits
                  </td>
                </tr>
                <tr>
                  <td>Memory</td>
                  <td>128GB Built-in, 8GB RAM, microSDXC (dedicated slot)</td>
                </tr>
                <tr>
                  <td>Camera</td>
                  <td>
                    Dual Camera: 64 MP (wide), PDAF + Auxiliary lens, Quad LED
                    Flash; Front: 13 MP (wide), Dual-LED dual-tone flash
                  </td>
                </tr>
                <tr>
                  <td>Battery</td>
                  <td>5000 mAh, 18W wired</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>Rs. 39,999 ($122)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {product.type === "Property" && product.locationUrl && (
          <div className={styles.propertyLocation}>
            <h2 style={{ marginLeft: 40, fontWeight: 700 }}>
              Property Location
            </h2>
            {renderMapFromUrl(product.locationUrl)}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetails;
