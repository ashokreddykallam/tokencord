const WebSocket = require("ws");
const express = require("express");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const base64 = require("base-64");
const { createPool } = require("mysql2");
var cors = require("cors");
/*const wss = new WebSocket.Server({
    port: 2828,
    perMessageDeflate: false
});*/
let WSServer = WebSocket.Server;
let server = require("http").createServer();
let wss = new WSServer({
  server: server,
  perMessageDeflate: false,
});
const pool = createPool({
  host: "mysql-2eace0c5-blob-9c2d.e.aivencloud.com",
  port: 15992,
  user: "avnadmin",
  password: "AVNS_YVh1BB-tsLosof8XJin",
  database: "defaultdb",
  connectionLimit: 10,
});

const TypingLimiter = rateLimit({
  windowMs: 3000, // 1 hour
  max: 1, // limit each IP to 3 requests per windowMs
  statusCode: 429,
});

var Sapp = express();
Sapp.use("/static", express.static("static"));
Sapp.use(cors());

Sapp.get("/login", (req, res) => {
  //res.setHeader("Cache-Control", "public, max-age=31557600, s-maxage=31557600");
  res.sendFile("login.html", { root: __dirname });
});

Sapp.get("/css/styles.css", (req, res) => {
  //res.setHeader("Cache-Control", "public, max-age=31557600, s-maxage=31557600");
  res.sendFile("styles.css", { root: __dirname });
});

Sapp.get("/", function (req, res) {
  //res.setHeader("Cache-Control", "public, max-age=31557600, s-maxage=31557600");
  res.sendFile("index.html", { root: __dirname });
});
Sapp.get("/websocket.js", function (req, res) {
  //res.setHeader("Cache-Control", "public, max-age=31557600, s-maxage=31557600");
  res.sendFile("websocket.js", { root: __dirname });
});
Sapp.get("/sheep3.css", function (req, res) {
  //res.setHeader("Cache-Control", "public, max-age=31557600, s-maxage=31557600");
  res.sendFile("sheep3.css", { root: __dirname });
});
Sapp.get("/sheep3.js", function (req, res) {
  //res.setHeader("Cache-Control", "public, max-age=31557600, s-maxage=31557600");
  res.sendFile("sheep3.js", { root: __dirname });
});
Sapp.get("/_dom2.js", function (req, res) {
  //res.setHeader("Cache-Control", "public, max-age=31557600, s-maxage=31557600");
  res.sendFile("_dom2.js", { root: __dirname });
});
Sapp.get("/register", function (req, res) {
  console.log("POST REQ");
  if (req.get("ema-il") == null || "") {
    console.log("[SERVER] Account creation request rejected, MISSING EMAIL");
    res.status(403);
    res.type("json");
    return res.send({
      response: "Account creation request rejected, MISSING EMAIL",
    });
  }
  if (req.get("password") == null || "") {
    console.log("[SERVER] Account creation request rejected, MISSING PASSWORD");
    return res.send(403);
  }
  if (req.get("username") == null || "") {
    console.log("[SERVER] Account creation request rejected, MISSING USERNAME");
    return res.send(403);
  }
  console.log("[SERVER] Account created with id " + Date.now());
  const token_uid = base64.encode(Date.now());
  const token_secret = base64.encode(Math.floor(Math.random() * 100000000000));
  res.send(token_uid.slice(0, -2) + "." + token_secret.slice(0, -1));
  pool.query(
    `INSERT INTO users (id,name,authKey,status,emailVerified,authprotocol,tag,avatar) VALUES(${base64.decode(
      token_uid
    )},'${req.get("username")}','${base64.encode(
      req.get("password")
    )}', 1,0,'${base64.decode(
      token_secret
    )}','USER','https://archive.org/download/discordprofilepictures/discordred.png')`
  );
});

Sapp.post("/message", (req, res) => {
  if (req.get("authorization") == null || "") {
    return res.send(403);
  } else {
    if (req.get("content") == null || "") {
      return res.send(403);
    } else {
      try {
        const token = req.get("authorization");
        const token_secret = base64.decode(token.split(".")[1]);
        const token_uid = base64.decode(token.split(".")[0]);
        pool.query(
          `SELECT authprotocol,tag,avatar,name from users where id=${token_uid}`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res.send(409);
            } else {
              if (token_secret == result[0].authprotocol) {
                data_packet = {
                  name: result[0].name,
                  tag: result[0].tag,
                  content: req.get("content").toString(),
                  avatar: result[0].avatar,
                  type: "message",
                };
                wss.clients.forEach(function each(client) {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data_packet));
                  }
                });
                res.send(200);
                //Send DataPacket to the Sockets
                pool.query(
                  `INSERT INTO messages(id,m_content,u_id) VALUES(${Date.now()},'${
                    data_packet.content
                  }',${token_uid});`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    } else {
                    }
                  }
                );
              } else {
                return res.send(403);
              }
            }
          }
        );
      } catch (err) {
        return res.send(403);
      }
    }
  }
});

