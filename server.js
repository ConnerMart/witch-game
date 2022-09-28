// const express = require("express");
// const path = require("path");

// const PORT = 3001;

// const app = express();

// app.use(express.static("/assets/sprites"));
// app.use(express.static("/index.html"));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "/index.html"));
// });

// app.listen(PORT, () =>
//   console.log(`App listening at http://localhost:${PORT}`)
// );

const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirName + "/index.html");
});

app.listen(8080, () => {
  console.log("Server listening on http://localhost:8080");
});
