const app = require("http").createServer(handler);
const io = require("socket.io")(app);
const url = require("url");
const querystring = require("querystring");
const path = require("path");
const fs = require("fs");
const mime = require("mime");

const statusCode = {
  empty: 0,
  success: 1,
  failed: -1,
  hasAlready: 2
};

function readStaticFile(res, filePathname) {
  var ext = path.parse(filePathname).ext;
  var mimeType = mime.getType(ext);
  if (ext) {
    fs.readFile(filePathname, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("404 - NOT FOUND");
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": mimeType });
        res.write(data);
        res.end();
      }
    });
    return true;
  } else {
    return false;
  }
}
function userSQL(queryObj, callback) {
  //用户登录函数
  let querySql = `SELECT * FROM "username-password" WHERE username = "${
    queryObj.username
  }"`;
  sqliteDB.queryData(querySql, rows => {
    callback(rows);
  });
}
function newUser(queryObj) {
  //创建一个新的用户
  var user = [[queryObj.username, queryObj.psw]];
  var insertSql = `INSERT INTO "main"."username-password"("username", "userpassword") VALUES (?, ?)`;
  sqliteDB.insertData(insertSql, user);
}
function handler(req, res) {
  var urlObj = url.parse(req.url);
  if (urlObj.query) {
    let queryObj = querystring.parse(urlObj.query);
    if (queryObj.type === "1") {
      userSQL(queryObj, rows => {
        if (!rows.length) {
          res.write(
            JSON.stringify({
              code: statusCode.empty
            })
          );
          res.end();
        } else {
          if (rows[0].userpassword === queryObj.psw) {
            res.write(
              JSON.stringify({
                code: statusCode.success,
                detail: {
                  username: queryObj.username
                }
              })
            );
            res.end();
          } else {
            res.write(
              JSON.stringify({
                code: sqliteDB.failed
              })
            );
            res.end();
          }
        }
      });
    } else if (queryObj.type === "0") {
      userSQL(queryObj, rows => {
        if (rows.length) {
          res.write(
            JSON.stringify({
              code: statusCode.hasAlready
            })
          );
          res.end();
        } else {
          newUser(queryObj);
          res.write(
            JSON.stringify({
              code: statusCode.success,
              detail: {
                username: queryObj.username
              }
            })
          );
          res.end();
        }
      });
    }
  } else {
    var urlPathname = urlObj.pathname;
    var filePathname = path.join(
      __dirname,
      urlPathname === "/" ? "/index.html" : urlPathname
    );
    readStaticFile(res, filePathname);
  }
}
app.listen(3000, function() {
  console.log("服务器运行中.");
  console.log("正在监听 3000 端口:");
});

const SqliteDB = require("./database/sqlite").SqliteDB;

const file = "user.db";

var sqliteDB = new SqliteDB(file);

var onlineRooms = [];

io.on("connection", function(socket) {
  socket.on("chat", function(data) {
    if (data.host === "Community") io.of("/").emit("chat", data);
  });
  socket.on("new", function(data) {
    socket.emit("onlineRooms", onlineRooms);
    onlineRooms.push({ host: data, group: false });
    io.of("/").emit("newUser", data);
  });
  socket.on("disconnect", reason => {
    console.log(reason);
  });
  socket.on("disconnecting", reason => {
    console.log(socket.rooms);
  });
});
