import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, doc, getDoc } from "@firebase/firestore";
import { auth, firestore } from "../../firebase";
import ProductDetails from "../../components/ProductDetails/ProductDetails";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import Categories from "../../components/Categories/Categories";
import Header from "../../components/Header/Header"; // Import new Header
import styles from "./Home.module.css";
import { addToCart } from "../../components/addToCart";
import { FaCartPlus, FaEye } from "react-icons/fa6";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const [products, setProducts] = useState<any>([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDetails, setShowProductDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getUser();
      } else {
        setUser({ name: "", email: "", phone: "", status: "" });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    getProducts();
  }, [user]);

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const getProducts = async () => {
    try {
      const productsCollectionRef = collection(firestore, "Products");
      const productsQuery = query(productsCollectionRef);
      const productsSnapshot = await getDocs(productsQuery);
      const productsData = productsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          name: data.name || "",
          price: data.price || "",
          description: data.description || "",
          images: data.images || [],
        };
      });
      setProducts(productsData);
      console.log("Products:", productsData);
    } catch (error) {
      navigate("/error");
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

  const openProductDetails = (product: any) => {
    setShowProductDetails(product);
  };

  const closeProductDetails = () => {
    setShowProductDetails(null);
  };

  return (
    <div className={styles.main}>
      {/* Use the new Header component */}
      <Header
        user={user}
        // toggleSidebar={toggleSidebar}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main body */}
      <div className={styles.mainBodyContent}>
        {user.name && (
          <h1 className={styles.userGreetings}>Welcome, {user.name} . . !</h1>
        )}
        <ImageGallery />
        <Categories />
        <h1 className={styles.bodyHeading}>Items</h1>
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
                    onClick={() => openProductDetails(product)}
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
        {showProductDetails && (
          <ProductDetails
            product={showProductDetails}
            onClose={closeProductDetails}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
