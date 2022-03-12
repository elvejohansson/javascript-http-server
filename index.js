import http from "http";
import fs from "fs";
import path from "path";

const PORT = 8080;


function sendError(code, req, res) {
  fs.readFile(`errors/${code}.html`, (error, content) => {
    if (error) {
      console.error(error);
      return;
    }
    res.writeHead(code, { "Content-Type": "text/html" });
    res.end(content, "utf-8");
  });
}


// Create server object
const server = http.createServer((request, response) => {
  // Log all requests
  console.log(`${request.method} - URL: ${request.url}`);

  if (request.method !== "GET") {
    sendError(405, request, response);
    return;
  }

  // Set filepath to index.html if it doesn't specify a file.
  let filePath = "." + request.url;
  if (filePath === "./") {
    filePath = "public/index.html";
  }

  // Check request extension and check against servers allowed MIME-types,
  // otherwise revert to application/octet-stream.
  const extName = String(path.extname(filePath)).toLowerCase();
  let mimeTypes = JSON.parse(fs.readFileSync("types/mime-types.json").toString());
  const contentType = mimeTypes[extName] || "application/octet-stream";

  // Respond to client with file information.
  fs.readFile(filePath, (error, content) => {
    if (error) {
      // If "error no entity" (ENOENT), return 404 error.
      if (error.code === "ENOENT") {
        sendError(404, request, response);
      } else {
        response.writeHead(500);
        response.end("Contact site admin, error " + error.code);
      }
    } else {
      response.writeHead(200, { "Content-Type": contentType });
      response.end(content, "utf-8");
    }
  });
})

try {
  server.listen(PORT);
  console.log(`Server running and listening on http://localhost:${PORT}`);
} catch (error) {
  console.error(`Error when starting server: ${error}`);
}