Sapp.post("/message/img", (req, res) => {
  if (req.get("authorization") == null || "") {
    return res.send(403);
  } else {
    if (req.get("content") == null || "") {
      return res.send(403);
    } else {
      try {
        const token = req.get("authorization");
        const token_secret = base64.decode(token.split(".")[1]);
        const token_uid = base64.decode(token.split(".")[0]);
        pool.query(
          `SELECT authprotocol,tag,avatar,name from users where id=${token_uid}`,
          (err, result) => {
            if (err) {
              console.log(err);
              return res.send(409);
            } else {
              if (token_secret == result[0].authprotocol) {
                data_packet = {
                  name: result[0].name,
                  tag: result[0].tag,
                  url: req.get("content").toString(),
                  avatar: result[0].avatar,
                  type: "message_img",
                };
                wss.clients.forEach(function each(client) {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data_packet));
                  }
                });
                res.send(200);
                //Send DataPacket to the Sockets
                pool.query(
                  `INSERT INTO messages(id,m_content,u_id) VALUES(${Date.now()},'${
                    data_packet.content
                  }',${token_uid});`,
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    } else {
                    }
                  }
                );
              } else {
                return res.send(403);
              }
            }
          }
        );
      } catch (err) {
        return res.send(403);
      }
    }
  }
});
var jsonParser = bodyParser.text({ limit: "5mb" });

Sapp.post("/message/image", jsonParser, (req, res) => {
  if (req.get("authorization") == null || "") {
    return res.send(403);
  } else {
    try {
      const token = req.get("authorization");
      const token_secret = base64.decode(token.split(".")[1]);
      const token_uid = base64.decode(token.split(".")[0]);
      pool.query(
        `SELECT authprotocol,tag,avatar,name from users where id=${token_uid}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.send(409);
          } else {
            if (token_secret == result[0].authprotocol) {
              data_packet = {
                name: result[0].name,
                tag: result[0].tag,
                content: req.body.toString(),
                avatar: result[0].avatar,
                type: "message_image",
              };
              wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(data_packet));
                }
              });
              res.send(200);
            } else {
              return res.send(403);
            }
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
});

Sapp.get("/presence", (req, res) => {
  console.log("[PRESENCE REQUEST]");
  pool.query(`SELECT id,tag,avatar,name from users`, (err, result) => {
    if (err) {
      console.log(err);
      return res.send(403);
    } else {
      res.send(result);
    }
  });
});

Sapp.get("/messages", (req, res) => {
  pool.query(
    `SELECT users.name,users.avatar,users.tag, messages.m_content AS content,messages.id FROM messages INNER JOIN users ON messages.u_id=users.id ORDER BY messages.id ASC LIMIT 50;`,
    (err, result) => {
      if (err) {
        console.log(err);
        return res.send(403);
      } else {
        res.send(result);
      }
    }
  );
});

Sapp.get("/@me", (req, res) => {
  if (req.get("authorization") == null || "") {
    return res.send(403);
  } else {
    try {
      const token = req.get("authorization");
      const token_secret = base64.decode(token.split(".")[1]);
      const token_uid = base64.decode(token.split(".")[0]);
      pool.query(
        `SELECT avatar,authprotocol,id,email,tag,name from users where id=${token_uid}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.send(403);
          } else {
            if (token_secret == result[0].authprotocol) {
              data_packet = {
                name: result[0].name,
                id: result[0].id,
                email: result[0].email,
                tag: result[0].tag,
                avatar: result[0].avatar,
              };

              res.send(JSON.stringify(data_packet));
            } else {
              return res.send(403);
            }
          }
        }
      );
    } catch (err) {
      return res.send(403);
    }
  }
});

