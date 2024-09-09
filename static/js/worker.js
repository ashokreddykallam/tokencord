url = "ws://localhost:4000/";
base_url = "http://localhost:4000/";
protocol = localStorage.getItem("authentication");
window.location = "#loading";

if (localStorage.getItem("authentication") == null) {
  /*let token = prompt("Please enter your Authentication token");
  if (token != null) {
    localStorage.setItem("authentication", token);
    ws = new WebSocket(url, token);
  }*/
  console.log("[s] authentication token is null");
  window.location.replace("/login");
} else {
  window.location = "#loading";
  fetch("/@me", {
    headers: {
      Accept: "application/json, text/plain, */*",
      authorization: localStorage.getItem("authentication"),
    },
  })
    .then(function (response) {
      if (response.status == 200) {
        console.log(response.status);
        ws = new WebSocket(url, protocol);
        ws.onopen = function () {
          fetch("/presence")
            .then(function (response) {
              // The response is a Response instance.
              return response.json();
            })
            .then(function (data) {
              localStorage.setItem("member_list", JSON.stringify(data));
              data.forEach((element) => {
                try {
                  lazyLoad(element);
                } catch (error) {}
              });
              fetch("/members")
                .then(function (response) {
                  return response.json();
                })
                .then(function (data) {
                  data.forEach((element) => {
                    try {
                      moveOnline(element);
                    } catch (error) {}
                  });
                });
            });

          fetch("/messages")
            .then(function (response) {
              return response.json();
            })
            .then(function (data) {
              data.forEach((element) => {
                try {
                  populate(element);
                } catch (error) {}
              });
            });
        };
        ws.onmessage = function (m) {
          data = JSON.parse(m.data);
          if (data.type == "message") {
            var items = document
                .getElementById("msg_ls")
                .getElementsByTagName("li"),
              l_item = items[items.length - 1];
            if (l_item.firstChild.firstChild.firstChild.src == data.avatar) {
              console.log(
                l_item.firstChild.lastChild.appendChild(
                  Elem("div", { className: "content" }, [
                    Elem("span", { className: "msg_content" }, [data.content]),
                  ])
                )
              );
            } else {
              try {
                populate(JSON.parse(m.data));
              } catch (error) {}
            }
          }
          if (data.type == "typing") {
            try {
              typingevent(data.name);
            } catch (error) {}
          }
          if (data.type == "online") {
            try {
              moveOnline(data.id);
            } catch (error) {}
          }
          if (data.type == "offline") {
            try {
              moveOffline(data.id);
            } catch (error) {}
          }
          if (data.type == "message_img") {
            try {
              populateImage(JSON.parse(m.data));
            } catch (error) {}
          }
          if (data.type == "message_image") {
            try {
              populateBaseImage(JSON.parse(m.data));
            } catch (error) {}
          }
          if (data.type == "account") {
            if (data.banned == 1) {
              window.location = "#banned";
              const element = document.getElementById("root-app");
              element.remove();
            }
          }
        };
        ws.onclose = function (m) {
          if (window.location.hash == "#banned") {
            console.log(window.location);
          } else {
            window.location = "#error";
            const element = document.getElementById("root-app");
            element.remove();
          }
        };
        return response.json();
      }
      if (response.status == 403) {
        console.log("[FAST CONNECT] WRONG TOKEN");
        localStorage.removeItem("authentication");
        window.location.replace("/login");
      }
    })
    .then(function (data) {
      document.getElementById("pop_name").innerHTML = "Name: " + data.name;
      document.getElementById("pop_email").innerHTML = "Email: " + data.email;
      document.getElementById("pop_avatar").setAttribute("src", data.avatar);
      document
        .getElementById("txt_input_username")
        .setAttribute("placeholder", data.name);
      document.getElementById("pop_tag").innerHTML = data.tag;
      document.getElementById("pop_id").innerHTML = "ID: " + data.id;
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCSeconds(data.id);
      document.getElementById("pop_date").innerHTML =
        "Created On: " + d.toString();
    });
  //ws = new WebSocket(url, protocol);
}

function log(s) {
  document.body.appendChild(
    Elem("div", { className: "message" }, [
      Elem("div", { className: "header" }, [
        avatar.elem,
        Elem("div", {}, [
          Elem("span", { className: "username" }, ["Exploit"]),
          Elem("span", { className: "bot" }, ["STAFF"]),
          Elem("span", { className: "timestamp" }, ["Today at 15:60"]),
        ]),
      ]),
      Elem("div", { className: "content" }, [
        Elem("span", { className: "msg_content" }, ["Hi"]),
      ]),
    ])
  );
}

