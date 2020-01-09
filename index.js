const http = require("http");
const express = require("express");
const url = require("url");

const { mountBeta } = require("./beta");
const { mountLatest } = require("./latest");

const app = express();
const httpServer = http.createServer(app);

console.log("Mounting beta server");
mountBeta(app, httpServer);
console.log("\n");

console.log("Mounting latest server");
mountLatest(app, httpServer);
console.log("\n");

let [betaUpgradeListener, latestUpgradeListener] = httpServer
  .listeners("upgrade")
  .slice(0);

httpServer.removeAllListeners("upgrade");
httpServer.on("upgrade", (req, socket, head) => {
  const path = url.parse(req.url).pathname;

  // delegate beta server upgrades
  if (path == "/beta") betaUpgradeListener(req, socket, head);
  // delegate latest server upgrades
  else if (path == "/latest") latestUpgradeListener(req, socket, head);
  // throw it away if its not a recognized path
  else socket.destroy();
});

httpServer.listen(3000, () =>
  console.log("Express server running on port 3000")
);
