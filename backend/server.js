import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import User from "./models/User.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// ---------- SOCKET.IO ----------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH"],
  },
});

// make io available everywhere
app.set("io", io);

// ---------- ADMIN SEED ----------
const seedAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin";

    if (!email || !password) {
      console.log("⚠️ Admin env not set, skipping seed");
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("✅ Admin already exists:", email);
      return;
    }

    await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    console.log("🚀 Admin user created:", email);
  } catch (err) {
    console.error("Admin seed error:", err);
  }
};

// ---------- DB + START ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedAdminUser();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
  });

export { io };
