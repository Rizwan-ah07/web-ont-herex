import express from "express";
import { loginMiddleware } from "../middleware/jwtMiddleware";
import * as jwt from 'jsonwebtoken';
import { connect,createUser, getUsers } from "../database";
import { User } from "../types";



export default function loginRouter() {
    const router = express.Router();

    router.get("/login", (req, res) => {
        res.render("login");
    });

    router.post("/login", loginMiddleware, async(req, res) => {
        const username = req.session.username;
        const token = jwt.sign(username, process.env.JWT_SECRET!, { expiresIn: "1d" });
        res.cookie("jwt", token, { httpOnly: true, sameSite: "lax", secure: true });
        res.redirect("/");
    });

    router.get("/logout", (req, res) => {
        res.redirect("/login")
    });

    router.post("/logout", loginMiddleware, async (req, res) => {
        res.clearCookie("jwt");
        res.redirect("/login");
    });

    router.get("/register", (req, res) => {
        res.render("register", { error: "" });
      });

router.post("/register", (req, res) => {
  let username: string = req.body.username;
  let password: string = req.body.password;

  if (username === "" || password === "") {
    res.render("register", { error: "All fields are required" });
  } else {
    console.log("Data is valid, saving user");
    
    res.redirect("/success");
  }
});

router.get("/users", async(req, res) => {
    let users : User[] = await getUsers();
    res.render("users/index", {
        users: users
    });
});

    return router;
}