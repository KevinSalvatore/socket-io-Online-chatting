var username = undefined;

// const statusCode = {
//   empty: 0,
//   success: 1,
//   failed: -1,
//   hasAlready: 2
// };

pubsub.subscribe("success", () => {
  getIn();
  socket();
});

$(".login-btn").click(function() {
  $.ajax({
    type: "Get",
    url: "http://localhost:3000/",
    data: {
      type: 1,
      username: $("#username").val(),
      psw: $("#psw").val()
    },
    success: function(response) {
      let obj = JSON.parse(response);
      if (obj && obj.code === 1) {
        username = obj.detail.username;
        pubsub.publish("success");
      }
    }
  });
});

$(".register-btn").click(function() {
  $.ajax({
    type: "Get",
    url: "http://localhost:3000/",
    data: {
      type: 0,
      username: $("#username").val(),
      psw: $("#psw").val()
    },
    success: function(response) {
      console.log(response);
    }
  });
});

function getIn() {
  $(".app").removeClass("blur");
  $(".mask").addClass("displayNone");
}
