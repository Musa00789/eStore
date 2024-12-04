import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMagnifyingGlass,
  FaCartShopping,
  FaArrowRightFromBracket,
  FaCircleUser,
  FaGear,
} from "react-icons/fa6";
import styles from "./Header.module.css";
import { auth, firestore } from "../../firebase";
import { collection, query, where, getDocs } from "@firebase/firestore";

const Header = ({ user }: any) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string }[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchInputChange = async (e: any) => {
    const queryText = e.target.value;
    setSearchQuery(queryText);

    if (queryText.trim().length > 0) {
      try {
        const productsRef = collection(firestore, "Products");
        const q = query(
          productsRef,
          where("name", ">=", queryText),
          where("name", "<=", queryText + "\uf8ff")
        );
        const querySnapshot = await getDocs(q);

        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));

        setSuggestions(results); // Update suggestions dropdown
      } catch (error) {
        console.error("Error searching products:", error);
      }
    } else {
      setSuggestions([]); // Clear suggestions when input is empty
    }
  };

  const handleSuggestionClick = (product: any) => {
    setSearchQuery(product.name);
    setSuggestions([]);
    navigate(`/Product/${product.id}`); // Navigate to the product page
  };

  return (
    <div className={styles.header}>
      <div className={styles.menuLogoContainer}>
        <h4
          onClick={() => {
            navigate("/");
          }}
          className={styles.logo}
        >
          RSS
        </h4>
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
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
        {suggestions.length > 0 && (
          <div className={styles.suggestionsDropdown}>
            {suggestions.map((product: any) => (
              <div
                key={product.id}
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(product)}
              >
                {product.name}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {user.name === "" ? (
          <button
            className={styles.loginBtn}
            onClick={() => {
              navigate("/Login");
            }}
          >
            Login{" "}
            <FaArrowRightFromBracket
              style={{
                marginLeft: "5px",
              }}
            />
          </button>
        ) : (
          <div
            className={styles.mainProfileSection}
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <div className={styles.profileSection} onClick={toggleDropdown}>
              <FaCircleUser className={styles.profileIcon} />
              <h5>Musa</h5>
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  onClick={() => {
                    navigate("/User/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/User/settings");
                  }}
                >
                  <FaGear
                    style={{
                      color: "black",
                      marginRight: "5px",
                    }}
                  />
                  Settings
                </button>
                <button
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
                  Logout{" "}
                  <FaArrowRightFromBracket
                    style={{
                      marginLeft: "5px",
                    }}
                  />
                </button>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => {
            navigate("/User/cart");
          }}
          className={styles.cartBtn}
        >
          <FaCartShopping className={styles.icon} />
        </button>
      </div>
    </div>
  );
};

export default Header;
