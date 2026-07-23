const redis = require("redis");

const logger = require("../utils/logger");

const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (error) => {
  logger.error("Redis error", error);
});

client
  .connect()
  .then(() => logger.info("Redis connected successfully"))
  .catch((error) => {
    logger.error("Redis connection failed", error);
    console.log(error);
  });

module.exports = client;
