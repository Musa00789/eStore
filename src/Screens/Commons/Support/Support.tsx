import React, { useState } from "react";
import styles from "./Support.module.css";
import Footer from "../../../components/Footer/Footer";

const SupportScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Ticket submitted under "${category}". We'll be in touch within 24 hrs.`
    );
    setName("");
    setEmail("");
    setCategory("General");
    setMessage("");
    setFile(null);
  };

  return (
    <div>
      <div className={styles.supportContainer}>
        <div className={styles.leftColumn}>
          <h1 className={styles.heading}>Need Help?</h1>
          <p className={styles.subtext}>
            Submit your issue and our support team will get back to you shortly.
          </p>

          <form className={styles.supportForm}>
            <label>Full Name</label>
            <input type="text" placeholder="Your name" />

            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" />

            <label>Issue Category</label>
            <select>
              <option>Technical Issue</option>
              <option>Billing Query</option>
              <option>Product Return</option>
              <option>Other</option>
            </select>

            <label>Message</label>
            <textarea
              rows={5}
              placeholder="Describe your issue here..."
            ></textarea>

            <label>Upload Screenshot (optional)</label>
            <input type="file" />

            <button type="submit">Submit</button>
          </form>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.contactCard}>
            <h2>Call Us</h2>
            <p>+92 (333) 123‑4567</p>
          </div>
          <div className={styles.contactCard}>
            <h2>Email</h2>
            <p>support@wutil.com</p>
          </div>
          <div className={styles.contactCard}>
            <h2>Live Chat</h2>
            <p>Available 9am–5pm (PST)</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SupportScreen;
