import React, { useState, useEffect } from "react";
import { auth, firestore } from "../../../firebase";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const [sellerName, setSellerName] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalChats, setTotalChats] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          alert("You need to log in.");
          navigate("/login");
          return;
        }

        const sellerQuery = query(
          collection(firestore, "Users"),
          where("uid", "==", uid)
        );
        const sellerSnapshot = await getDocs(sellerQuery);
        if (!sellerSnapshot.empty) {
          const sellerData = sellerSnapshot.docs[0].data();
          setSellerName(sellerData.name || "Seller");
        }

        const salesQuery = query(
          collection(firestore, "Orders"),
          where("sellerId", "==", uid)
        );
        const salesSnapshot = await getDocs(salesQuery);
        let totalRevenue = 0;
        salesSnapshot.forEach((doc) => {
          totalRevenue += doc.data().amount;
        });
        setTotalSales(totalRevenue);

        const productsQuery = query(
          collection(firestore, "Products", uid, "User Products"),
          where("sellerId", "==", uid)
        );
        const productsSnapshot = await getDocs(productsQuery);
        setTotalProducts(productsSnapshot.size);

        const chatsQuery = query(
          collection(firestore, "Chats"),
          where("participants", "array-contains", uid)
        );
        const chatsSnapshot = await getDocs(chatsQuery);
        setTotalChats(chatsSnapshot.size);

        const recentOrders = salesSnapshot.docs.slice(0, 5).map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentOrders(recentOrders);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcome}>
        <h1>Welcome, {sellerName}!</h1>
        <p>Here's an overview of your store's performance.</p>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metricCard}>
          <h3>Total Sales</h3>
          <p>${totalSales}</p>
        </div>
        <div className={styles.metricCard}>
          <h3>Total Products</h3>
          <p>{totalProducts}</p>
        </div>
        <div className={styles.metricCard}>
          <h3>Total Chats</h3>
          <p>{totalChats}</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Recent Orders</h2>
        {recentOrders.length > 0 ? (
          <ul className={styles.orderList}>
            {recentOrders.map((order) => (
              <li key={order.id}>
                Order #{order.id}: ${order.amount} - {order.date}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent orders.</p>
        )}
      </div>

      <div className={styles.quickLinks}>
        <button onClick={() => navigate("/Seller/addproducts")}>
          Add New Product
        </button>
        <button onClick={() => navigate("/Seller/analytics")}>
          View Analytics
        </button>
        <button onClick={() => navigate("/Seller/seller-chat")}>
          Open Chats
        </button>
        <button onClick={() => navigate("/Seller/profile")}>
          Edit Profile
        </button>
      </div>

      <div className={styles.section}>
        <h2>Sales Performance</h2>
        <Bar
          data={{
            labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
            datasets: [
              {
                label: "Sales ($)",
                data: recentOrders.map((order) => order.amount),
                backgroundColor: "#0078ff",
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: { beginAtZero: true },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
