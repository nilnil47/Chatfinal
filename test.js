const io = require("socket.io-client");
// localStorage.debug = '*';
//
// const socket = io("http://127.0.0.1/socket.io", {
//     reconnectionDelayMax: 10000,
//     auth: {
//         token: "123"
//     },
//     query: {
//         "my-key": "my-value"
//     }
// });


// this sockes
const socket = io("ws://192.168.1.102:5000/socket.io");
console.log("dassaddas");
socket.emit("chatMessage", "dasdasddas")
