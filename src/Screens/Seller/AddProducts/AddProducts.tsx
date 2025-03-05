import React, { useState, useEffect } from "react";
import styles from "./AddProducts.module.css";
import { auth, firestore, storage } from "../../../firebase";
import {
  doc,
  getDocs,
  setDoc,
  collection,
  query,
  deleteDoc,
  where,
} from "@firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "@firebase/storage";
import { FaPlus, FaPencil, FaTrashCan, FaCartShopping } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";
import Loader from "../../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";

const AddProducts = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [type, setType] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const [model, setModel] = useState("");
  const [brand, setBrand] = useState("");
  const [waranty, setWaranty] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [sellerId, setSellerId] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationUrl, setLocationUrl] = useState("");

  useEffect(() => {
    setSellerId(auth.currentUser?.uid || "");
    getProducts();
  }, [selectedTypeFilter]);

  const openForm = () => {
    setIsFormVisible(true);
  };

  const closeForm = () => {
    setIsFormVisible(false);
    setIsEditMode(false);
    setEditProductId(null);
    resetForm();
  };

  const resetForm = () => {
    setFile([]);
    setProductName("");
    setProductPrice("");
    setProductDescription("");
    setType("");
    setSize("");
    setQuantity("");
    setUploadProgress(0);
  };

  const handleFileChange = (e: any) => {
    const selectedFiles: any = Array.from(e.target.files);
    setFile(selectedFiles);
  };

  const handleAddProduct = async () => {
    try {
      const productId = isEditMode && editProductId ? editProductId : uuidv4();
      const downloadUrls: string[] = [];
      const uAuth = auth.currentUser?.uid;

      for (const selectedFile of file) {
        const storageRef = ref(
          storage,
          `products/${productId}/${selectedFile.name}`
        );

        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Error uploading file:", error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              downloadUrls.push(downloadURL);
              if (downloadUrls.length === file.length) {
                const productData: any = {
                  id: productId,
                  sellerId: sellerId,
                  name: productName,
                  price: productPrice,
                  description: productDescription,
                  images: downloadUrls,
                  type,
                  clicks: 0,
                  views: 0,
                  purchases: 0,
                  ...(type === "Fashion" && { size, quantity }),
                  ...(type === "Electronics" && { quantity }),
                  ...(type === "Property" && { locationUrl }),
                  ...(type === "Mobiles" && {
                    quantity,
                    model,
                    brand,
                    waranty,
                  }),
                };

                if (!uAuth) {
                  alert("User is not authenticated");
                  navigate("/login");
                  throw new Error("User is not authenticated");
                }
                const productRef = doc(firestore, "Products", productId);
                setDoc(productRef, productData).then(() => {
                  getProducts();
                  closeForm();
                });
              }
            });
          }
        );
      }
    } catch (error) {
      console.error("Error adding/updating product:", error);
    }
  };

  // const getProducts = async () => {
  //   setLoading(true);
  //   try {
  //     const uAuth = auth.currentUser?.uid;
  //     if (!uAuth) {
  //       alert("User is not authenticated");
  //       navigate("/login");
  //       throw new Error("User is not authenticated");
  //     }
  //     const productsCollectionRef = collection(firestore, "Products");
  //     const productsQuery = selectedTypeFilter
  //       ? query(productsCollectionRef, where("type", "==", selectedTypeFilter))
  //       : query(productsCollectionRef);

  //     const querySnapshot = await getDocs(productsQuery);
  //     const productsArray: any[] = [];
  //     querySnapshot.forEach((doc) => {
  //       const data = doc.data();
  //       productsArray.push({ ...data, id: doc.id });
  //     });
  //     setProducts(productsArray);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getProducts = async () => {
    setLoading(true);
    try {
      const uAuth = auth.currentUser?.uid;
      if (!uAuth) {
        alert("User is not authenticated");
        navigate("/login");
        return;
      }

      const productsCollectionRef = collection(firestore, "Products");
      const productsQuery = selectedTypeFilter
        ? query(
            productsCollectionRef,
            where("sellerId", "==", uAuth), // Filter by sellerId
            where("type", "==", selectedTypeFilter) // Additional type filter
          )
        : query(productsCollectionRef, where("sellerId", "==", uAuth)); // Filter only by sellerId

      const querySnapshot = await getDocs(productsQuery);
      const productsArray: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productsArray.push({ ...data, id: doc.id });
      });
      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setIsEditMode(true);
    setEditProductId(product.id);
    setProductName(product.name);
    setProductPrice(product.price);
    setProductDescription(product.description);
    setType(product.type);
    setSize(product.size || "");
    setQuantity(product.quantity || "");
    setLocationUrl(product.locationUrl || "");
    setFile([]);
    openForm();
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const uAuth = auth.currentUser?.uid;
      if (!uAuth) {
        alert("User is not authenticated");
        navigate("/login");
        throw new Error("User is not authenticated");
      }
      const productRef = doc(firestore, "Products", productId);
      await deleteDoc(productRef);
      setProducts((prevProducts) =>
        prevProducts.filter((p) => p.id !== productId)
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div>
      <div className={styles.actionsContainer}>
        <button className={styles.addProductBtn} onClick={openForm}>
          <FaCartShopping />
          <FaPlus /> Add Products
        </button>
        <select
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          className={styles.filterDropdown}
        >
          <option value="">All Products</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Bike">Bike</option>
          <option value="Property">Property</option>
          <option value="Furniture">Furniture</option>
        </select>
      </div>
      <h1 className={styles.leadHeadings}>
        My Products
        <FaCartShopping />
      </h1>
      {loading ? (
        <Loader />
      ) : (
        <div
          style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}
        >
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <img
                className={styles.productImage}
                src={product.images[0]}
                alt={product.name}
              />
              <div className={styles.productDetails}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>
                  {product.description}
                </p>
                <p className={styles.productPrice}>Rs. {product.price}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <button
                  className={styles.handlersBtn}
                  onClick={() => handleEditProduct(product)}
                >
                  <FaPencil />
                </button>
                <button
                  className={styles.handlersBtn}
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <FaTrashCan />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormVisible && (
        <div className={styles.glassBackground}>
          <div className={styles.addProductForm}>
            <span className={styles.closeButton} onClick={closeForm}>
              &times;
            </span>
            <h2>{isEditMode ? "Edit Product" : "Add Product"}</h2>
            <label>Choose Image</label>
            <input type="file" multiple onChange={handleFileChange} />
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
              value={type}
              required
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Select a category</option>
              <option value="Mobiles">Mobiles</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Bike">Bike</option>
              <option value="Property">Property</option>
              <option value="Furniture">Furniture</option>
            </select>

            {type === "Mobiles" && (
              <>
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  required
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <label>Model</label>
                <input
                  type="text"
                  value={model}
                  required
                  onChange={(e) => setModel(e.target.value)}
                />
                <label>Brand</label>
                <input
                  type="text"
                  value={brand}
                  required
                  onChange={(e) => setBrand(e.target.value)}
                />
                <label>Waranty</label>
                <input
                  type="number"
                  value={waranty}
                  required
                  onChange={(e) => setWaranty(e.target.value)}
                />
              </>
            )}

            {type === "Fashion" && (
              <>
                <label>Size</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                />
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </>
            )}
            {type === "Electronics" && (
              <>
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </>
            )}
            {type === "Property" && (
              <>
                <label>Location Url</label>
                <input
                  type="text"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                />
              </>
            )}
            <button
              className={styles.addProductBtn}
              onClick={() => {
                handleAddProduct();
              }}
            >
              {isEditMode ? "Update Product" : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProducts;
