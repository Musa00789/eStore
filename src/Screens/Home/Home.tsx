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
import Loader from "../../components/Loader/Loader";

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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
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
          id: data.id || "",
          Size: [],
          Quantity: [],
        };
        if (data.type === "Fashion") {
          baseData.Size = ["S", "M", "L", "XL", "XXL"];
        } else {
          baseData.Quantity = [1, 2, 3, 4, 5];
        }

        return baseData;
      });

      setProducts(productsData);
      console.log("Products:", productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
      navigate("/error");
    } finally {
      setLoading(false);
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

  const renderProductCategory = (categoryName: string) => {
    const filteredProducts = products.filter(
      (product: any) => product.type === categoryName
    );

    return (
      <div>
        <h1 className={styles.bodyHeading}>{categoryName}</h1>
        {filteredProducts.length > 0 ? (
          loading ? (
            <Loader />
          ) : (
            <ProductList
              products={filteredProducts}
              searchQuery={searchQuery}
              productType={categoryName}
            />
          )
        ) : (
          <h1 className={styles.noProductsMessage}>No products available</h1>
        )}
      </div>
    );
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
        {renderProductCategory("Mobiles")}
        {renderProductCategory("Vehicle")}
        {renderProductCategory("Property")}
        {renderProductCategory("Fashion")}
        {renderProductCategory("Electronics")}
        {renderProductCategory("Furniture")}
        {renderProductCategory("Bike")}
      </div>
    </div>
  );
};

export default Home;
