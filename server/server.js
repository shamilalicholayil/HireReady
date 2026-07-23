require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

require("./src/config/env");
require("./src/config/redis");

const http = require("http");

const app = require("./src/app");
const { initSocket } = require("./src/config/socket");
const connectDB = require("./src/config/db");
const logger = require("./src/utils/logger");

const server = http.createServer(app);
initSocket(server);

const port = process.env.PORT || 5000;

connectDB();

server.listen(port, () => {
  logger.info(`Server is running on port ${process.env.PORT}`);
});
