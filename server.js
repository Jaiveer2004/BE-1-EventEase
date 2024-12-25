const http = require("http");
const fs = require("fs");
const qs = require("querystring");

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // GET Requests
  if (method === "GET") {
    if (url === "/") {
      fs.readFile("index.html", "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    } else if(url === "/style.css") {
      fs.readFile("style.css", "utf-8", (err, data) => {
        if(err) {
          res.writeHead(500);
          res.end("Server Error");
        } else {
          res.writeHead(200, { "Content-Type": "text/css" });
          res.end(data);
        }
      });
    } else if (url === "/registration") {
      fs.readFile("registration.html", "utf8", (err, data) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    } else if (url === "/registered") {
      fs.readFile("users.json", "utf8", (err, data) => {
        if (err) {
          console.error("Error reading users.json", err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Internal Server Error: Could not read users.json");
        } else {
          try {
            const users = JSON.parse(data); 
            let htmlContent = `
              <html>
              <head>
                <title>Registered Candidates</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
              </head>
              <body>
                <div class="container mt-5">
                  <h1>Registered Candidates</h1>
                  <table class="table table-bordered mt-3">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Event</th>
                      </tr>
                    </thead>
                    <tbody>
            `;

            users.forEach(user => {
              htmlContent += `
                <tr>
                  <td>${user.name || "N/A"}</td>
                  <td>${user.email || "N/A"}</td>
                  <td>${user.event || "N/A"}</td>
                </tr>
              `;
            });
            htmlContent += `
                    </tbody>
                  </table>
                  <a href="/" class="btn btn-primary mt-3">Back to Home</a>
                </div>
              </body>
              </html>
            `;
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(htmlContent);
          } catch (parseErr) {
            console.error("Error parsing JSON data", parseErr);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error: Invalid JSON format in users.json");
          }
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  } 
  // POST Requests
  else if (method === "POST") {
    if (url === "/registration") {
      let body = "";
      req.on("data", chunk => {
        body += chunk.toString();
      });
      req.on("end", () => {
        let users = [];
        try {
          const currentData = fs.readFileSync("users.json", "utf8");
          if (currentData) {
            users = JSON.parse(currentData);
          }
        } catch (err) {
          console.error("Error reading users.json", err);
        }

        const newUser = qs.parse(body);
        users.push(newUser);

        fs.writeFile("users.json", JSON.stringify(users, null, 2), err => {
          if (err) {
            console.error("Error writing to users.json", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Internal Server Error: Could not save user data");
          } else {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("Registration Successful!");
          }
        });
      });
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    }
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("405 Method Not Allowed");
  }
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
