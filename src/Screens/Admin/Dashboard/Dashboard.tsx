import React, { useEffect } from "react";
import { auth } from "../../../firebase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const check = async () => {
      try {
        const uid = await auth.currentUser?.uid;
      } catch (err) {
        const uid = await auth.currentUser?.uid;
        if (!uid) {
          navigate("/Login");
        } else {
          alert("Error fetching user data" + err);
        }
      }
    };
    check();
  }, []);
  return (
    <div>
      <h1> Dashboard Content</h1>
    </div>
  );
};
export default Dashboard;
