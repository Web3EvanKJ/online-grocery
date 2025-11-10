import express from "express";
import cors from "cors";
import cartRouter from "./routes/cart.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/cart", cartRouter);

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
