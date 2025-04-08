import React from "react";
import styles from "./About.module.css";
import Footer from "../../../components/Footer/Footer";

const AboutScreen: React.FC = () => (
  <div>
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>About W Util Marketplace</h1>
      </header>

      <div className={styles.content}>
        <article className={styles.profile}>
          <h2>Company Profile</h2>
          <p>
            <strong>Founded:</strong> 2025 in Pakistan, Gujrat
          </p>
          <p>
            <strong>Founders:</strong> Tayyab &amp; Group
          </p>
          <p>
            <strong>Headquarters:</strong> University of Gujrat, Hafiz Hayat
            Campus, Gujrat Pakistan
          </p>
          <p>
            <strong>Mission:</strong> To empower small businesses with
            enterprise‑grade e‑commerce tooling—fast, reliable, and scalable. To
            enable users to buy and sell anything, anywhere free or at any
            desired price.
          </p>
        </article>

        <article className={styles.timeline}>
          <h2>Milestones</h2>
          <ul>
            <li>
              <strong>2018:</strong> Seed round closed ($2M)
            </li>
            <li>
              <strong>2019:</strong> Launched real‑time listings &amp; mobile
              app
            </li>
            <li>
              <strong>2021:</strong> 10,000+ active sellers
            </li>
            <li>
              <strong>2023:</strong> Expanded to Europe &amp; APAC markets
            </li>
          </ul>
        </article>

        <article className={styles.legal}>
          <h2>Legal &amp; Copyright</h2>
          <p>
            &copy; 2018–{new Date().getFullYear()} W Util Marketplace, Inc. All
            rights reserved.
          </p>
          <p>
            W Util™ and W Util Marketplace™ are trademarks of W Util
            Marketplace, Inc.
          </p>
        </article>
      </div>
    </section>
    <Footer />
  </div>
);

export default AboutScreen;
