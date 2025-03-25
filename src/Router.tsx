import { Route, Routes } from "react-router-dom";
import Signup from "./Screens/Auth/Signup/Signup";
import Home from "./Screens/Commons/Home/Home";
import Login from "./Screens/Auth/Login/Login";
import Sidebar from "./Screens/Seller/SellerRoutes/SellerRoutes";
import UserRoutes from "./Screens/Buyer/UserRoutes/UserRoutes";
import Error from "./Screens/Commons/Error/Error";
import ProductDetails from "./Screens/Commons/ProductDetails/ProductDetails";
import CategoryBaseAllProduct from "./Screens/Commons/AllSameCategoryProducts/CategoryBaseAllProducts";
import AdminRoutes from "./Screens/Admin/AdminRoutes";

const Router = () => {
  return (
    <Routes>
      <Route path="/Signup" element={<Signup />} />
      {/* <Route path="/Home" element={<Home />} /> */}
      <Route path="/Login" element={<Login />} />
      <Route path="/Seller/*" element={<Sidebar />} />
      <Route path="/Buyer/*" element={<UserRoutes />} />
      <Route path="/Admin/*" element={<AdminRoutes />} />
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
