import React from "react";
import { firestore, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const addToCart = async (product: any) => {
  const cartId = uuidv4();
  try {
    const uid: any = auth.currentUser?.uid;
    if (!uid) {
      alert("User not logged in!");
      return;
    }
    console.log(product);

    // Base product data
    const cartItem: any = {
      name: product.name,
      price: product.price,
      description: product.description,
      images: product.images,
      productId: product.id,
      cartId: cartId,
      productType: product.type,
    };

    // Additional parameters based on product type
    if (product.type === "Fashion") {
      cartItem.productSize = product.size;
      cartItem.quantity = product.quantity;
    } else if (
      ["Mobiles", "Electronics"].includes(product.type) &&
      product.quantity
    ) {
      cartItem.quantity = product.quantity;
    } else if (
      ["Vehicle", "Bike", "Property", "Furniture"].includes(product.type)
    ) {
      console.log(product.type);
    }

    await setDoc(doc(firestore, "Users", uid, "Cart", cartId), cartItem)
      .then(() => {
        alert("Product added to cart");
      })
      .catch((err) => {
        alert(`Error: ${err.message}`);
      });
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
};

// export const addToCart = async (product: any) => {
//   const cartId = uuidv4();
//   try {
//     const uid: any = auth.currentUser?.uid;
//     console.log(product);
//     await setDoc(doc(firestore, "Users", uid, "Cart", cartId), {
//       name: product.name,
//       price: product.price,
//       description: product.description,
//       quantity: product.quantity,
//       images: product.images,
//       productId: product.id,
//       productSize: product.size,
//       productType: product.type,
//       cartId: cartId,
//     })
//       .then(() => {
//         alert("Product added to cart");
//       })
//       .catch((err) => {
//         alert(err);
//       });
//   } catch (error) {
//     console.error("Error adding product to cart:", error);
//   }
// };
