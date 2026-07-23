module.exports = {
  apps: [
    {
      name: "hireready",
      script: "./server.js",
      cwd: "./server",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
