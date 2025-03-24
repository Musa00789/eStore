import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "./firebase";
import Signup from "./Screens/Auth/Signup/Signup";
import Home from "./Screens/Commons/Home/Home";
import ProtectedRoute from "./components/ProtectedRoutes";
import Login from "./Screens/Auth/Login/Login";
import Sidebar from "./Screens/Seller/SellerRoutes/SellerRoutes";
import UserRoutes from "./Screens/Buyer/UserRoutes/UserRoutes";
import AdminRoutes from "./Screens/Admin/AdminRoutes";
import Error from "./Screens/Commons/Error/Error";
import ProductDetails from "./Screens/Commons/ProductDetails/ProductDetails";
import CategoryBaseAllProduct from "./Screens/Commons/AllSameCategoryProducts/CategoryBaseAllProducts";

const Router = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const userRef = doc(firestore, "Users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log("User Role:", userData.status);

            if (userData.status === "User") {
              navigate("/Buyer/home", { replace: true });
            } else if (userData.status === "Seller") {
              navigate("/Seller/dashboard", { replace: true });
            } else if (userData.status === "Admin") {
              navigate("/Admin/dashboard", { replace: true });
            } else {
              console.error("Unknown role:", userData.status);
              navigate("/Login");
            }
          } else {
            console.error("User data not found");
            navigate("/Login");
          }
        } else {
          console.log("No user logged in");
          navigate("/Login");
        }
      });
    };

    checkUserRole();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/Signup" element={<Signup />} />
      <Route path="/Login" element={<Login />} />
      {/* <Route path="/Seller/*" element={<Sidebar />} />
      <Route path="/Buyer/*" element={<UserRoutes />} />
      <Route path="/Admin/*" element={<AdminRoutes />} /> */}
      <Route
        path="/Buyer/*"
        element={
          <ProtectedRoute allowedRole="User">
            <UserRoutes />
          </ProtectedRoute>
        }
      />
      // Seller routes
      <Route
        path="/Seller/*"
        element={
          <ProtectedRoute allowedRole="Seller">
            <Sidebar />
          </ProtectedRoute>
        }
      />
      // Admin routes
      <Route
        path="/Admin/*"
        element={
          <ProtectedRoute allowedRole="Admin">
            <AdminRoutes />
          </ProtectedRoute>
        }
      />
      <Route path="/error" element={<Error />} />
      <Route path="/product/:productName" element={<ProductDetails />} />
      <Route
        path="/allSameCategoryProducts"
        element={<CategoryBaseAllProduct />}
      />
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default Router;
