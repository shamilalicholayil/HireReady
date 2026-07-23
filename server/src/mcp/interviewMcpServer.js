const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../../.env.development"),
});
const mongoose = require("mongoose");
const { z } = require("zod");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const {
  StdioServerTransport,
} = require("@modelcontextprotocol/sdk/server/stdio.js");

const User = require("../models/User");
const Session = require("../models/Session");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const server = new McpServer({
    name: "hireready-interview-mcp",
    version: "1.0.0",
  });

  server.tool(
    "get_candidate_profile",
    "Fetch a candidate's track, skills, and bio so interview questions can be tailored to their real background.",
    { userId: z.string().describe("MongoDB ObjectId of the candidate") },
    async ({ userId }) => {
      const user = await User.findById(userId).select("name track skills bio");
      if (!user) {
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: "User not found" }) },
          ],
        };
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              name: user.name,
              track: user.track,
              skills: user.skills,
              bio: user.bio,
            }),
          },
        ],
      };
    },
  );

  server.tool(
    "get_past_performance",
    "Fetch a candidate's recent interview session scores to help calibrate question difficulty.",
    { userId: z.string().describe("MongoDB ObjectId of the candidate") },
    async ({ userId }) => {
      const sessions = await Session.find({ user: userId })
        .select("track difficulty finalScore createdAt")
        .sort({ createdAt: -1 })
        .limit(5);

      return {
        content: [
          { type: "text", text: JSON.stringify({ recentSessions: sessions }) },
        ],
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed to start:", err);
  process.exit(1);
});
