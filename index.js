import cors from "cors";
import express from 'express';
import * as dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { userRouter } from './Routes/users.js';


dotenv.config();

const app = express();

app.use(cors()); 

app.use(express.json());

const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

async function createConnection(){
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongo is connected")
    return client;
}
export const client = await createConnection();

app.get("/", async (req,res)=>{
    res.send("Hi There!!!")
});

app.use("/users",userRouter);

app.listen(PORT,()=> console.log("Server started on PORT",PORT));
