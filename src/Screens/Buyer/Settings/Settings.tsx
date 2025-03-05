import React, { useState } from "react";
import ChangePassword from "../../AdditionalBuyerScreens/ChangePassword/ChangePassword";
import ProfileSettings from "../../AdditionalBuyerScreens/ProfileSettings/ProfileSettings";
import AddressSettings from "../../AdditionalBuyerScreens/AddressSettings/AddressSettings";
import Notifications from "../../AdditionalBuyerScreens/Notifications/Notifications";
import DeleteAccount from "../../AdditionalBuyerScreens/DeleteAccount/DeleteAccount";
import "./settings.module.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="settings-container">
      <h2 className="settings-title">Account Settings</h2>

      {/* Tabs */}
      <div className="settings-tabs">
        {["profile", "password", "address", "notifications", "delete"].map(
          (tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Dynamic Content */}
      <div className="settings-content">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "password" && <ChangePassword />}
        {activeTab === "address" && <AddressSettings />}
        {activeTab === "notifications" && <Notifications />}
        {activeTab === "delete" && <DeleteAccount />}
      </div>
    </div>
  );
};

export default Settings;
