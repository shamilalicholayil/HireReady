const { RateLimiterRedis } = require("rate-limiter-flexible");

const redisClient = require("../config/redis");

const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const ROLES = require("../constants/roles");

function createRateLimiter({ keyPrefix, points, duration, keyBy = "ip" }) {
  const limiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix,
    points,
    duration,
  });

  return async (req, res, next) => {
    const key = keyBy === ROLES.USER && req.user?.id ? req.user.id : req.ip;

    try {
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      if (rejRes instanceof Error) {
        logger.error("Rate limiter Redis error", rejRes);
        return next();
      }

      const retrySecs = Math.ceil(rejRes.msBeforeNext / 1000) || 1;
      res.set("Retry-After", String(retrySecs));
      return next(
        new AppError(
          `Too many requests. Try again in ${retrySecs} seconds.`,
          429,
        ),
      );
    }
  };
}

module.exports = createRateLimiter;
