import http from "http";
import fs from "fs";
import path from "path";

import { sendError } from "./utils/sendError.js";
import { PORT, PUBLIC } from "./config/server.config.js";

const server = http.createServer((request, response) => {
  handler(request, response);

  const header = `\x1b[32m[${request.method}]\x1b[0m - \x1b[34m${request.url}\x1b[0m`;
  const userAgent = `\x1b[33m${request.headers["user-agent"]}\x1b[0m\n`;

  console.log(`${header}\n${userAgent}`);

  if (request.method !== "GET") {
    sendError(405, request, response);
    return;
  }

  // Check if public folder is in use and make URL usable for server.
  let filePath;
  if (PUBLIC) {
    filePath = request.url === "/" ? "public/index.html" : "public" + request.url;
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
      switch (error.code) {
        case "ENOENT":
          sendError(404, request, response);
          break;
        case "EACCES":
          sendError(403, request, response);
          break;
        default:
          sendError(500, request, response);
          break;
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



/**
 * Middleware handler
 */
async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Allow": "GET, POST, PUT, DELETE, OPTIONS",
    });
    res.end();
  }
}