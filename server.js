const express = require("express");
const fs = require("fs");
const app = express();
const path = require("node:path");

app.use(express.json()); //json'ni javascript'e çevirir.

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

//read
app.get("/", (req, res) => {
  try {
    const data = readData();
    res.json(data);
    writeLog("read", "get", 201);
  } catch (e) {
    writeLog("ERROR", 500, e);
  }
});

//create
app.post("/", (req, res) => {
  try {
    const newUser = req.body;
    let users = readData();
    users = [...users, newUser];
    writeData(users);
    res.status(201).json(users);
    writeLog("create", "post", 201);
  } catch (e) {
    writeLog("ERROR", 500, e);
  }
});

//update
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
    writeLog("ERROR", 500, e);
  }
});

//delete
app.delete("/:id", (req, res) => {
  try {
    const id = req.params.id;
    let users = readData();
    users = users.filter((user) => user.id !== Number(id));
    writeData(users);
    res.status(204).json(users);
    writeLog("delete", "delete", 204);
  } catch (e) {
    writeLog("ERROR", 500, e);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server runnig on port ${port}`);
});
