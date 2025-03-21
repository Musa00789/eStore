import { Route, Routes } from "react-router-dom";
import Home from "../../Commons/Home/Home";
import Cart from "../Cart/Cart";
import Error from "../../Commons/Error/Error";
import Profile from "../Profile/Profile";
import Settings from "../Settings/Settings";
import Checkout from "../Checkout/Checkout";
import Chat from "../BuyerChat/BuyerChat";
import ForgotPassword from "../../Auth/ForgotPassword/ForgotPassword";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/error" element={<Error />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
    </Routes>
  );
};
export default UserRoutes;
