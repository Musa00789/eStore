import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "@firebase/firestore";
import { auth, firestore } from "../../../firebase";
import styles from "./CategoryBaseAllProducts.module.css"; // Make sure to create this CSS file
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";

const CategoryBaseAllProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const products = location.state || [];
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });

  useEffect(() => {
    console.log(products);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await getUser();
      } else {
        setUser({ name: "", email: "", phone: "", status: "" });
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

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

  return (
    <>
      <Header user={user} />
      <div className={styles.productsContainer}>
        <h1 className={styles.header}>Products</h1>
        <div className={styles.grid}>
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((product: any) => (
              <div key={product.id} className={styles.productCard}>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className={styles.productImage}
                />
                <div className={styles.productDetails}>
                  <h3 className={styles.productName}>
                    {product.name.length > 20
                      ? `${product.name.substring(0, 20)}...`
                      : product.name}
                  </h3>
                  <p className={styles.productPrice}>Rs. {product.price}</p>
                  <p className={styles.productDescription}>
                    {product.description.length > 50
                      ? `${product.description.substring(0, 50)}...`
                      : product.description}
                  </p>
                  <button
                    onClick={() => {
                      navigate(`/product/${product.name}`, { state: product });
                    }}
                    className={styles.viewButton}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CategoryBaseAllProduct;
