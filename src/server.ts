import express from "express";
import dotenv from "dotenv";

dotenv.config();

// Creates an express application
const app = express();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running in ${process.env.PORT}`);
});
