import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import riderRouter from "./routes/rider.routes.js";
import itemRouter from "./routes/item.routes.js";
import cartRouter from "./routes/cart.routes.js";

dotenv.config({ path: "./.env" });

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.use("/temp", express.static("public/temp"));

app.use("/user", userRouter);
app.use("/rider", riderRouter);
app.use("/item", itemRouter);
app.use("/cart", cartRouter);

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export { app };
