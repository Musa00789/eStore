import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMagnifyingGlass,
  FaCartShopping,
  FaArrowRightFromBracket,
  FaCircleUser,
  FaGear,
  FaMessage,
  FaX,
  FaPerson,
} from "react-icons/fa6";
import styles from "./Header.module.css";
import { auth, firestore } from "../../firebase";
import { collection, query, where, getDocs } from "@firebase/firestore";

const Header = ({ user }: any) => {
  const navigate = useNavigate();
  const messageTabRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string }[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMessageTabOpen, setIsMessageTabOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const toggleMessageTab = () => {
    setIsMessageTabOpen(!isMessageTabOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      messageTabRef.current &&
      !messageTabRef.current.contains(event.target as Node)
    ) {
      setIsMessageTabOpen(false);
    }
  };

  useEffect(() => {
    if (isMessageTabOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMessageTabOpen]);

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

        setSuggestions(results);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product: any) => {
    setSearchQuery(product.name);
    setSuggestions([]);
    navigate(`/Product/${product.id}`);
  };

  return (
    <div className={styles.header}>
      <div className={styles.menuLogoContainer}>
        <h1
          onClick={() => {
            navigate("/");
          }}
          className={styles.logo}
        >
          ♾️
        </h1>
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
        <div className={styles.messageIconContainer}>
          <button
            style={{
              backgroundColor: "transparent",
              border: "0px",
              borderColor: "transparent",
            }}
            onClick={toggleMessageTab}
          >
            <FaMessage
              style={{
                color: "#7289da",
                fontSize: "22px",
              }}
            />
          </button>
          {isMessageTabOpen && (
            <div className={styles.messageTab} ref={messageTabRef}>
              <div className={styles.messageHeader}>
                <h4>Messages</h4>
                <button
                  onClick={toggleMessageTab}
                  className={styles.closeMessageTabBtn}
                >
                  <FaX />
                </button>
              </div>
              <p>No new messages</p>
              <a
                href="/messages"
                className={styles.showAllLink}
                onClick={(e) => {
                  e.preventDefault();
                  try {
                    console.log("user:", user);
                    navigate("/Buyer/chat", { state: user });
                  } catch (error) {
                    console.log(error);
                    navigate("/Buyer/error");
                  }
                }}
              >
                Show All
              </a>
            </div>
          )}
        </div>

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
              <FaPerson className={styles.profileIcon} />
              <h5>{user?.name}</h5>
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  onClick={() => {
                    navigate("/Buyer/profile");
                  }}
                >
                  <FaCircleUser
                    style={{
                      color: "#7289da",
                      marginRight: "5px",
                    }}
                  />{" "}
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/Buyer/settings");
                  }}
                >
                  <FaGear
                    style={{
                      color: "#7289da",
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
                      color: "#7289da",
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
            navigate("/Buyer/cart");
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
