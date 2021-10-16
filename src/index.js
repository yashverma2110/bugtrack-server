const express = require("express");
require("./db/mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRouter = require("./routers/user");
const bugRouter = require("./routers/bugs");
const projectsRouter = require("./routers/projects");

const app = express();
const port = process.env.PORT || 3001;
dotenv.config();

//registering middleware
// app.use((req, res, next) => {
//   res.status(503).send("We'll be back shortly!");
// });

//for heroku cors issue

app.use(function (req, res, next) {
  var allowedOrigins = [
    "http://localhost:3000",
    "https://kanban-yash.herokuapp.com",
    "http://kanban-yash.herokuapp.com",
  ];
  var origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header(
      "Access-Control-Allow-Origin",
      "https://kanban-yash.herokuapp.com/"
    );
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Expose-Headers", "Content-Length");
  res.header(
    "Access-Control-Allow-Headers",
    "Accept, Authorization, Content-Type, X-Requested-With, Range"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  } else {
    return next();
  }
});
app.get("/", (req, res) => res.send("Working!!!"));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(userRouter);
app.use(bugRouter);
app.use(projectsRouter);

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
