import React from "react";
import styles from "./Footer.module.css";
import { FaFacebook, FaInstagram, FaTwitter, FaDiscord } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.logoSection}>
          <h2>
            {" "}
            <img src="/Wastage.png" height={100} width={100} />W Util
          </h2>
          <p>Buy anything, Sell anything — developed by Tayyab.</p>
        </div>

        <div className={styles.links}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a
                onClick={() => {
                  navigate("/");
                }}
              >
                Shop
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/about");
                }}
              >
                About Us
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/support");
                }}
              >
                Support
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/faq");
                }}
              >
                FAQs
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.newsletter}>
          <h3>Stay Connected</h3>
          <p>Join our community for the latest updates!</p>
          <input type="email" placeholder="Enter your email" />
          <button
            onClick={() => {
              alert("Subscribed to newsletter!");
            }}
          >
            Subscribe
          </button>
        </div>

        <div className={styles.socials}>
          <h3>Join the Community</h3>
          <div className={styles.icons}>
            <a href="https://discord.com/" target="_blank" rel="noreferrer">
              <FaDiscord />
            </a>
            <a href="https://twitter.com/" target="_blank" rel="noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noreferrer">
              <FaInstagram />
            </a>
            <a href="https://facebook.com/" target="_blank" rel="noreferrer">
              <FaFacebook />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; 2025 W Util. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
