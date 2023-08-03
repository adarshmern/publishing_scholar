const express = require('express');
const app=express();
const connection = require('../config/db');
const cors=require('cors');
const userRoute=require('./routes/userRoute');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

//middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use('/api',userRoute);


server.listen(process.env.PORT, async () => {
    await connection();
    console.log(`server started at localhost:${process.env.PORT}`);
})