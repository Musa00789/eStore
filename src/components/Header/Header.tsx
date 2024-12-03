import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMagnifyingGlass,
  FaCartShopping,
  FaArrowRightFromBracket,
  FaListUl,
  FaCircleUser,
  FaFontAwesome,
  FaGear,
} from "react-icons/fa6";
import styles from "./Header.module.css";
import { auth } from "../../firebase";

const Header = ({ user, searchQuery, setSearchQuery }: any) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleSearchInputChange = (e: any) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className={styles.header}>
      <div className={styles.menuLogoContainer}>
        {/* <FaListUl onClick={toggleSidebar} className={styles.menuBarIcon} /> */}
        <h4
          onClick={() => {
            navigate("/");
          }}
          className={styles.logo}
        >
          RSS
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
          flexDirection: "row",
        }}
      >
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
