import React, { useState, useEffect, useRef } from "react";
import styles from "./ImageGallery.module.css";

const ImageGallery = () => {
  const images = [
    "/Banner1.png",
    "/Mobile.svg",
    "/vite.svg",
    "/Property.svg",
    "Car.svg",
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const startAutoSlide = () => {
    autoSlideRef.current = setInterval(() => {
      handleNext();
    }, 2000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current || undefined);
  }, []);

  return (
    <div
      className={styles.galleryContainer}
      onMouseEnter={() => clearInterval(autoSlideRef.current || undefined)}
      onMouseLeave={startAutoSlide}
    >
      {/* <button className={styles.prevButton} onClick={handlePrev}>
        ❮
      </button> */}
      <div className={styles.bannerContainer}>
        <img
          className={styles.banner}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
        />
      </div>
      {/* <button className={styles.nextButton} onClick={handleNext}>
        ❯
      </button> */}
    </div>
  );
};

export default ImageGallery;
