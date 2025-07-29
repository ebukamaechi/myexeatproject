require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoute");
const cookieParser = require("cookie-parser");
const studentRoutes = require("./routes/studentRoutes");
const quotaRoutes = require("./routes/quotaRoutes");
const exeatRoutes = require("./routes/exeatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const pricingRoutes = require("./routes/pricingRoutes");

//creating the express app
const app = express();

//middleware
app.use(bodyParser.json());
app.use(cookieParser()); // <-- Middleware for parsing cookies
// app.use(cors());
app.use(
  cors({
    origin: [`${process.env.FRONTEND_URL}`,`http://localhost:19006`], // exact origin, not "*"
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "views")));

//basic route
app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "index.html"));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//Users routes
app.use("/api/users", userRouter);

//auth routes
app.use("/api/auth", authRouter);

//student Routes
app.use("/api/students", studentRoutes);

//quota Routes
app.use("/api/quota", quotaRoutes);

//exeat Routes
app.use("/api/exeats", exeatRoutes);

//pricing Routes
app.use("/api/pricing", pricingRoutes);

//Payment Routes
app.use("/api/payments", paymentRoutes);

//error handling middleware
// app.use((err, req, res, next) => {

//   console.error(err);
//   res.status(500).send("Something Broke:", err.message);
//   next(err);
// });

app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ error: "File too large. Max size is 100KB." });
  }
  if (err.message === "Only PNG and JPEG images are allowed") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).send("Something Broke:", err.message);
  next(err);
});

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

//start server and connect to mongoDB
console.log("Attempting to connect to MongoDB...");

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// Optional: Listen for Mongoose connection events
mongoose.connection.on("connecting", () => {
  console.log("🔄 MongoDB is connecting...");
});

mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose is connected to MongoDB.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected.");
});
