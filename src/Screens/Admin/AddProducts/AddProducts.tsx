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
  }, [products]);

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
    setUploadProgress(0);
  };

  const handleFileChange = (e: any) => {
    const selectedFiles: any = Array.from(e.target.files);
    setFile(selectedFiles);
  };

  const handleAddProduct = async () => {
    try {
      const productId = uuidv4();
      const downloadUrls: any[] = [];
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
                const productData = {
                  id: productId,
                  name: productName,
                  price: productPrice,
                  description: productDescription,
                  images: downloadUrls,
                };
                const productRef = doc(firestore, "Products", productId);
                setDoc(productRef, productData);
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
            <p>Upload Progress: {uploadProgress.toFixed(2)}%</p>
            <button onClick={handleAddProduct}>Add Product</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddProducts;
