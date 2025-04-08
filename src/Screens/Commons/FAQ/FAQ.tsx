import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import styles from "./FAQ.module.css";
import Footer from "../../../components/Footer/Footer";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I add a product?",
    answer:
      "Click “Add Product” in the top bar, fill out the modal form, and submit.",
  },
  {
    question: "Can I edit my listings?",
    answer: "Yes—hit the pencil icon on any product card to update.",
  },
  {
    question: "How do I filter by category?",
    answer: "Use the dropdown next to “Add Product”; grid updates instantly.",
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes—download W Util Marketplace from App Store or Google Play.",
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes—download W Util Marketplace from App Store or Google Play.",
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes—download W Util Marketplace from App Store or Google Play.",
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes—download W Util Marketplace from App Store or Google Play.",
  },
];

const FAQScreen: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div>
      <section className={styles.container}>
        <h1 className={styles.header}>FAQs</h1>
        <ul className={styles.list}>
          {faqData.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <li key={i} className={styles.item}>
                <button className={styles.question} onClick={() => toggle(i)}>
                  {item.question}
                  <span className={styles.icon}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </button>
                {isOpen && <div className={styles.answer}>{item.answer}</div>}
              </li>
            );
          })}
        </ul>
      </section>
      <Footer />
    </div>
  );
};

export default FAQScreen;
