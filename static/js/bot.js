const WebSocket = require("ws");

const ws = new WebSocket(
  "ws://localhost:4000",
  "MTcyNDY5NjUyMTQxMA.MTE2NjE4NTY2MTY"
);

ws.on("error", console.error);

ws.onmessage = function (m) {
  data = JSON.parse(m.data);
  //console.log(m.data);
  if (data.type == "message" && data.content == ">hello-ping") {
    fetch("http://localhost:4000/message", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        authorization: "MTcyNDY5NjUyMTQxMA.MTE2NjE4NTY2MTY",
        content: "Hello world! Ping is 54ms ",
      },
    });
  }
};

ws.once("open", (ws) => {
  console.log(ws);
});
