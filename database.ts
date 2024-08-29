import { MongoClient, Collection } from "mongodb";
import dotenv from "dotenv";
import { Request, Response, Express} from "express";
import { Series, User } from "./types";
import bcrypt from 'bcrypt';
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);

const userCollection : Collection<User> = client.db("herex").collection<User>("Users");
const seriesCollection : Collection<Series> = client.db("herex").collection<Series>("Series");

async function seedDatabase() {
    const series : Series[] = await getSeries();
    if (series.length == 0) {
        console.log("Database is empty, loading users from API")
        const response = await fetch("https://raw.githubusercontent.com/similonap/json/master/series.json");
        const series : Series[] = await response.json();
        await seriesCollection.insertMany(series);
    }

    const user : User[] = [
        {
            username: "Admin", password: "CasioCasio10",
            id: 0,
            role: "ADMIN"
        },
        {
            username: "User", password: "CasioCasio10",
            id: 1,
            role: "USER"
        }
    ];

    const saltRounds : number = 10;

    user[0].password = await bcrypt.hash("CasioCasio10", saltRounds);
    user[1].password = await bcrypt.hash("CasioCasio10", saltRounds);

    if (await userCollection.countDocuments() === 0) {
        await userCollection.insertMany(user);
    }


}

export async function getSeries(sortField: string, direction: string, req: Request, q?: string) {
    sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    direction = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
    return await seriesCollection.find().toArray();
    

}

export async function login(username: string, password: string) {
    if (username === "" || password === "") {
        throw new Error("username and password required");
    }
    let user : User | null = await userCollection.findOne<User>({username: username});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}
export async function getUsers() {
    return await userCollection.find({}).toArray();
}

export async function deleteSeries(id: string) {
    return await seriesCollection.deleteOne({id: id});

}

export async function getNextId() {
    let users : User[] = await userCollection.find({}).sort({id: -1}).limit(1).toArray();
    if (users.length == 0) {
        return 1;
    } else {
        return users[0].id + 1;
    }
}

export async function createUser(user: User) {
    user.id = await getNextId();
    return await userCollection.insertOne(user);
}


async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function connect() {
    try {
        await client.connect();
        await seedDatabase();   
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}