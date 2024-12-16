import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { firestore, auth } from "../../../firebase";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import styles from "./Analytics.module.css";
import Loader from "../../../components/Loader/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

interface ChatData {
  totalChats: number;
  avgMessagesPerChat: number;
  responseRate: string;
}

interface ProductStats {
  productName: string;
  views: number;
  clicks: number;
  purchases: number;
}

const Analytics = () => {
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          alert("You need to log in to view analytics.");
          return;
        }

        const chatQuery = query(
          collection(firestore, "Chats"),
          where("participants", "array-contains", uid)
        );
        const chatSnapshot = await getDocs(chatQuery);
        const totalChats = chatSnapshot.size;

        let totalMessages = 0;
        let chatsWithSellerResponse = 0;

        for (const chatDoc of chatSnapshot.docs) {
          const chatId = chatDoc.id;

          const messagesQuery = query(
            collection(firestore, `Chats/${chatId}/Messages`)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          const messages = messagesSnapshot.docs.map((msg) => msg.data());

          totalMessages += messages.length;

          const sellerResponse = messages.find((msg) => msg.senderID === uid);
          if (sellerResponse) chatsWithSellerResponse += 1;
        }

        const avgMessagesPerChat =
          totalChats > 0 ? Math.round(totalMessages / totalChats) : 0;
        const responseRate =
          totalChats > 0
            ? `${Math.round((chatsWithSellerResponse / totalChats) * 100)}%`
            : "N/A";

        setChatData({
          totalChats,
          avgMessagesPerChat,
          responseRate,
        });

        const productQuery = query(
          collection(firestore, "Products"),
          where("sellerId", "==", uid)
        );
        const productSnapshot = await getDocs(productQuery);
        const stats: ProductStats[] = [];
        productSnapshot.forEach((doc) => {
          const data = doc.data();
          stats.push({
            productName: data.title,
            views: data.views || 0,
            clicks: data.clicks || 0,
            purchases: data.purchases || 0,
          });
        });

        setProductStats(stats);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading)
    return (
      <div className={styles.loader}>
        Loading...
        <Loader />
      </div>
    );

  return (
    <div className={styles.analytics}>
      <h1>Seller Analytics</h1>

      <div className={styles.section}>
        <h2>Chat Engagement</h2>
        {chatData ? (
          <>
            <div className={styles.chartContainer}>
              <Pie
                data={{
                  labels: ["Responded Chats", "Unresponded Chats"],
                  datasets: [
                    {
                      data: [
                        parseInt(chatData.responseRate),
                        100 - parseInt(chatData.responseRate),
                      ],
                      backgroundColor: ["#0078ff", "#ff5252"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: { label: (ctx) => `${ctx.raw} Chats` },
                    },
                  },
                }}
              />
            </div>

            <p>Total Chats: {chatData.totalChats}</p>
            <p>Average Messages per Chat: {chatData.avgMessagesPerChat}</p>
            <p>Response Rate: {chatData.responseRate}</p>
          </>
        ) : (
          <p>No chat data available.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2>Product Insights</h2>
        {productStats.length > 0 ? (
          <Bar
            data={{
              labels: productStats.map((p) => p.productName),
              datasets: [
                {
                  label: "Views",
                  data: productStats.map((p) => p.views),
                  backgroundColor: "#0078ff",
                },
                {
                  label: "Clicks",
                  data: productStats.map((p) => p.clicks),
                  backgroundColor: "#ff9800",
                },
                {
                  label: "Purchases",
                  data: productStats.map((p) => p.purchases),
                  backgroundColor: "#00c853",
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
              },
              scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true },
              },
            }}
          />
        ) : (
          <p>No product stats available.</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
