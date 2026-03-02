import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { db } from "./config/firebase.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { setupChatGateway } from "./sockets/chat.gateway.js";

import authRoutes from "./routes/auth.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import leaseRoutes from "./routes/lease.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// HTTP and Socket Server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Configure this to restrict origins in prod
    methods: ["GET", "POST"],
  },
});

// Initialize Chat Gateway
setupChatGateway(io);

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Health Check Route
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", database: db ? "Connected" : "Disconnected" });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", leaseRoutes);
app.use("/payments", paymentRoutes);

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
