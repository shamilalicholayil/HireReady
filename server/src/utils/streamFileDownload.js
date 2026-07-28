const axios = require("axios");

async function streamFileDownload(res, fileUrl, filename) {
  const response = await axios.get(fileUrl, { responseType: "stream" });
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/octet-stream");
  response.data.pipe(res);
}

module.exports = streamFileDownload;
