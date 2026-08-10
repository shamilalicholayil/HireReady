const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");

const Notification = require("./models/Notification");

const PROTO_PATH = path.join(__dirname, "proto", "notification.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(packageDef).notification;

async function sendNotification(call, callback) {
  try {
    const { userId, type, message, relatedId } = call.request;

    const doc = await Notification.create({
      user: userId,
      type,
      message,
      relatedId: relatedId || undefined,
    });

    callback(null, {
      id: doc._id.toString(),
      userId: doc.user.toString(),
      type: doc.type,
      message: doc.message,
      relatedId: doc.relatedId ? doc.relatedId.toString() : "",
      isRead: doc.isRead,
      createdAt: doc.createdAt.toISOString(),
    });
  } catch (err) {
    callback({
      code: grpc.status.INTERNAL,
      message: err.message,
    });
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("[grpc-notification] connected to MongoDB");

  const server = new grpc.Server();
  server.addService(notificationProto.NotificationService.service, {
    sendNotification,
  });

  const port = process.env.GRPC_PORT || "50051";
  server.bindAsync(
    `0.0.0.0:${port}`,
    grpc.ServerCredentials.createInsecure(),
    (err, boundPort) => {
      if (err) {
        console.error("[grpc-notification] bind failed:", err);
        process.exit(1);
      }
      console.log(`[grpc-notification] listening on ${boundPort}`);
    },
  );
  process.on("SIGTERM", () => {
    console.log(
      "[grpc-notification] SIGTERM received, shutting down gracefully",
    );
    server.tryShutdown(() => {
      mongoose.connection.close(false, () => process.exit(0));
    });
  });
}

main().catch((err) => {
  console.error("[grpc-notification] startup failed:", err);
  process.exit(1);
});
