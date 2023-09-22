import { Route, Routes } from "react-router-dom";
import Signup from "./Screens/Signup/Signup";
import Home from "./Screens/Home/Home";
import Login from "./Screens/Login/Login";
import Sidebar from "./Screens/Admin/AdminRoutes/AdminRoutes";
import UserRoutes from "./Screens/User/UserRoutes/UserRoutes";

/*TODO:
 1. In this ecommerce app I will use Material UI, React Router, React Context API, Firebase,
 2. Try to impliment payment methods like jazzcash, easypaisa, stripe, paypal
 3. Try to impliment login and signup with firebase using glass morphism   
*/

const App = () => {
  return (
    <Routes>
      <Route path="/Signup" element={<Signup />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Admin/*" element={<Sidebar />} />
      <Route path="/User/*" element={<UserRoutes />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
};
export default App;
