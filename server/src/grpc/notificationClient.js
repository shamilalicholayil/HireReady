const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const logger = require("../utils/logger");

const PROTO_PATH = path.join(
  __dirname,
  "..",
  "..",
  "proto",
  "notification.proto",
);

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(packageDef).notification;

const client = new notificationProto.NotificationService(
  process.env.GRPC_NOTIFICATION_URL || "localhost:50051",
  grpc.credentials.createInsecure(),
);

/**
 * Fire-and-forget-ish notification send. Resolves with the persisted
 * notification doc, or null if the gRPC call fails — callers should
 * NOT let a notification failure break the primary request (booking
 * confirmation / message send must still succeed).
 */
function sendNotification({ userId, type, message, relatedId }) {
  return new Promise((resolve) => {
    client.sendNotification(
      {
        userId: userId.toString(),
        type,
        message,
        relatedId: relatedId ? relatedId.toString() : "",
      },
      (err, response) => {
        if (err) {
          logger.error(
            `[notificationClient] sendNotification failed: ${err.message}`,
          );
          return resolve(null);
        }
        resolve(response);
      },
    );
  });
}

module.exports = { sendNotification };
