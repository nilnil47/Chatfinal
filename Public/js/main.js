//const { disconnect } = require("mongoose");

const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages'); //for chesee which chat to talk
const roomName= document.getElementById('room-name');
const userList= document.getElementById('users');


var url =window.location.search;
var negoid = url.searchParams.get("title");
var usernamee=localStorage.getItem('username');


//Get usrname and room from url to know which in those room
const username=usernamee;
const room=negoid;

//console.log(username,room); #check that it works


const socket= io();

//console.log(username,room); //print to the right web
//join chatroom
socket.emit('joinRoom',{username,room});


//get room and users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
});

//message from server
socket.on('message',message=>{
    console.log(message); //print the msg from server welcome to nego and the other msgss
    outputMessage(message);


    //scroll down
    chatMessages.scrollTop= chatMessages.scrollHeight;
});

//msg submit
chatForm.addEventListener('submit', e => {
    e.preventDefault();
    //get message text
    const msg =e.target.elements.msg.value;
    //emit message to server to the board
    socket.emit('chatMessage',msg);

    //clear input
    e.target.elements.msg.value='';
    e.target.elements.msg.focus(); //write enter messege
});


//output message to Dom
function outputMessage(message){
    const div= document.createElement('div');
    div.classList.add('message'); //add class messege
    div.innerHTML=`<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`; 
    document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to dom
function outputRoomName(room){
    roomName.innerText=room;
}

//Add users to dom
function outputUsers(users){
    userList.innerHTML=`
    ${users.map(user=> `<li>${user.username}</li>`).join('')}
    `;
}




/* ------------------------------------ Click on login and Sign Up to  changue and view the effect
---------------------------------------
*/

function cambiar_login() {
    document.querySelector('.cont_forms').className = "cont_forms cont_forms_active_login";  
  document.querySelector('.cont_form_login').style.display = "block";
  document.querySelector('.cont_form_sign_up').style.opacity = "0";               
  
  setTimeout(function(){  document.querySelector('.cont_form_login').style.opacity = "1"; },400);  
    
  setTimeout(function(){    
  document.querySelector('.cont_form_sign_up').style.display = "none";
  },200);  
    }
  
  function cambiar_sign_up(at) {
    document.querySelector('.cont_forms').className = "cont_forms cont_forms_active_sign_up";
    document.querySelector('.cont_form_sign_up').style.display = "block";
  document.querySelector('.cont_form_login').style.opacity = "0";
    
  setTimeout(function(){  document.querySelector('.cont_form_sign_up').style.opacity = "1";
  },100);  
  
  setTimeout(function(){   document.querySelector('.cont_form_login').style.display = "none";
  },400);  
  
  
  }    
  
  
  
  function ocultar_login_sign_up() {
  
  document.querySelector('.cont_forms').className = "cont_forms";  
  document.querySelector('.cont_form_sign_up').style.opacity = "0";               
  document.querySelector('.cont_form_login').style.opacity = "0"; 
  
  setTimeout(function(){
  document.querySelector('.cont_form_sign_up').style.display = "none";
  document.querySelector('.cont_form_login').style.display = "none";
  },500);  
    
    }