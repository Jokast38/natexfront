const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');

dotenv.config({path: `.env.${process.env.NODE_ENV || 'development'}`});

const app = express();
const HOST = process.env.SRV_HOST || "localhost";
const PORT = process.env.SRV_PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: '*',
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT"],
  })
);

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
