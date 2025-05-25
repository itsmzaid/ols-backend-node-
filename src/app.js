import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import riderRouter from "./routes/rider.routes.js";
import itemRouter from "./routes/item.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import locationRouter from "./routes/location.routes.js";
import adminRouter from "./routes/admin.routes.js";
import chatRouter from "./routes/chat.routes.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(
  cors({
    // origin: process.env.CORS_ORIGIN,
    origin: "*",
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use("/temp", express.static("public/temp"));

app.use("/user", userRouter);
app.use("/rider", riderRouter);
app.use("/item", itemRouter);
app.use("/cart", cartRouter);
app.use("/location", locationRouter);
app.use("/order", orderRouter);
app.use("/admin", adminRouter);
app.use("/chat", chatRouter);

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export { app };
