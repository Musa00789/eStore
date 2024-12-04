import React, { useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { Menu } from "antd";
import styles from "./AdminRoutes.module.css";
import {
  DashboardOutlined,
  UserOutlined,
  PlusOutlined,
  LineChartOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import Profile from "../Profile/Profile";
import Dashboard from "../Dashboard/Dashboard";
import AddProducts from "../AddProducts/AddProducts";
import Analytics from "../Analytics/Analytics";
import { auth, firestore } from "../../../firebase";
import { doc, getDoc } from "@firebase/firestore";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getStatus = async () => {
      if (!auth.currentUser?.uid) {
        navigate("/Login");
        return;
      }
      const statusRef = doc(firestore, "Users", auth.currentUser.uid);
      const statusSnapshot = await getDoc(statusRef);
      if (statusSnapshot.exists()) {
        if (statusSnapshot.data().status === "User") {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    };
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && (await getStatus())) {
        navigate(location.pathname);
      } else {
        navigate("/Login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleSignout = async () => {
    try {
      await auth.signOut().then(() => {
        // to clear the history stack
        window.history.replaceState(null, "", "/Login");
        navigate("/Login", { replace: true });
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Menu
        className={styles.sidebar}
        selectedKeys={[location.pathname]}
        onClick={({ key }) => {
          if (key === "signout") {
            handleSignout();
          } else {
            navigate(key);
          }
        }}
        items={[
          {
            label: "Dashboard",
            key: "/Admin/dashboard",
            icon: <DashboardOutlined />,
          },
          {
            label: "Profile",
            key: "/Admin/profile",
            icon: <UserOutlined />,
          },
          {
            label: "Add Products",
            key: "/Admin/addproducts",
            icon: <PlusOutlined />,
          },
          {
            label: "Analytics",
            key: "/Admin/analytics",
            icon: <LineChartOutlined />,
          },
          {
            label: "Signout",
            key: "signout",
            icon: <PoweroffOutlined />,
            danger: true,
          },
        ]}
      ></Menu>
      <div className={styles.main}>
        <AdminRoutes />
      </div>
    </div>
  );
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/addproducts" element={<AddProducts />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
};

export default Sidebar;
