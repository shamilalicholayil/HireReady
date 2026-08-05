const redisClient = require("../config/redis");

const AppError = require("../utils/AppError");

const acquireSessionLock = (getSessionId) => async (req, res, next) => {
  const sessionId = getSessionId(req);
  const lockKey = `lock:session:${sessionId}`;

  const acquired = await redisClient.set(lockKey, "1", {
    NX: true,
    PX: 20000, // 20s
  });

  if (!acquired) {
    return next(
      new AppError(
        "This session is already processing a request. Please wait.",
        409,
      ),
    );
  }

  res.on("finish", () => {
    redisClient.del(lockKey).catch(() => {});
  });

  next();
};

module.exports = acquireSessionLock;
