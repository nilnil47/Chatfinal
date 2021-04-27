const path = require("path");
const http = require("http");
const url = require("url");
const express = require("express");
const socketio = require("socket.io");
var nodemailer = require("nodemailer");
const formatMessage = require("./utils/messages");
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require("./utils/users");
var cors = require("cors");
let bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieParse = require("cookie-parser");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const router = express.Router();
app.use(cors());
app.set("trust proxy", true);
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(cookieParse());

// use mysql
var mysql = require("mysql");
const { response, json } = require("express");
const { hostname } = require("os");
//create connection
var connection = mysql.createConnection({
    host: "localhost",
    user: "barkonyo",
    password: "barbar",
    database: "db_admin",
});
connection.connect(function (error) {
    //show error if any
});
//set static folderמפצ
app.use(express.static(path.join(__dirname, "Public")));

app.use("/api", router);
router.get("/users", (req, res) => {
    console.log("i been here");
    res.send("hello world get method");
});

router.post("/usersnego", (req, res) => {
    connection.query(
        `INSERT INTO user (firstName,lastName,email,username,phone,userType,password) VALUES
 ('${req.body.firstName}','${req.body.lastName}','${req.body.email}','${req.body.username}','${req.body.phone}','${req.body.userType}','${req.body.password}')`,
        function (error, result) {}
    );

    res.send("hello world Post method");
});

router.post("/usersmedi", (req, res) => {
    connection.query(
        `INSERT INTO user (firstName,lastName,email,username,phone,education,userType,password,proffesionalExperience) VALUES
 ('${req.body.firstName}','${req.body.lastName}','${req.body.email}','${req.body.username}','${req.body.phone}','${req.body.education}','${req.body.userType}','${req.body.password}','${req.body.proffesionalExperience}')`,
        function (error, result) {}
    );
});

router.post("/resetpass", (req, res) => {
    connection.query(
        `UPDATE user SET password=
('${req.body.password}') WHERE username=?`,
        [req.body.username],
        function (error, result) {}
    );
});

router.get("/viewnegos/:username", (req, res) => {
    const { username } = req.params;
    connection.query(`SELECT userCode FROM user WHERE username=?`,[username],function(error,result){
        var id=((JSON.stringify(result)));
        id=id.slice(13,15);
        //fix to find number two
        console.log(id);
        connection.query(
            `SELECT negoid, title FROM negotiation WHERE mediatoerCode=? OR userCode1=? OR userCode2=? `,
            [id, id, id],
            function (err, resl, fields) {
                if (err) throw err;
                res.send(resl);
            }
        );
        });
    
});

router.post("/sendEmail", (req, res) => {
    console.log(req.body);

    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "negoflict255@gmail.com",
            pass: "barkonyo1",
        },
    });

    var mailOptions = {
        from: "negoflict255@gmail.com",
        to: "negoflict255@gmail.com",
        subject: `${req.body.subject}`,
        text: `'This is mail from the web. The mail was sent by ${req.body.firstname} ${req.body.lastName}. phone: ${req.body.phone}. Message content: ${req.body.description}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
});

router.post("/resetpassword", (req, res) => {
    console.log(req.body);
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "negoflict255@gmail.com",
            pass: "barkonyo1",
        },
    });

    var mailOptions = {
        from: "negoflict255@gmail.com",
        to: `${req.body.email}`,
        subject: "Reset your password in NegoFlict web",
        text:
            "for reset your password click the next link http://localhost:3000/newpassword.html",
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
});

router.post("/login", (req, res) => {
    var username = req.body.userName;
    var password = req.body.password;

    connection.query(
        "SELECT userType FROM user WHERE username = ? AND password = ? ",
        [username, password],
        async function (error, results, fields) {
            if (error) {
                console.log("not register");
                res.send("no");
            } else {
                if (results.length > 0) {
                    res.send(JSON.parse(JSON.stringify(results))[0]);
                    console.log("succes");
                } else {
                    res.send("no");
                    console.log("not register");
                }
            }
        }
    );
});


router.get("/unapprovedMed", (req, res) => {
    var num=0;
    var k= 'mediator';   
    connection.query(`SELECT firstName, lastName,username, education, proffesionalExperience FROM user WHERE approved=? AND userType=?`,[num,k],
    function(error,result){
        console.log(JSON.stringify(result));
        res.send(result);
        });
    
});

router.post("/approvenMed", (req, res) => {
    connection.query(
        `UPDATE user SET approved='1' WHERE username=?`,
        [req.body.username],
        function (error, result) {}
    );
}); 


router.get("/viewnegitaion", (req, res) => {
  
    connection.query(`SELECT title, description FROM negotiation WHERE mediatoerCode=?`,[100],
    function(error,result){
        console.log(JSON.stringify(result));

        res.send(result);
        });
    
});

router.get("/approvedMed", (req, res) => {
    var num=1;
    var k= 'mediator';   
    connection.query(`SELECT username FROM user WHERE approved=? AND userType=?`,[num,k],
    function(error,result){
        console.log(JSON.stringify(result));
        res.send(result);
        });
    
});


router.post("/newnegotiation", (req, res) => {
    var id1, id2;
    connection.query(
        "SELECT userCode FROM user WHERE username = ?",
        [req.body.name1],
        async function (error, results, fields) {
            if (error) {
                console.log("not ");
                res.send("no");
            } else {
                if (results.length > 0) {
                    id1 = JSON.parse(JSON.stringify(results))[0];
                    id1 = id1.userCode;
                } else {
                    res.send("no");
                    console.log("not register");
                }
            }

            connection.query(
                "SELECT userCode FROM user WHERE phone = ?",
                [req.body.phone_user2],
                async function (error, results, fields) {
                    if (error) {
                        console.log("not ");
                        res.send("no");
                    } else {
                        if (results.length > 0) {
                            id2 = JSON.parse(JSON.stringify(results))[0];
                            id2 = id2.userCode;
                        } else {
                            res.send("no");
                            console.log("not register");
                        }
                    }

                    connection.query(
                        `INSERT INTO negotiation (usercode1,usercode2,title,description) VALUES
        ('${id1}','${id2}','${req.body.title}','${req.body.description}')`,
                        function (error, result) {}
                    );
                }
            );
        }
    );
});

const botName = "Nego Bot";

//Run when client connect
io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //welcome current user
        socket.emit("message", formatMessage(botName, "Welcome to NegoFlict!")); //for personal

        //Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                formatMessage(botName, `${user.username} has joined the chat`)
            ); //for everyone

        //send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });
    // console.log('New Ws connection...');  //when we reload the page we have msg on the traminal that new ws is created

    //problem with the rooms

    //listen for chatMsg
    socket.on("chatMessage", (msg) => {
        const user = getCurrentUser(socket.id);
        //console.log(msg);   //print the msg on the server, terminal
        io.to(user.room).emit("message", formatMessage(user.username, msg)); //print everyone

        //save the msg in database
        connection.query(
            "INSERT INTO message (content) VALUES ('" + msg + "')",
            function (error, result) {}
        );
    });

    //Rums when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                "message",
                formatMessage(botName, `${user.username} has left the chat`)
            );
        }
    });
});
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
