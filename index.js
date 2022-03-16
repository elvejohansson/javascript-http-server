import http from "http";
import fs from "fs";
import path from "path";

import { sendError } from "./utils/sendError.js";
import { PORT, PUBLIC } from "./config/server.config.js";

// Create server object
const server = http.createServer((request, response) => {
  // Log all requests
  console.log(`\x1b[32m${request.method}\x1b[0m - \x1b[34m${request.url}\x1b[0m\n\x1b[33m${request.headers["user-agent"]}\x1b[0m\n`);

  if (request.method !== "GET") {
    sendError(405, request, response);
    return;
  }

  // Check if public folder is in use and make URL usable for server.
  let filePath;
  if (PUBLIC) {
    if (request.url === "/") {
      filePath = "public/index.html";
    } else {
      filePath = "public" + request.url;
    }
  } else {
    if (request.url === "/") {
      filePath = "index.html";
    }

    filePath = "." + request.url;
  }

  // Check request extension and check against servers allowed MIME-types,
  // otherwise revert to application/octet-stream.
  const extName = String(path.extname(filePath)).toLowerCase();
  let mimeTypes = JSON.parse(
    fs.readFileSync("types/mime-types.json").toString()
  );
  const contentType = mimeTypes[extName] || "application/octet-stream";

  // Respond to client with file information.
  fs.readFile(filePath, (error, content) => {
    if (error) {
      // If "error no entity" (ENOENT), return 404 error.
      if (error.code === "ENOENT") {
        sendError(404, request, response);
      } else {
        sendError(500, request, response);
      }
    } else {
      response.writeHead(200, { "Content-Type": contentType });
      response.end(content, "utf-8");
    }
  });
});

try {
  server.listen(PORT);
  console.log(`Server running and listening on http://localhost:${PORT}`);
} catch (error) {
  console.error(`Error when starting server: ${error}`);
}
