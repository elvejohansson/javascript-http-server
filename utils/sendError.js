import fs from "fs";

export function sendError(code, req, res) {
  fs.readFile(`errors/${code}.html`, (error, content) => {
    if (error) {
      console.error(error);
      return;
    }
    res.writeHead(code, { "Content-Type": "text/html" });
    res.end(content, "utf-8");
  });
}
