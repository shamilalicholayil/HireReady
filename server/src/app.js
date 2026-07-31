const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const expressMongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const passport = require("passport");

require("./config/passport");
const { corsAllowedOrigins } = require("../src/config/env");

const logger = require("./utils/logger");
const errorMiddleware = require("./middlewares/error.middleware");
const routes = require("./routes/v1/index");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsAllowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(expressMongoSanitize());
app.use(xssClean());
app.use(passport.initialize());

app.use("/api/v1", routes);

app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running.",
  });
});

app.use(errorMiddleware);

module.exports = app;
