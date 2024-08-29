import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import authRouter from "./router/authRouter";
import rootRouter from "./router/rootRouter";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));

app.set("port", process.env.PORT ?? 3000);

app.use("/auth", authRouter);
app.use("/", rootRouter);
app.use((req, res, next) => {
    res.status(404).render("/", { message: "Page not found" });
});


export default app;