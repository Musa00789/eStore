// index.js
require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // React’s URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // if you send cookies/auth headers
  })
);
app.use(express.json());

app.post("/pay", async (req, res) => {
  const { amount } = req.body;
  try {
    console.log("💰 Creating payment intent", amount);
    const charge = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });
    res.json({ success: true, charge });
  } catch (err) {
    console.error("⛔️ create-payment-intent error", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Stripe server listening on port ${process.env.PORT}`);
});
