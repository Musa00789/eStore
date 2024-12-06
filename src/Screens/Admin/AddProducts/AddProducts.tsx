import React, { useState, useEffect } from "react";
import styles from "./AddProducts.module.css";
import { firestore, storage } from "../../../firebase";
import { doc, getDocs, setDoc, collection, query } from "@firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot,
} from "@firebase/storage";
import { FaPlus, FaPencil, FaTrashCan, FaCartShopping } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";

// TODO: Add unique id for all product

const AddProducts = () => {
  const [file, setFile] = useState<File[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const [products, setProducts] = useState([
    {
      name: "",
      price: "",
      description: "",
      images: [],
    },
  ]);

  useEffect(() => {
    getProducts();
  }, []);

  const openForm = () => {
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    // Reset form fields
    setFile([]);
    setProductName("");
    setProductPrice("");
    setProductDescription("");
    setCategory("");
    setSize("");
    setQuantity("");
    setUploadProgress(0);
  };

  const handleFileChange = (e: any) => {
    const selectedFiles: any = Array.from(e.target.files);
    setFile(selectedFiles);
  };

  // const handleAddProduct = async () => {
  //   try {
  //     const productId = uuidv4();
  //     const downloadUrls: any[] = [];
  //     for (const selectedFile of file) {
  //       const storageRef = ref(
  //         storage,
  //         `products/${productId}/${selectedFile.name}`
  //       );

  //       const uploadTask = uploadBytesResumable(storageRef, selectedFile);
  //       uploadTask.on(
  //         "state_changed",
  //         (snapshot: UploadTaskSnapshot) => {
  //           const progress =
  //             (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //           setUploadProgress(progress);
  //         },
  //         (error) => {
  //           console.error("Error uploading file:", error);
  //         },
  //         () => {
  //           const snapshotRef = uploadTask.snapshot.ref;
  //           getDownloadURL(snapshotRef).then(async (downloadURL) => {
  //             downloadUrls.push(downloadURL);
  //             if (downloadUrls.length === file.length) {
  //               const productData = {
  //                 id: productId,
  //                 name: productName,
  //                 price: productPrice,
  //                 description: productDescription,
  //                 images: downloadUrls,
  //               };
  //               const productRef = doc(firestore, "Products", productId);
  //               setDoc(productRef, productData);
  //               closeForm();
  //             }
  //           });
  //         }
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error adding product:", error);
  //   }
  // };

  const handleAddProduct = async () => {
    try {
      const productId = uuidv4();
      const downloadUrls: string[] = [];

      for (const selectedFile of file) {
        const storageRef = ref(
          storage,
          `products/${productId}/${selectedFile.name}`
        );

        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        uploadTask.on(
          "state_changed",
          (snapshot: UploadTaskSnapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading file:", error);
          },
          () => {
            const snapshotRef = uploadTask.snapshot.ref;
            getDownloadURL(snapshotRef).then(async (downloadURL) => {
              downloadUrls.push(downloadURL);

              if (downloadUrls.length === file.length) {
                // Create the product data object dynamically based on the category
                const productData: any = {
                  id: productId,
                  name: productName,
                  price: productPrice,
                  description: productDescription,
                  images: downloadUrls,
                  category,
                };

                // Add size and quantity for Fashion
                if (category === "Fashion") {
                  productData.size = size;
                  productData.quantity = quantity;
                }

                // Add quantity for Electronics
                if (category === "Electronics") {
                  productData.quantity = quantity;
                }

                const productRef = doc(
                  firestore,
                  `Products/${productData.category}`,
                  productId
                );
                await setDoc(productRef, productData);
                closeForm();
              }
            });
          }
        );
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const getProducts = async () => {
    try {
      const productsCollectionRef = collection(firestore, "Products");
      const productsQuery = query(productsCollectionRef);
      const querySnapshot = await getDocs(productsQuery);
      const productsArray: any[] = [];
      querySnapshot.forEach((doc) => {
        productsArray.push(doc.data());
      });
      console.log("Products:", productsArray);
      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  return (
    <div>
      <button className={styles.addProductBtn} onClick={openForm}>
        <FaCartShopping />
        <FaPlus /> Add Products
      </button>
      <h1 className={styles.leadHeadings}>
        My Products
        <FaCartShopping />
      </h1>
      <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
        {products.map((product, index) => {
          return (
            <div key={index} className={styles.productCard}>
              <img className={styles.productImage} src={product.images[0]} />
              <div className={styles.productDetails}>
                <h3 className={styles.productName}>
                  {product.name && product.name.length > 10
                    ? `${product.name.substring(0, 10)}...`
                    : product.name}
                </h3>
                <p className={styles.productDescription}>
                  {product.description && product.description.length > 25
                    ? `${product.description.substring(0, 25)}...`
                    : product.description}
                </p>
                <p className={styles.productPrice}>Rs. {product.price}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <button className={styles.handlersBtn}>
                  <FaPencil />
                </button>
                <button className={styles.handlersBtn}>
                  <FaTrashCan />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isFormVisible && (
        <div className={styles.glassBackground}>
          <div className={styles.addProductForm}>
            <span className={styles.closeButton} onClick={closeForm}>
              &times;
            </span>
            <h2>Add Product</h2>
            <label>Choose Image</label>
            <input type="file" required multiple onChange={handleFileChange} />
            <label>Product Name</label>
            <input
              type="text"
              value={productName}
              required
              onChange={(e) => setProductName(e.target.value)}
            />
            <label>Product Price</label>
            <input
              type="number"
              value={productPrice}
              required
              onChange={(e) => setProductPrice(e.target.value)}
            />
            <label>Product Description</label>
            <input
              type="text"
              value={productDescription}
              required
              onChange={(e) => setProductDescription(e.target.value)}
            />
            <label>Category</label>
            <select
              value={category}
              required
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Bike">Bike</option>
              <option value="Property">Property</option>
              <option value="Furniture">Furniture</option>
            </select>

            {category === "Fashion" && (
              <>
                <label>Size</label>
                <select
                  value={size}
                  required
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="">Select a size</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>

                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  required
                  min="1"
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </>
            )}

            {category === "Electronics" && (
              <>
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  required
                  min="1"
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </>
            )}

            {["Vehicle", "Bike", "Property", "Furniture"].includes(
              category
            ) && <p>No additional inputs required for this category.</p>}

            <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>
            <button onClick={handleAddProduct}>Add Product</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddProducts;
