const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirName + "/index.html");
});

app.listen(3001, () => {
  console.log("Server listening on http://localhost:3001");
});
