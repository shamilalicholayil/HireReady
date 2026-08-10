const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(__dirname, "proto", "notification.proto");
const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: false,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const notificationProto = grpc.loadPackageDefinition(packageDef).notification;

const client = new notificationProto.NotificationService(
  "localhost:50051",
  grpc.credentials.createInsecure(),
);

// Replace with a real User _id from your local DB
const TEST_USER_ID = "000000000000000000000000";

client.sendNotification(
  {
    userId: TEST_USER_ID,
    type: "new_message",
    message: "Test notification from test-client.js",
    relatedId: "",
  },
  (err, response) => {
    if (err) {
      console.error("FAILED:", err.message);
      process.exit(1);
    }
    console.log("SUCCESS:", response);
    process.exit(0);
  },
);
