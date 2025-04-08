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
  FaSellcast,
  FaShop,
} from "react-icons/fa6";
import styles from "./Header.module.css";
import { auth, firestore } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
} from "@firebase/firestore";
import { FaBuysellads, FaUserCircle } from "react-icons/fa";

const Header = ({ user }: any) => {
  const navigate = useNavigate();
  const messageTabRef = useRef<HTMLDivElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { id: string; name: string }[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMessageTabOpen, setIsMessageTabOpen] = useState(false);
  const [chatList, setChatList] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const toggleMessageTab = () => {
    setIsMessageTabOpen(!isMessageTabOpen);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        messageTabRef.current &&
        !messageTabRef.current.contains(event.target as Node)
      ) {
        setIsMessageTabOpen(false);
      }
    };
    if (isMessageTabOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMessageTabOpen]);

  // Fetch product suggestions
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

  // ✅ Fetch user's chats from Firestore
  useEffect(() => {
    const fetchChats = async () => {
      setLoadingChats(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const chatQuery = query(
          collection(firestore, "Chats"),
          where("participants", "array-contains", uid),
          orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(chatQuery);
        const fetchedChats = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const chatData = docSnapshot.data();
            const otherParticipantId = chatData.participants.find(
              (id: string) => id !== uid
            );
            const otherUserDoc = await getDoc(
              doc(firestore, "Users", otherParticipantId)
            );

            return {
              id: docSnapshot.id,
              productName: chatData.productName || "Unknown Product",
              sellerName: otherUserDoc.exists()
                ? otherUserDoc.data().name
                : "Seller",
            };
          })
        );

        setChatList(fetchedChats);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoadingChats(false);
      }
    };

    if (isMessageTabOpen) fetchChats();
  }, [isMessageTabOpen]);

  return (
    <div className={styles.header}>
      <div className={styles.menuLogoContainer}>
        {/* <h1 className={styles.logo}> */}
        <img
          onClick={() => {
            navigate("/");
          }}
          src="/Wastage.png"
          width={130}
          height={130}
          style={{ cursor: "pointer" }}
        />
        {/* </h1> */}

        {/* search should not be case sensitive */}
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "50%" }}>
        <div className={styles.searchBarContainer}>
          <input
            className={styles.searchBar}
            placeholder="Search your needs . . ."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
          <button
            onClick={() =>
              handleSearchInputChange({ target: { value: searchQuery } })
            }
            className={styles.searchBtn}
          >
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
          {user.status === "Seller" && (
            <button
              style={{
                backgroundColor: "transparent",
                border: "0px",
                borderColor: "transparent",
              }}
              onClick={() => {
                navigate("/Seller/dashboard");
              }}
            >
              <FaShop
                style={{
                  color: "#7289da",
                  fontSize: "26px",
                }}
              />{" "}
              Sell
            </button>
          )}

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

              {loadingChats ? (
                <p>Loading chats...</p>
              ) : chatList.length > 0 ? (
                <ul className={styles.chatList}>
                  {chatList.slice(0, 5).map(
                    (
                      chat // Limit to 7 chats
                    ) => (
                      <li key={chat.id} onClick={() => navigate(`/Buyer/chat`)}>
                        <FaUserCircle
                          size={29}
                          style={{
                            marginRight: "5px",
                            borderRight: "1px solid black",
                            paddingRight: "5px",
                          }}
                        />
                        <strong>{chat.sellerName}</strong> — {chat.productName}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>No active chats.</p>
              )}
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
