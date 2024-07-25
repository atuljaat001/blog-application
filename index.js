const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const route = require("./routes/userRoutes");
const { mongoConnect } = require("./connection");

app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

mongoConnect("mongodb://127.0.0.1:27017/blogify");
const PORT = 8000;
app.use("/", route);
app.listen(PORT, () => {
  console.log(`Server is started listening at http://localhost:${PORT}/login`);
});
