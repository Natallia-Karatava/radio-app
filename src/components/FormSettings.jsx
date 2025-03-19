import React, { useState } from "react";
import "../styles/Form.css";

const FormSettings = () => {
  const [activeTab, setActiveTab] = useState("username");

  // States for username tab
  const [oldUsername, setOldUsername] = useState("current_user"); // Example old username
  const [newUsername, setNewUsername] = useState("");
  const [passwordForUsername, setPasswordForUsername] = useState("");

  // States for password tab
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  return (
    <div className="account-settings">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "username" ? "tab active" : "tab"}
          onClick={() => setActiveTab("username")}
        >
          Username
        </button>
        <button
          className={activeTab === "password" ? "tab active" : "tab"}
          onClick={() => setActiveTab("password")}
        >
          Passwort
        </button>
      </div>

      {/* Username Tab */}
      {activeTab === "username" && (
        <div className="tab-content">
          <h2>Change Username</h2>
          <input
            type="text"
            value={oldUsername}
            disabled
            placeholder="Old username"
          />
          <input
            type="text"
            placeholder="New username*"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter password*"
            value={passwordForUsername}
            onChange={(e) => setPasswordForUsername(e.target.value)}
          />
          <button>Change Username</button>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="tab-content">
          <h2>Change Password</h2>
          <input
            type="password"
            placeholder="enter old password *"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="enter new password *"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password *"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          <button>Change Password</button>
        </div>
      )}
    </div>
  );
};

export default FormSettings;
