function socket() {
  var community = {
    chatRooms: [
      {
        host: "Community",
        group: true,
        chattingRecords: [
          {
            time: "13:14",
            detail: "Hello World!",
            username: "Kevin"
          }
        ],
        read: false
      }
    ],
    onShowRoom: "Community"
  };

  var socket = io();
  socket.on("connect", () => {
    socket.emit("new", username);
    socket.on("chat", function(data) {
      let room = community.chatRooms.find(room => {
        return room.host === data.host;
      });
      room.chattingRecords.push({
        time: data.time,
        detail: data.data,
        username: data.username
      });
      chatRecordRender(community.chatRooms[0]);
      listRender(community);
    });
    socket.on("newUser", function(data) {
      community.chatRooms.push({
        host: data,
        group: false,
        chattingRecords: [],
        read: true
      });
      listRender(community);
    });

    socket.on("onlineRooms", function(data) {
      community.chatRooms = community.chatRooms.concat(
        data.map(item => {
          return {
            host: item.host,
            group: item.group,
            chattingRecords: [],
            read: true
          };
        })
      );
    });
  });

  listRender(community);
  roomNameRender(community.onShowRoom);
  chatRecordRender(community.chatRooms[0]);

  $(".sub-btn").click(function(e) {
    let html = $(".msg-input-box")
      .html()
      .trim();
    if (html === "<p><br></p>") {
      //空
      window.alert("Empty!");
    } else {
      let now = new Date();
      socket.emit("chat", {
        host: community.onShowRoom,
        time:
          now.getFullYear() +
          "/" +
          (now.getMonth() + 1) +
          "/" +
          now.getDate() +
          " " +
          (now.getHours() + 1) +
          ":" +
          now.getMinutes(),
        data: html,
        username
      });
      $(".msg-input-box").html("<p><br></p>");
    }
  });
}

document.querySelector(".msg-input-box").addEventListener("keypress", e => {
  if (e.keyCode === 13) {
    e.preventDefault();
    $(".sub-btn").click();
  }
});

function listRender(data) {
  var listTemplate = `
<% for(var i=0; i<this.chatRooms.length; ++i) { %>
<div class="chatting-item <% this.onShowRoom===this.chatRooms[i].host ? "selected" : "" %> selectNone">
  <div class="left">
    <div class="pic"><img src="./resource/images/<% this.chatRooms[i].group ? "group" : "profile" %>.jpg" alt="" class="proile"></div>
    <div class="spot <% this.chatRooms[i].read ? "hide" : "" %>"></div>
  </div>
  <div class="mid">
    <p class="name"><% this.chatRooms[i].host %></p>
    <p class="content"><% if(this.chatRooms[i].chattingRecords[this.chatRooms[i].chattingRecords.length-1]&&this.chatRooms[i].chattingRecords[this.chatRooms[i].chattingRecords.length-1].detail) { %>
      <% this.chatRooms[i].chattingRecords[this.chatRooms[i].chattingRecords.length-1].detail %>
    <% }else{ %>
      <br />
    <% } %>
    </p>
  </div>
  <div class="right">
    <p class="last-time"><% if(this.chatRooms[i].chattingRecords[this.chatRooms[i].chattingRecords.length-1]&&this.chatRooms[i].chattingRecords[this.chatRooms[i].chattingRecords.length-1].time) { %>
      <% this.chatRooms[i].chattingRecords[this.chatRooms[i].chattingRecords.length-1].time %>
    <% }else{ %>
      <br />
    <% } %></p>
    <p><br /></p>
  </div>
</div>
<% } %>
`;
  $(".chatting-list").html(TemplateEngine(listTemplate, data));
}

function chatRecordRender(data) {
  var chatRecordTemplate = `
  <% for (var i=0; i<this.chattingRecords.length; ++i) { %>
  <div class="msg-item msg <% this.chattingRecords[i].username === username ? "me" : "not-me" %>">
    <div class="img"><img src="./resource/images/profile.jpg" alt=""></div>
    <div>
      <!-- displayNone -->
      <p class="itemname <% this.group ? "" : "displayNone" %>"><% this.chattingRecords[i].username %></p>
      <div class="msg-content"><% this.chattingRecords[i].detail %></div>
    </div>
  </div>
  <% } %>
  `;
  $(".msg-container").html(TemplateEngine(chatRecordTemplate, data));
}

function roomNameRender(data) {
  $("#roomName").html(data);
}
