import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMagnifyingGlass,
  FaCartShopping,
  FaListUl,
  FaEye,
  FaCartPlus,
  FaX,
  FaArrowRightFromBracket,
  FaHouse,
  FaUser,
  FaGear,
} from "react-icons/fa6";
import styles from "./Home.module.css";
import { auth, firestore } from "../../firebase";
import { getDocs, collection, query, doc, getDoc } from "@firebase/firestore";
import ProductDetails from "../../components/ProductDetails/ProductDetails";
import { addToCart } from "../../components/addToCart";

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "",
  });
  const [products, setProducts] = useState([
    {
      name: "",
      price: "",
      description: "",
      images: [],
    },
  ]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showProductDetails, setShowProductDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        getUser();
      } else {
        setUser({ name: "" });
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
      const productsData = productsSnapshot.docs.map((doc) => doc.data());
      setProducts(productsData);
      console.log("Products:", productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const getUser = async () => {
    try {
      const uid: string | undefined = await auth.currentUser?.uid;
      if (!uid) return;
      const docRef = doc(firestore, "Users", uid);
      const docSnap: any = await getDoc(docRef);
      console.log(docSnap.data());
      await setUser(docSnap.data());
    } catch (er) {
      alert("Error fetching user data" + er);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };
  const closeSidebar = () => {
    setSidebarVisible(false);
  };
  const handleSearchInputChange = (e: any) => {
    setSearchQuery(e.target.value);
  };
  const openProductDetails = (product) => {
    setShowProductDetails(product);
  };

  const closeProductDetails = () => {
    setShowProductDetails(null);
  };

  return (
    <div className={styles.main}>
      <div className={styles.header}>
        <div className={styles.menuLogoContainer}>
          <FaListUl
            onClick={() => {
              toggleSidebar();
              console.log("clicked");
            }}
            className={styles.menuBarIcon}
          />
          <h4
            onClick={() => {
              navigate("/Home");
            }}
            className={styles.logo}
          >
            M & D
          </h4>
        </div>
        <div className={styles.searchBarContainer}>
          <input
            className={styles.searchBar}
            placeholder="Search your needs . . ."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button className={styles.searchBtn}>
            <FaMagnifyingGlass className={styles.icon} />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {user.name === "" ? (
            <button
              className={styles.loginBtn}
              onClick={() => {
                navigate("/Login");
              }}
            >
              Login <FaArrowRightFromBracket />
            </button>
          ) : (
            <button
              className={styles.loginBtn}
              onClick={async () => {
                await auth
                  .signOut()
                  .then(() => {
                    navigate("/");
                  })
                  .catch((er) => {
                    console.log(er);
                  });
              }}
            >
              Logout <FaArrowRightFromBracket />
            </button>
          )}
          <button
            onClick={() => {
              navigate("/User/Cart");
            }}
            className={styles.cartBtn}
          >
            <FaCartShopping className={styles.icon} />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarVisible && (
        <div
          className={`${styles.sidebar} ${
            sidebarVisible ? styles.visible : ""
          }`}
        >
          <button className={styles.closeButton} onClick={closeSidebar}>
            <FaX />
          </button>
          <h2 className={styles.userProfile}>{user.name[0]}</h2>
          <ul className={styles.sidebarLinks}>
            <li
              onClick={() => {
                navigate("/Home");
              }}
              className={styles.sidebarLink}
            >
              <FaHouse /> Home
            </li>
            <li className={styles.sidebarLink}>
              {" "}
              <FaUser /> Profile
            </li>
            <li className={styles.sidebarLink}>
              <FaGear /> Settings
            </li>
            {user.name === "" ? (
              <li
                className={`${styles.sidebarLink}`}
                onClick={() => {
                  navigate("/Login");
                }}
              >
                <FaArrowRightFromBracket /> Signin
              </li>
            ) : (
              <li
                className={`${styles.sidebarLink} ${styles.sidebarLinkSignout}`}
                onClick={() => {
                  auth.signOut().then(() => {
                    navigate("/");
                  });
                }}
              >
                <FaArrowRightFromBracket /> Signout
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Main body */}
      <div>
        {user.name && (
          <h1 className={styles.userGreetings}>Welcome, {user.name} . . !</h1>
        )}
        <h1 className={styles.bodyHeading}>Items</h1>
        <div className={styles.productsContainer}>
          {products
            .filter((product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((product, index) => {
              return (
                <div key={index} className={styles.productCard}>
                  <img
                    className={styles.productImage}
                    src={product.images[0]}
                  />
                  <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productDescription}>
                      {product.description && product.description.length > 25
                        ? `${product.description.substring(0, 25)}...`
                        : product.description}
                    </p>
                    <p className={styles.productPrice}>Rs. {product.price}</p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <button
                      onClick={() => openProductDetails(product)}
                      className={styles.handlersBtn}
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => {
                        addToCart({
                          name: product.name,
                          price: product.price,
                          description: product.description,
                          quantity: 1,
                          images: product.images,
                        });
                      }}
                      className={styles.handlersBtn}
                    >
                      <FaCartPlus />
                    </button>
                  </div>
                </div>
              );
            })}
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
