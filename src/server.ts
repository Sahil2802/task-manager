import "dotenv/config";
import express from "express";
import auth from "./routes/auth.routes.js";
import tasks from "./routes/tasks.routes.js";

// dotenv.config();
// Creates an express application
const app = express();
app.use(express.json());

// Routes
app.use("/api/auth", auth);
app.use("/api/tasks", tasks);

app.get("/", (_req, res) => {
  res.send("Hello world!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running in http://localhost:${process.env.PORT}`);
});
