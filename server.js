const express = require("express");
const fs = require("fs");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

app.use(express.json()); // Gelen JSON verilerini parse eder

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
  apis: ["./server.js"], // Swagger dokümantasyonu oluşturulacak dosyaların yolu
};

const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

const filePath = "data.json";

const readData = () => {
  const jsonData = fs.readFileSync(filePath);
  return JSON.parse(jsonData);
};

const writeData = (users) => {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

const writeLog = (...logInfo) => {
  const now = new Date().toLocaleString().replace(",", "");
  const log = `${logInfo[0]},${logInfo[1]},${logInfo[2]},${now}${"\n"}`;

  fs.appendFile("./log.txt", log, (err) => {
    if (err) {
      console.log("Dosya işleminde bir hata oluştu:", err);
    } else {
      console.log("Dosya işlemi başarılı!");
    }
  });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve a list of users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
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

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user ID
 *     responses:
 *       204:
 *         description: The deleted user
 */
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

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
