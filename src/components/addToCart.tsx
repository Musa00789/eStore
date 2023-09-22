import React from "react";
import { firestore, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const addToCart = async (product: any) => {
  try {
    const uid: any = auth.currentUser?.uid;
    await setDoc(doc(firestore, "Users", uid, "Cart", "21"), {
      name: product.name,
      price: product.price,
      description: product.description,
      quantity: 1,
      images: product.images,
      id: 1,
    })
      .then(() => {
        alert("Product added to cart");
      })
      .catch((err) => {
        alert(err);
      });
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
};
