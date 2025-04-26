import { Route, Routes } from "react-router-dom";
import Home from "../../Commons/Home/Home";
import Cart from "../Cart/Cart";
import Error from "../../Commons/Error/Error";
import Profile from "../Profile/Profile";
import Settings from "../Settings/Settings";
import Checkout from "../Checkout/Checkout";
import Chat from "../BuyerChat/BuyerChat";
import ForgotPassword from "../../Auth/ForgotPassword/ForgotPassword";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const UserRoutes = () => {
  const stripePromise = loadStripe(
    "pk_test_51Qmx7ZDw4CiChweonZ693r0BWP2ODTG0rZlq8RuJR1vJwpZxVfGCVhvICxMU5fLdvyK04YDLhhGJNzY6V7E7nZCF00s3uqO3XG"
  );
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/error" element={<Error />} />
      <Route
        path="/checkout"
        element={
          <Elements stripe={stripePromise}>
            <Checkout />
          </Elements>
        }
      />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
    </Routes>
  );
};
export default UserRoutes;
