const path = require("path");
const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const {
  StdioClientTransport,
} = require("@modelcontextprotocol/sdk/client/stdio.js");

let clientPromise = null;

const getMcpClient = () => {
  if (!clientPromise) {
    clientPromise = (async () => {
      const transport = new StdioClientTransport({
        command: "node",
        args: [path.join(__dirname, "interviewMcpServer.js")],
      });
      const client = new Client({
        name: "hireready-backend",
        version: "1.0.0",
      });
      await client.connect(transport);
      return client;
    })();
  }
  return clientPromise;
};

module.exports = { getMcpClient };