Sapp.post("/@me/edit/username", (req, res) => {
  if (req.get("username") == null || "") {
    return res.send(403);
  }
  if (req.get("authorization") == null || "") {
    return res.send(403);
  } else {
    try {
      const token = req.get("authorization");
      const token_secret = base64.decode(token.split(".")[1]);
      const token_uid = base64.decode(token.split(".")[0]);
      pool.query(
        `SELECT authprotocol from users where id=${token_uid}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.send(403);
          } else {
            if (token_secret == result[0].authprotocol) {
              //Proceed
              pool.query(
                `UPDATE users SET name='${req
                  .get("username")
                  .toString()}' where id=${token_uid}`,
                (err, result) => {
                  if (err) {
                    console.log(err);
                    return res.send(403);
                  } else {
                    return res.send(200);
                  }
                }
              );
            } else {
              return res.send(403);
            }
          }
        }
      );
    } catch (err) {
      return res.send(403);
    }
  }
});

Sapp.get("/user", (req, res) => {
  const id = req.get("id");
  if (req.get("id") == null || "") {
    return res.send(403);
  } else {
    pool.query(
      `SELECT COUNT(*) as count, avatar,id,tag,name from users where id=${req.get(
        "id"
      )}`,
      (err, result) => {
        if (err) {
          console.log(err);
          return res.send(403);
        } else {
          if (result[0].count == 0) {
            return res.send(403);
          }
          data_packet = {
            name: result[0].name,
            id: result[0].id,
            tag: result[0].tag,
            avatar: result[0].avatar,
          };
          res.send(JSON.stringify(data_packet));
        }
      }
    );
  }
});

Sapp.get("/members", (req, res) => {
  var newArray = [];
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      newArray.push(Number(base64.decode(client._protocol.split(".")[0])));
    }
  });
  res.send(newArray);
});

Sapp.get("/font-awesome.min.css", (req, res) => {
  res.sendFile("font-awesome.min.css", { root: __dirname });
});

Sapp.post("/typing", TypingLimiter, (req, res) => {
  if (req.get("authorization") == null || "") {
    return res.send(403);
  } else {
    try {
      const token = req.get("authorization");
      const token_secret = base64.decode(token.split(".")[1]);
      const token_uid = base64.decode(token.split(".")[0]);
      pool.query(
        `SELECT authprotocol,name from users where id=${token_uid}`,
        (err, result) => {
          if (err) {
            console.log(err);
            return res.send(403);
          } else {
            if (token_secret == result[0].authprotocol) {
              data_packet = { name: result[0].name, type: "typing" };
              wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(data_packet));
                }
              });
              res.send(200);
            } else {
              return res.send(403);
            }
          }
        }
      );
    } catch (err) {
      return res.send(403);
    }
  }
});

wss.on("connection", (ws, req) => {
  console.log("[FAST CONNECT] Client connection Request");
  const token = ws.protocol;
  const token_secret = base64.decode(token.split(".")[1]);
  const token_uid = base64.decode(token.split(".")[0]);
  //console.log(token_uid)
  pool.query(
    `SELECT authprotocol,status,name from users where id=${token_uid}`,
    (err, result) => {
      if (err) {
        console.log(err);
        return ws.close();
      } else {
        //console.log(result[0])
        if (token_secret == result[0].authprotocol) {
          ws.id = token_uid;
          ws.name = result[0].name;
          console.log(
            `[${ws.id}] Connection Accepted, Switching status to online`
          );
          //console.log("[WS ID]"+ws.id)
          data_packet = {
            name: "Nano Net",
            tag: "SERVER",
            content: "Joined as " + result[0].name.toString(),
            avatar:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJhRsiTLWK4NIt-y8zcRIp7sPm6aU61F2J0k5x7L6f7Uwzr_LR",
            type: "message",
          };
          if (result[0].status == 0) {
            account_packet = { type: "account", banned: 1 };
            ws.send(JSON.stringify(account_packet));
            ws.close();
          } else {
            ws.send(JSON.stringify(data_packet));
            presence_packet = { type: "online", id: token_uid };
            wss.clients.forEach(function each(client) {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(presence_packet));
              }
            });
          }
        } else {
          return ws.close();
        }
      }
    }
  );

  ws.on("message", function incoming(message) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        //client.send(`[${ws.name}] `+message);
      }
    });
  });
  ws.on("close", () => {
    presence_packet = { type: "offline", id: ws.id };
    console.log(`[${ws.id}] Connection closed`);
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(presence_packet));
      }
    });
  });
});

server.on("request", Sapp);
server.listen(4000, function () {
  console.log(`[SERVER] Started Successfully waiting for users`);
});
