import React from "react";
import styles from "./Footer.module.css";
import { FaFacebook, FaInstagram, FaTwitter, FaDiscord } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <h2>
            {" "}
            <img src="Wastage.png" height={100} width={100} />W Util
          </h2>
          <p>Buy anything, Sell anything — developed by Tayyab.</p>
        </div>

        {/* Quick Links */}
        <div className={styles.links}>
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a
                onClick={() => {
                  navigate("/");
                }}
                // href="/shop"
              >
                Shop
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/about");
                }}
                // href="/about"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/support");
                }}
                // href="/support"
              >
                Support
              </a>
            </li>
            <li>
              <a
                onClick={() => {
                  navigate("/faq");
                }}
                // href="/faq"
              >
                FAQs
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Section */}
        <div className={styles.newsletter}>
          <h3>Stay Connected</h3>
          <p>Join our community for the latest updates!</p>
          <input type="email" placeholder="Enter your email" />
          <button>Subscribe</button>
        </div>

        {/* Social Icons */}
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

      {/* Copyright Section */}
      <div className={styles.copyright}>
        <p>&copy; 2025 RSS. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
