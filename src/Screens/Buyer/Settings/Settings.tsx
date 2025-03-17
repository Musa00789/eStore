import React, { useState } from "react";
import ChangePassword from "../../AdditionalBuyerScreens/ChangePassword/ChangePassword";
import ProfileSettings from "../../AdditionalBuyerScreens/ProfileSettings/ProfileSettings";
import AddressSettings from "../../AdditionalBuyerScreens/AddressSettings/AddressSettings";
import Notifications from "../../AdditionalBuyerScreens/Notifications/Notifications";
import DeleteAccount from "../../AdditionalBuyerScreens/DeleteAccount/DeleteAccount";
import styles from "./Settings.module.css";
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Footer from "../../../components/Footer/Footer";

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      <div className={styles.settingsContainer}>
        <button
          className={styles.homeBtn}
          onClick={() => {
            navigate("/");
          }}
        >
          <FaHome />
        </button>
        <h2 className={styles.settingsTitle}>Account Settings</h2>

        <div className={styles.settingsTabs}>
          {["profile", "password", "address", "notifications", "delete"].map(
            (tab) => (
              <button
                key={tab}
                className={activeTab === tab ? styles.active : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        <div className={styles.settingsContent}>
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "password" && <ChangePassword />}
          {activeTab === "address" && <AddressSettings />}
          {activeTab === "notifications" && <Notifications />}
          {activeTab === "delete" && <DeleteAccount />}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Settings;
