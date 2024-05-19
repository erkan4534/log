const express = require("express");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js API with Swagger",
      version: "1.0.0",
      description: "A simple CRUD API application with Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [path.join(__dirname, "server.js")],
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const filePath = path.join(__dirname, "data.json");

const readData = () => {
  try {
    const jsonData = fs.readFileSync(filePath);
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading data:", error);
    return [];
  }
};

const writeData = (users) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing data:", error);
  }
};

const writeLog = (...logInfo) => {
  const now = new Date().toLocaleString().replace(",", "");
  const log = `${logInfo[0]},${logInfo[1]},${logInfo[2]},${now}`;
  console.log(log);
};

app.get("/", (req, res) => {
  try {
    const data = readData();
    res.json(data);
    writeLog("read", "get", 200);
  } catch (e) {
    writeLog("ERROR", "get", 500, e.message);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/", (req, res) => {
  try {
    const newUser = req.body;
    let users = readData();
    users = [...users, newUser];
    writeData(users);
    res.status(201).json(users);
    writeLog("create", "post", 201);
  } catch (e) {
    writeLog("ERROR", "post", 500, e.message);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    let users = readData();

    users = users.map((user) =>
      user.id === Number(id) ? { ...user, ...updateData } : user
    );
    writeData(users);
    res.json(users);
    writeLog("update", "put", 200);
  } catch (e) {
    writeLog("ERROR", "put", 500, e.message);
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    let users = readData();
    users = users.filter((user) => user.id !== Number(id));
    writeData(users);
    res.status(204).json(users);
    writeLog("delete", "delete", 204);
  } catch (e) {
    writeLog("ERROR", "delete", 500, e.message);
    res.status(500).send("Internal Server Error");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
