import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, doc, getDoc } from "@firebase/firestore";
import { auth, firestore } from "../../firebase";
import ImageGallery from "../../components/ImageGallery/ImageGallery";
import Categories from "../../components/Categories/Categories";
import Header from "../../components/Header/Header";
import styles from "./Home.module.css";
import { addToCart } from "../../components/addToCart";
import { FaCartPlus, FaEye } from "react-icons/fa6";
import ProductList from "../../components/CategoryBasedProductList/ProductList";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const [products, setProducts] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  const getProducts = async () => {
    try {
      const productsCollectionRef = collection(firestore, "Products");
      const productsQuery = query(productsCollectionRef);
      const productsSnapshot = await getDocs(productsQuery);

      const productsData = productsSnapshot.docs.map((doc) => {
        const data = doc.data();

        const baseData: any = {
          name: data.name || "",
          price: data.price || "",
          description: data.description || "",
          images: data.images || [],
          type: data.type || "",
          Size: [],
          Quantity: [],
        };

        // Dynamically add Size or Quantity based on the type
        if (data.type === "Fashion") {
          baseData.Size = ["S", "M", "L", "XL", "XXL"];
        } else {
          baseData.Quantity = [1, 2, 3, 4, 5];
        }

        return baseData; // Return the constructed object
      });

      setProducts(productsData);
      console.log("Products:", productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
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

  return (
    <div className={styles.main}>
      {/* Use the new Header component */}
      <Header
        user={user}
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
        <h1 className={styles.bodyHeading}>Fashion & Beauty</h1>
        <ProductList products={products} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default Home;
