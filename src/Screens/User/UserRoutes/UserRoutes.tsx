import { Route, Routes } from "react-router-dom";
import Home from "../../Home/Home";
import Cart from "../Cart/Cart";
import Profile from "../Profile/Profile";
import Settings from "../Settings/Settings";

const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};
export default UserRoutes;