console.log("[TRIGGER]");

function typingevent(s) {
  document.getElementById(
    "typing_holder_txt"
  ).textContent = `${s} is typing...`;
  setTimeout(function () {
    document.getElementById("typing_holder_txt").textContent = `‎`;
  }, 6000);
}

function populate(s) {
  var list = document.getElementById("msg_ls");
  var entry = document.createElement("li");
  entry.appendChild(
    Elem("div", { className: "message" }, [
      Elem("div", { className: "header" }, [
        Elem("img", { className: "avatar", src: s.avatar }),
        Elem("div", {}, [
          Elem("span", { className: "username" }, [s.name]),
          Elem("span", { className: "bot" }, [s.tag.toString()]),
          Elem("span", { className: "timestamp" }, ["Today at 15:60"]),
        ]),
      ]),
      Elem("div", { className: "content" }, [
        Elem("span", { className: "msg_content" }, [s.content]),
      ]),
    ])
  );
  list.appendChild(entry);
  var chatHistory = document.getElementById("scroll_div");
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function populateImage(s) {
  var list = document.getElementById("msg_ls");
  var entry = document.createElement("li");
  entry.appendChild(
    Elem("div", { className: "message" }, [
      Elem("div", { className: "header" }, [
        Elem("img", { className: "avatar", src: s.avatar }),
        Elem("div", {}, [
          Elem("span", { className: "username" }, [s.name]),
          Elem("span", { className: "bot" }, [s.tag.toString()]),
          Elem("span", { className: "timestamp" }, ["Today at 15:60"]),
        ]),
      ]),
      Elem("div", { className: "img-content" }, [
        Elem("img", {
          className: "msg_img",
          src: s.url,
          style: "width: 300px; height: 300px;",
        }),
      ]),
    ])
  );
  list.appendChild(entry);
  var chatHistory = document.getElementById("scroll_div");
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function populateBaseImage(s) {
  var list = document.getElementById("msg_ls");
  var entry = document.createElement("li");
  entry.appendChild(
    Elem("div", { className: "message" }, [
      Elem("div", { className: "header" }, [
        Elem("img", { className: "avatar", src: s.avatar }),
        Elem("div", {}, [
          Elem("span", { className: "username" }, [s.name]),
          Elem("span", { className: "bot" }, [s.tag.toString()]),
          Elem("span", { className: "timestamp" }, ["Today at 15:60"]),
        ]),
      ]),
      Elem("div", { className: "img-content" }, [
        Elem("img", {
          className: "msg_img",
          src: `data:image/jpeg;base64, ${s.content}`,
          style: "width: 300px; height: 300px;",
        }),
      ]),
    ])
  );
  list.appendChild(entry);
  var chatHistory = document.getElementById("scroll_div");
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

function lazyLoad(s) {
  var list = document.getElementById("mbr_ls");
  var entry = document.createElement("li");
  entry.setAttribute("id", `${s.id}`);
  entry.setAttribute("class", "mbr-cls");
  entry.appendChild(
    Elem("div", { className: "mbr-message", id: s.id }, [
      Elem("div", { className: "header", id: s.id }, [
        Elem("div", { className: "item", id: s.id }, [
          Elem(
            "span",
            {
              className: "notify-badge",
              id: `online${s.id}`,
            },
            ["0"]
          ),
          Elem("img", { className: "mbr-avatar", src: s.avatar, id: s.id }),
        ]),
        //Elem("img", { className: "mbr-avatar", src: s.avatar }),
        Elem("div", { className: "member_pad", id: s.id }, [
          Elem("span", { className: "username", id: s.id }, [s.name]),
          Elem("span", { className: "bot", id: s.id }, [s.tag]),
        ]),
      ]),
    ])
  );
  list.appendChild(entry);
}

function moveOnline(s) {
  var list = document.getElementById("mbr_s");
  var item = document.getElementById(s);
  console.log(document.getElementById("online" + s).getAttribute("visibility"));
  console.log("online" + s);
  list.appendChild(item);
}

function moveOffline(s) {
  var list = document.getElementById("mbr_ls");
  var item = document.getElementById(s);
  list.appendChild(item);
}

window.onload = function () {
  window.location = "#";
  var root_element = document.getElementById("root-app");
  root_element.style.display = "flex";
  var input = document.getElementById("text-enter");
  input.focus();
  input.select();
  var username_submit = document.getElementById("btn_submit_username");
  var username_textinput = document.getElementById("txt_input_username");
  username_submit.onclick = function () {
    if (username_textinput.value == "") {
      alert(
        "Cannot set empty username, enter your new username and click submit!"
      );
    } else {
      UsernameSubmit();
    }
  };
  refresh_submit = document.getElementById("btn_reconnect");
  refresh_submit.onclick = function () {
    refreshPage();
  };
  var logout_submit = document.getElementById("btn_logout");
  logout_submit.onclick = function () {
    localStorage.removeItem("authentication");
    window.location.replace("/login");
  };
  document
    .getElementById("img-upload")
    .addEventListener("change", function (e) {
      if (e.target.files[0]) {
        if (e.target.files[0].size > 5 * 1024 * 1024) {
          alert("The selected image exceeds 5MB, please select another one");
        } else {
          //Proceed to upload
          var file = e.target.files[0];
          reader = new FileReader();
          reader.onloadend = function () {
            var b64 = reader.result.replace(/^data:.+;base64,/, "");
            fetch("/message/image", {
              method: "POST",
              headers: {
                Accept: "application/json, text/plain, */*",
                authorization: localStorage.getItem("authentication"),
              },
              body: b64,
            });
            window.location = "#";
          };
          reader.readAsDataURL(file);
        }
      }
    });
  document
    .getElementById("dropup_profile")
    .addEventListener("click", function (e) {
      window.location = "#profile";
    });
  document
    .getElementById("dropup_image")
    .addEventListener("click", function (e) {
      window.location = "#image-upload";
    });

  var offlineList = document.getElementById("mbr_ls");
  offlineList.addEventListener("click", function (e) {
    visitorId = e.target.id;
    if (e.target.id == "mbr_ls") {
    } else {
      mbr_obj = JSON.parse(localStorage.getItem("member_list"));
      var user_obj = [];
      mbr_obj.forEach((elem) => {
        if (elem.id == e.target.id) {
          user_obj.push(elem);
        }
      });
      user_obj = user_obj[0];
      document.getElementById("pop_name").innerHTML = "Name: " + user_obj.name;
      document.getElementById("pop_email").innerHTML =
        "Email: Hidden by the account owner";
      document
        .getElementById("pop_avatar")
        .setAttribute("src", user_obj.avatar);
      document.getElementById("pop_tag").innerHTML = user_obj.tag;
      document.getElementById("pop_id").innerHTML = "ID: " + user_obj.id;
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCSeconds(user_obj.id);
      document.getElementById("pop_date").innerHTML =
        "Created On: " + d.toString();
      window.location = "#popup-box";
    }
  });
  var onlineList = document.getElementById("mbr_s");
  onlineList.addEventListener("click", function (e) {
    visitorId = e.target.id;
    if (e.target.id == "mbr_s") {
    } else {
      mbr_obj = JSON.parse(localStorage.getItem("member_list"));
      var user_obj = [];
      mbr_obj.forEach((elem) => {
        if (elem.id == e.target.id) {
          user_obj.push(elem);
        }
      });
      user_obj = user_obj[0];
      document.getElementById("pop_name").innerHTML = "Name: " + user_obj.name;
      document.getElementById("pop_email").innerHTML =
        "Email: Hidden by the account owner";
      document
        .getElementById("pop_avatar")
        .setAttribute("src", user_obj.avatar);
      document.getElementById("pop_tag").innerHTML = user_obj.tag;
      document.getElementById("pop_id").innerHTML = "ID: " + user_obj.id;
      var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
      d.setUTCSeconds(user_obj.id);
      document.getElementById("pop_date").innerHTML =
        "Created On: " + d.toString();
      window.location = "#popup-box";
    }
  });
};

function UsernameSubmit() {
  var username_textinput = document.getElementById("txt_input_username");
  var new_username = username_textinput.value;
  fetch("/@me/edit/username", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      authorization: localStorage.getItem("authentication"),
      username: new_username,
    },
  })
    .then((username_textinput.placeholder = new_username))
    .then((res) => console.log(res));
  username_textinput.value = "";
  window.location = "#";
}

function refreshPage() {
  window.location = "#";
  window.location.reload();
}
