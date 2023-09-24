import React from "react";
import { firestore, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const addToCart = async (product: any) => {
  const cartId = uuidv4();
  try {
    const uid: any = auth.currentUser?.uid;
    await setDoc(doc(firestore, "Users", uid, "Cart", cartId), {
      name: product.name,
      price: product.price,
      description: product.description,
      quantity: 1,
      images: product.images,
      productId: product.id,
      cartId: cartId,
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
