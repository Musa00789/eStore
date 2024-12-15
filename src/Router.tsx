import { Route, Routes } from "react-router-dom";
import Signup from "./Screens/Auth/Signup/Signup";
import Home from "./Screens/Commons/Home/Home";
import Login from "./Screens/Auth/Login/Login";
import Sidebar from "./Screens/Admin/AdminRoutes/AdminRoutes";
import UserRoutes from "./Screens/User/UserRoutes/UserRoutes";
import Error from "./Screens/Commons/Error/Error";
import ProductDetails from "./Screens/Commons/ProductDetails/ProductDetails";
import CategoryBaseAllProduct from "./Screens/Commons/AllSameCategoryProducts/CategoryBaseAllProducts";

/*TODO:
 1. In this ecommerce app I will use React Router, React Context API, Firebase,
 2. Try to impliment payment methods like jazzcash, easypaisa, stripe, paypal
  3. Try to impliment chat system 
  4. Try to impliment search system
  5. Try to impliment rating system
  6. Try to impliment review system
  7. Try to impliment order system
  8. Try to impliment tracking system
  9. Try to impliment notification system
  10. Try to impliment email system
  11. Try to impliment sms system
  12. Try to impliment social media login system
*/

const Router = () => {
  return (
    <Routes>
      <Route path="/Signup" element={<Signup />} />
      {/* <Route path="/Home" element={<Home />} /> */}
      <Route path="/Login" element={<Login />} />
      <Route path="/Admin/*" element={<Sidebar />} />
      <Route path="/User/*" element={<UserRoutes />} />
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
