//const { disconnect } = require("mongoose");

// const { userLeave } = require("../../utils/users");

const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages"); //for chesee which chat to talk
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

// Retrieve params via url.search, passed into ctor
var url = new URL(window.location.href);
// console.log("🚀 ~ file: main.js ~ line 39 ~ window.location.href", window.location.href)
var params = new URLSearchParams(url.search);
// console.log("🚀 ~ file: main.js ~ line 13 ~ params", params.get('title'),params.get('negoid'))

var negoid = params.get("title");
var usernamee = localStorage.getItem("username");

//Get usrname and room from url to know which in those room
const username = usernamee;
const room = negoid;

//console.log(username,room); #check that it works

const socket = io();

//console.log(username,room); //print to the right web
//join chatroom
socket.emit("joinRoom", { username, room });

//get room and users
socket.on("roomUsers", ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on("message", ({ message }) => {
    console.log(message, users); //print the msg from server welcome to nego and the other msgss
    if (message) outputMessage(message);
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
function onChatLoad() {
    console.log("hi");
    socket.emit("pageLoaded");
}
socket.on("pageLoad", ({ users }) => {
    console.log(users);
    if (users) showList(users);
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
socket.on("privateMsgTo", ({ msg, isSender }) => {
    console.log(
        "🚀 ~ file: main.js ~ line 55 ~ socket.on ~ msg,isSender ",
        msg,
        isSender
    );

    if (msg) outputMessage(msg, isSender);
    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//msg submit
chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    //get message text
    const msg = e.target.elements.msg.value;

    const privateMsgTo = document.getElementById("userof").value;
    console.log(
        "🚀 ~ file: main.js ~ line 62 ~ chatForm.addEventListener ~ privateMsgTo",
        { msg, privateMsgTo }
    );

    //emit message to server to the board
    socket.emit("chatMessage", { msg, privateMsgTo });

    //clear input
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus(); //write enter messege
});

const listener = (eventName, ...args) => {
    console.log("DEBUG", eventName, args);
};

socket.onAny(listener);

//output message to Dom
function outputMessage(message, isSender = null) {
    const div = document.createElement("div");
    div.classList.add("message"); //add class messege
    div.innerHTML = `<p class="meta">${message.username} <span>${
        message.time
    }</span></p>
    <p class="text">
        ${isSender === null ? "" : "PM-"}${
        message.text
    }
    </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}

//Add room name to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

//show in list
function showList(users) {
    console.log("🚀 ~ file: main.js ~ line 77 ~ showList ~ users", users);
    let htmlStr = `<option value="null">everyone</option>`;
    htmlStr += users
        .filter((u) => u.username != localStorage.getItem("username"))
        .map(
            (user) =>
                /*html*/ `<option value="${user.id}">${user.username}</option>`
        )
        .join("");
    document.getElementById("userof").innerHTML = htmlStr;
}

//Add users to dom
function outputUsers(users) {
    userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}

function getuser() {
    return userList;
}

/* ------------------------------------ Click on login and Sign Up to  changue and view the effect
---------------------------------------
*/

function cambiar_login() {
    document.querySelector(".cont_forms").className =
        "cont_forms cont_forms_active_login";
    document.querySelector(".cont_form_login").style.display = "block";
    document.querySelector(".cont_form_sign_up").style.opacity = "0";

    setTimeout(function () {
        document.querySelector(".cont_form_login").style.opacity = "1";
    }, 400);

    setTimeout(function () {
        document.querySelector(".cont_form_sign_up").style.display = "none";
    }, 200);
}

function cambiar_sign_up(at) {
    document.querySelector(".cont_forms").className =
        "cont_forms cont_forms_active_sign_up";
    document.querySelector(".cont_form_sign_up").style.display = "block";
    document.querySelector(".cont_form_login").style.opacity = "0";

    setTimeout(function () {
        document.querySelector(".cont_form_sign_up").style.opacity = "1";
    }, 100);

    setTimeout(function () {
        document.querySelector(".cont_form_login").style.display = "none";
    }, 400);
}

function ocultar_login_sign_up() {
    document.querySelector(".cont_forms").className = "cont_forms";
    document.querySelector(".cont_form_sign_up").style.opacity = "0";
    document.querySelector(".cont_form_login").style.opacity = "0";

    setTimeout(function () {
        document.querySelector(".cont_form_sign_up").style.display = "none";
        document.querySelector(".cont_form_login").style.display = "none";
    }, 500);
}

const exitUser = document.getElementById("exitUser");
exitUser.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("hi");
    socket.emit("userLeft", { username, room });
});

socket.on("redirectOut", ({ users, username }) => {
    console.log("bye");
    outputUsers(users);

    var loggedUser = localStorage.getItem("username");
    if (loggedUser != username) return;
    window.location.href = "/enterNegotiation.html";
});
