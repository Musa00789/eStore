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

const AddProducts: React.FC = () => {
  const navigate = useNavigate();

  // ─── State ───────────────────────────────────────────────────────────────
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
  const [condition, setCondition] = useState("");
  const [company, setCompany] = useState("");
  const [milage, setMilage] = useState("");
  const [kmDriven, setKmDriven] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [locationUrl, setLocationUrl] = useState("");

  const [products, setProducts] = useState<any[]>([]);
  const [sellerId, setSellerId] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Effects ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setSellerId(auth.currentUser?.uid || "");
    getProducts();
  }, [selectedTypeFilter]);

  // ─── Fetch / CRUD ─────────────────────────────────────────────────────────

  const getProducts = async () => {
    setLoading(true);
    try {
      const uId = auth.currentUser?.uid;
      if (!uId) {
        navigate("/login");
        return;
      }

      const colRef = collection(firestore, "Products");
      const q = selectedTypeFilter
        ? query(
            colRef,
            where("sellerId", "==", uId),
            where("type", "==", selectedTypeFilter)
          )
        : query(colRef, where("sellerId", "==", uId));

      const snap = await getDocs(q);
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      // sort newest first
      arr.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setProducts(arr);
    } catch (err) {
      console.error("Fetch products failed:", err);
      alert("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  // const handleAddProduct = async () => {
  //   setLoading(true);
  //   try {
  //     const productId = isEditMode && editProductId ? editProductId : uuidv4();

  //     // 1) upload new files, if any
  //     let downloadUrls: string[] = [];
  //     if (file.length > 0) {
  //       const uploadTasks = file.map((f) => {
  //         const storageRef = ref(storage, `products/${productId}/${f.name}`);
  //         const uploadTask = uploadBytesResumable(storageRef, f);
  //         return new Promise<string>((resolve, reject) => {
  //           uploadTask.on(
  //             "state_changed",
  //             (snap) => {
  //               const prog = (snap.bytesTransferred / snap.totalBytes) * 100;
  //               setUploadProgress(prog);
  //             },
  //             reject,
  //             async () => {
  //               const url = await getDownloadURL(uploadTask.snapshot.ref);
  //               resolve(url);
  //             }
  //           );
  //         });
  //       });
  //       downloadUrls = await Promise.all(uploadTasks);
  //     } else if (isEditMode && editProductId) {
  //       // 2) retain existing images if editing and no new files
  //       const existing = products.find((p) => p.id === editProductId);
  //       downloadUrls = existing?.images || [];
  //     }

  //     const uId = auth.currentUser?.uid;
  //     if (!uId) throw new Error("Not authenticated");

  //     // 3) assemble payload
  //     const productData: any = {
  //       id: productId,
  //       sellerId: uId,
  //       name: productName,
  //       price: productPrice,
  //       description: productDescription,
  //       images: downloadUrls,
  //       type,
  //       clicks: 0,
  //       views: 0,
  //       purchases: 0,
  //       timestamp: Date.now(),
  //       ...(type === "Fashion" && { size, quantity }),
  //       ...(type === "Electronics" && { quantity }),
  //       ...(type === "Property" && { locationUrl }),
  //       ...((type === "Vehicle" || type === "Bike") && {
  //         company,
  //         milage,
  //         kmDriven,
  //         condition,
  //         vehicleModel,
  //       }),
  //       ...(type === "Mobiles" && { quantity, model, brand, waranty }),
  //     };

  //     await setDoc(doc(firestore, "Products", productId), productData);
  //     await getProducts();
  //     closeForm();
  //   } catch (err) {
  //     console.error("Add/update failed:", err);
  //     alert("Unable to save product.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleAddProduct = async () => {
    setLoading(true);
    try {
      const productId = isEditMode && editProductId ? editProductId : uuidv4();

      // 1) determine downloadUrls
      let downloadUrls: string[] = [];

      if (file.length > 0) {
        // upload new files
        const uploadTasks = file.map((f) => {
          const storageRef = ref(storage, `products/${productId}/${f.name}`);
          const uploadTask = uploadBytesResumable(storageRef, f);
          return new Promise<string>((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snap) => {
                const prog = (snap.bytesTransferred / snap.totalBytes) * 100;
                setUploadProgress(prog);
              },
              reject,
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              }
            );
          });
        });
        downloadUrls = await Promise.all(uploadTasks);
      } else if (isEditMode && editProductId) {
        // **retain** existing images if no new upload
        const existing = products.find((p) => p.id === editProductId);
        downloadUrls = existing?.images || [];
      }

      // 2) assemble payload
      const uId = auth.currentUser?.uid;
      if (!uId) throw new Error("Not authenticated");

      const payload: any = {
        id: productId,
        sellerId: uId,
        name: productName,
        price: productPrice,
        description: productDescription,
        images: downloadUrls,
        type,
        clicks: 0,
        views: 0,
        purchases: 0,
        timestamp: Date.now(),
        ...(type === "Fashion" && { size, quantity }),
        ...(type === "Electronics" && { quantity }),
        ...(type === "Property" && { locationUrl }),
        ...((type === "Vehicle" || type === "Bike") && {
          company,
          milage,
          kmDriven,
          condition,
          vehicleModel,
        }),
        ...(type === "Mobiles" && { quantity, model, brand, waranty }),
      };

      // 3) write to Firestore
      await setDoc(doc(firestore, "Products", productId), payload);
      await getProducts();
      closeForm();
    } catch (err) {
      console.error("Add/update failed:", err);
      alert("Unable to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmDelete = window.confirm("Delete this product?");
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const uId = auth.currentUser?.uid;
      if (!uId) throw new Error("Not authenticated");
      await deleteDoc(doc(firestore, "Products", productId));
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Unable to delete product.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Form Helpers ────────────────────────────────────────────────────────
  const openForm = () => setIsFormVisible(true);
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
    setModel("");
    setBrand("");
    setWaranty("");
    setCondition("");
    setCompany("");
    setMilage("");
    setKmDriven("");
    setVehicleModel("");
    setLocationUrl("");
    setUploadProgress(0);
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? Array.from(e.target.files) : []);
  };
  const handleEditProduct = (p: any) => {
    setIsEditMode(true);
    setEditProductId(p.id);
    setProductName(p.name);
    setProductPrice(p.price);
    setProductDescription(p.description);
    setType(p.type);
    setSize(p.size || "");
    setQuantity(p.quantity || "");
    setModel(p.model || "");
    setBrand(p.brand || "");
    setWaranty(p.waranty || "");
    setCondition(p.condition || "");
    setCompany(p.company || "");
    setMilage(p.milage || "");
    setKmDriven(p.kmDriven || "");
    setVehicleModel(p.vehicleModel || "");
    setLocationUrl(p.locationUrl || "");
    setFile([]);
    openForm();
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* GLOBAL LOADER OVERLAY */}
      {loading && (
        <div className={styles.loaderOverlay}>
          <Loader />
        </div>
      )}

      {/* ACTION BAR */}
      <div className={styles.actionsContainer}>
        <button
          className={styles.addProductBtn}
          onClick={openForm}
          disabled={loading}
        >
          <FaCartShopping /> <FaPlus /> Add Products
        </button>
        <select
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(e.target.value)}
          className={styles.filterDropdown}
          disabled={loading}
        >
          <option value="">All Products</option>
          <option value="PKR0">Product For Free</option>
          <option value="Mobiles">Mobiles</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Bike">Bike</option>
          <option value="Property">Property</option>
          <option value="Furniture">Furniture</option>
        </select>
      </div>

      {/* PRODUCT GRID */}
      <h1 className={styles.leadHeadings}>
        My Products <FaCartShopping />
      </h1>
      <div className={styles.productGrid}>
        {products.map((p) => (
          <div key={p.id} className={styles.productCard}>
            <img
              src={p.images[0]}
              alt={p.name}
              className={styles.productImage}
            />
            <div className={styles.productDetails}>
              <h3 className={styles.productName}>{p.name}</h3>
              <p className={styles.productDescription}>
                {p.description.length > 20
                  ? `${p.description.slice(0, 20)}…`
                  : p.description}
              </p>
              <p className={styles.productPrice}>Rs. {p.price}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <button
                className={styles.handlersBtn}
                onClick={() => handleEditProduct(p)}
                disabled={loading}
              >
                <FaPencil />
              </button>
              <button
                className={styles.handlersBtn}
                onClick={() => handleDeleteProduct(p.id)}
                disabled={loading}
              >
                <FaTrashCan />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT FORM */}
      {isFormVisible && (
        <div className={styles.glassBackground}>
          <div className={styles.addProductForm}>
            <span className={styles.closeButton} onClick={closeForm}>
              &times;
            </span>
            <h4>{isEditMode ? "Edit Product" : "Add Product"}</h4>

            {/* IMAGE INPUT */}
            <label>Choose Image</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={loading}
            />

            {/* BASIC FIELDS */}
            <div className={styles.formGrid}>
              <label>Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={loading}
              />

              <label>Product Description</label>
              <input
                type="text"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                disabled={loading}
              />

              <label>Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={loading}
              >
                <option value="">Select a category</option>
                <option value="PKR0">Product For Free</option>
                <option value="Mobiles">Mobiles</option>
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Bike">Bike</option>
                <option value="Property">Property</option>
                <option value="Furniture">Furniture</option>
              </select>

              <label>Product Price</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                disabled={loading || type === "PKR0"}
              />
            </div>

            {/* TYPE‑SPECIFIC FIELDS */}
            {type === "PKR0" && (
              <>
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={loading}
                />
                <label>Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={loading}
                />
              </>
            )}
            {type === "Mobiles" && (
              <>
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={loading}
                />
                <label>Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading}
                />
                <label>Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={loading}
                />
                <label>Waranty</label>
                <input
                  type="number"
                  value={waranty}
                  onChange={(e) => setWaranty(e.target.value)}
                  disabled={loading}
                />
              </>
            )}
            <div className={styles.formGrid}>
              {type === "Fashion" && (
                <>
                  <label>Size</label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    disabled={loading}
                    placeholder="Leave empty if not clothing"
                  />
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </>
              )}
              {(type === "Vehicle" || type === "Bike") && (
                <>
                  <label>Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={loading}
                  />
                  <label>Milage</label>
                  <input
                    type="text"
                    value={milage}
                    onChange={(e) => setMilage(e.target.value)}
                    disabled={loading}
                  />
                  <label>Km's Driven</label>
                  <input
                    type="text"
                    value={kmDriven}
                    onChange={(e) => setKmDriven(e.target.value)}
                    disabled={loading}
                  />
                  <label>Model</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    disabled={loading}
                  />
                  <label>Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select one</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Old">Old</option>
                  </select>
                </>
              )}
            </div>

            <button
              className={styles.addProductBtn}
              onClick={handleAddProduct}
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProducts;
