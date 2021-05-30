if (!process.env.PRODUCTION) {
    const dotenv = require("dotenv");
    const result = dotenv.config();

    if (result.error) {
        throw result.error;
    }
}

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
try {
    var connection = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    });

    connection.query("SELECT 1 AS online", function (error, results, fields) {
        if (error) console.log(error);
        console.log("The db is online: ", results[0].online);
    });
} catch (err) {
    console.log(err);
}
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
    connection.query(
        `SELECT userCode FROM user WHERE username=?`,
        [username],
        function (error, result) {
            var id = JSON.stringify(result);
            id = id.slice(13, 15);
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
        }
    );
});

router.get("/getnot/:username", (req, res) => {
    const { username } = req.params;

    connection.query(
        `SELECT userCode FROM user WHERE username=?`,
        [username],
        function (error, result) {
            var id = result[0].userCode;

            //fix to find number two

            connection.query(
                `SELECT id, conent FROM notifications WHERE readen='0' AND userCode=?  `,
                [id],
                function (err, resl, fields) {
                    if (err) throw err;
                    res.send(resl);
                }
            );
        }
    );
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

router.post("/sendnotifaiction", (req, res) => {
    console.log(req.body.notification);

    connection.query(
        `SELECT userCode FROM user WHERE username=?`,
        [req.body.username],
        function (error, result) {
            //put if user not kaim
            connection.query(
                `INSERT INTO notifications (conent,UserCode) VALUES
 ('${req.body.notification}','${result[0].userCode}')`,

                function (error, result) {}
            );
        }
    );

    //         `INSERT INTO user (firstName,lastName,email,username,phone,userType,password) VALUES
    //  ('${req.body.firstName}','${req.body.lastName}','${req.body.email}','${req.body.username}','${req.body.phone}','${req.body.userType}','${req.body.password}')`

    connection.query(
        `SELECT email FROM user WHERE username=?`,
        [req.body.username],
        function (error, resi) {
            var transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "negoflict255@gmail.com",
                    pass: "barkonyo1",
                },
            });

            var mailOptions = {
                from: "negoflict255@gmail.com",
                to: `${resi[0].email}`,
                subject: "new notification",
                text: "You have a new notification from NegoFlict system.",
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Email sent: " + info.response);
                }
            });
        }
    );
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
        text: "for reset your password click the next link http://localhost:3000/newpassword.html",
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Email sent: " + info.response);
        }
    });
});

router.post("/notification", (req, res) => {
    connection.query(
        `SELECT email FROM user WHERE username=? `,
        [req.body.username],
        function (error, result) {
            if (error) {
                console.log(
                    "🚀 ~ file: server.js ~ line 157 ~ router.post ~ error",
                    error
                );
                return;
            }
            //     const resultEmail =
            //     result && result[0] && result[0].email ? result[0].email : null;
            // res.send({ email: resultEmail });

            res.send(result[0].email);

            // var transporter = nodemailer.createTransport({
            //     service: "gmail",
            //     auth: {
            //         user: "negoflict255@gmail.com",
            //         pass: "barkonyo1",
            //     },
            // });

            // var mailOptions = {
            //     from: "negoflict255@gmail.com",
            //     to: `${JSON.parse(JSON.stringify(result))}`,
            //     subject: "Reset your password in NegoFlict web",
            //     text:
            //         "for reset your password click the next link http://localhost:3000/newpassword.html",
            // };

            // transporter.sendMail(mailOptions, function (error, info) {
            //     if (error) {
            //         console.log(error);
            //     } else {
            //         console.log("Email sent: " + info.response);
            //     }
            // });
        }
    );

    // connection.query(
    //     `INSERT INTO notifiactions (content) VALUES
    //     ('${req.body.notification}')`,
    //     function (error, result) {}
    // );
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
    connection.query(
        `SELECT firstName,lastName,username,education,proffesionalExperience FROM user WHERE approved=? AND userType=? AND userCode!=?`,
        [0, "mediator", 100],
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});

router.get("/query1", (req, res) => {
    connection.query(
        `SELECT firstName,lastName,username, userType, phone ,education,proffesionalExperience FROM user WHERE userType!=? AND userCode!=? ORDER BY 4,2`,
        ["manager", 100],
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});

router.get("/query2", (req, res) => {
    connection.query(
        `SELECT  userCode ,firstName , lastName , userType , COUNT(*) AS Num
         FROM user, negotiation
         WHERE user.userCode = negotiation.userCode1 
         OR user.userCode = negotiation.userCode2
         OR user.userCode = negotiation.mediatoerCode 
         AND userType!=? AND userCode!=?
         GROUP BY  user.userCode
         `,
        ["manager", 100],
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});

router.get("/query3", (req, res) => {
    connection.query(
        `SELECT  negotiation.negoid,title, COUNT(*) AS Num
         FROM message, negotiation
         WHERE message.negoid = negotiation.negoid 
         GROUP BY  negotiation.negoid
         `,
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});

router.get("/query4", (req, res) => {
    connection.query(
        `SELECT  negoid, title, description, startTime
         FROM negotiation
         WHERE endTime IS NULL
         ORDER BY startTime`,
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});

router.get("/query5", (req, res) => {
    connection.query(
        `SELECT  negoid, title, description, startTime, endTime
         FROM negotiation
         WHERE endTime IS NOT NULL
         ORDER BY startTime`,
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});

router.get("/query6", (req, res) => {
    connection.query(
        `SELECT userType, COUNT(*) AS num
        FROM user
        WHERE userCode != ? AND userType!=?
        GROUP BY  userType;
        `,
        [100, "manager"],
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});
router.get("/query7", (req, res) => {
    connection.query(
        `SELECT  negoid, title, description, startTime, endTime
         FROM negotiation
         WHERE endTime IS NOT NULL
         ORDER BY startTime`,
        function (error, result) {
            console.log(JSON.stringify(result));
            res.send(result);
        }
    );
});

router.get("/query8/:username", (req, res) => {
    const { username } = req.params;
    connection.query(
        `SELECT userCode FROM user WHERE username=?`,
        [username],
        function (error, result) {
            connection.query(
                `SELECT  mediatoerCode, title, description, endTime, summary
         FROM negotiation
         WHERE summary IS NOT NULL AND mediatoerCode=?
         ORDER BY endTime`,
                [result[0].userCode],
                function (error, res1) {
                    res.send(res1);
                }
            );
        }
    );
});
router.get("/query9", (req, res) => {
    connection.query(
        `SELECT  username, title, content
         FROM insight`,
        function (error, res1) {
            res.send(res1);
        }
    );
});

router.post("/approvenMed", (req, res) => {
    connection.query(
        `UPDATE user SET approved='1' WHERE username=?`,
        [req.body.username],
        function (error, result) {}
    );
});

router.post("/endnego", (req, res) => {
    connection.query(
        `UPDATE negotiation SET endTime=current_timestamp() WHERE negoid=?`,
        [req.body.negoid],
        function (error, result) {}
    );
});

router.post("/addsummary", (req, res) => {
    connection.query(
        `UPDATE negotiation SET summary=? WHERE negoid=?`,
        [req.body.summary, req.body.negoid],
        function (error, result) {}
    );
    connection.query(
        `SELECT userCode1, userCode2, title FROM negotiation WHERE negoid=?`,
        [req.body.negoid],
        function (err, res1) {
            connection.query(
                `SELECT email FROM user WHERE userCode=? OR userCode=?`,
                [res1[0].userCode1, res1[0].userCode2],
                function (err, res) {
                    console.log(res);
                    var transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "negoflict255@gmail.com",
                            pass: "barkonyo1",
                        },
                    });

                    var mailOptions = {
                        from: "negoflict255@gmail.com",
                        to: `${res[0].email}, ${res[1].email}`,
                        subject: "Negotiation Summary",
                        text: `The mediator has submit a negotiation summary for negotiation ${res1[0].title} : ${req.body.summary}. 
            BR, NegoFlict`,
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Email sent: " + info.response);
                        }
                    });
                }
            );
        }
    );
});

router.post("/addinsight", (req, res) => {
    connection.query(
        `SELECT mediatoerCode, title FROM negotiation WHERE negoid=?`,
        [req.body.negoid],
        function (err, res1, fields) {
            connection.query(
                `SELECT username FROM user WHERE userCode=?`,
                [res1[0].mediatoerCode],
                function (err1, res2) {
                    connection.query(
                        `INSERT INTO insight (username,title,content) VALUES
            ('${res2[0].username}','${res1[0].title}', '${req.body.insight}')`,
                        function (error, result) {}
                    );
                }
            );
        }
    );
});

router.post("/assignmedi", (req, res) => {
    connection.query(
        `SELECT userCode FROM user WHERE username=?`,
        [req.body.username],
        function (error, result) {
            connection.query(
                `UPDATE negotiation SET mediatoerCode=('${result[0].userCode}') WHERE negoid=?`,
                [req.body.negoid],

                function (error, result) {}
            );
        }
    );
});

router.post("/read", (req, res) => {
    connection.query(
        `UPDATE notifications SET readen='1' WHERE id=?`,
        [req.body.id],
        function (error, result) {}
    );
});

router.get("/viewnegitaion", (req, res) => {
    connection.query(
        `SELECT negoid, title, description FROM negotiation WHERE mediatoerCode=?`,
        [100],
        function (error, result) {
            //console.log(JSON.stringify(result));

            res.send(result);
        }
    );
});

router.get("/approvedMed", (req, res) => {
    var num = 1;
    var k = "mediator";
    connection.query(
        `SELECT username FROM user WHERE approved=? AND userType=?`,
        [num, k],
        function (error, result) {
            //console.log(JSON.stringify(result));
            res.send(result);
        }
    );
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
        socket.emit("message", {
            users: getRoomUsers(user.room),
            message: formatMessage(botName, "Welcome to NegoFlict!"),
        }); //for personal

        if (user.room === "forum") {
            const history = [];

            connection.query(
                `SELECT content,userCode FROM message WHERE negoid=?`,
                [100],
                function (err, res1) {
                    res1.forEach((msg) => {
                        connection.query(
                            `SELECT username FROM user WHERE userCode=?`,
                            [msg.userCode],
                            function (err, res2) {
                                console.log(msg);
                                socket.emit("message", msg.content);
                                io.to(user.room).emit("message", {
                                    message: formatMessage(
                                        res2[0].username,
                                        msg.content
                                    ),
                                });
                            }
                        );
                    });
                }
            );
        }

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit("message", {
            users: getRoomUsers(user.room),
            message: formatMessage(
                botName,
                `${user.username} has joined the chat`
            ),
        });

        //send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });
    // console.log('New Ws connection...');  //when we reload the page we have msg on the traminal that new ws is created

    //problem with the rooms

    //listen for chatMsg
    socket.on("chatMessage", ({ msg, privateMsgTo }) => {

        const user = getCurrentUser(socket.id);
        var users = getRoomUsers(user.room);
        console.log(
            "🚀 ~ file: server.js ~ line 451 ~ socket.on ~ privateMsgTo",
            typeof privateMsgTo,
            user,
            users
        );
        //david sends to baros
        if (privateMsgTo != "null") {
            // the recipient
            const recipient = users.find((u) => u.id === privateMsgTo);
            io.to(privateMsgTo).emit("privateMsgTo", {
                msg: formatMessage(user.username, msg),
                isSender: false,
            });
            // the sender
            io.to(user.id).emit("privateMsgTo", {
                msg: formatMessage(user.username, msg),
                isSender: true,
            });
        } else {
            if (!user.room) return console.error(user, "no room?");
            io.to(user.room).emit("message", {
                message: formatMessage(user.username, msg),
            }); //print everyone
        }

        //save the msg in database
        connection.query(
            `SELECT userCode FROM user WHERE username=?`,
            [user.username],
            function (err, res) {
                
                connection.query(
                    `SELECT negoid FROM negotiation WHERE title=?`,
                    [user.room],
                    function (err, res1) {
                        console.log(res[0].userCode, res1[0].negoid);
                        connection.query(
                            `INSERT INTO message (content, userCode,negoid) VALUES ('${msg}','${res[0].userCode}','${res1[0].negoid}')`,
                            function (error, result) {}
                        );
                    }
                );
            }
        );
        word = ["fuck", "no", "dont", "hate", "angry", "!!!", "..."];

        if (
            msg.includes("fuck") === true ||
            msg.includes("no") === true ||
            msg.includes("dont") === true ||
            msg.includes("hate") === true ||
            msg.includes("angry") === true ||
            msg.includes("!!!") === true ||
            msg.includes("...") === true ||
            msg.includes("shut up") === true
        ) {
            io.to(user.id).emit("message", {
                users: getRoomUsers(user.room),
                message: formatMessage(
                    botName,
                    `Hi ${user.username}, you look little angry. for the negotiation will succed i hope you relax`
                ),
            });
            //     console.log(user.id);
            //     connection.query(`SELECT mediatoerCode FROM negotiation WHERE title=?`,
            //     [user.room],function(err,res1){
            //         connection.query(`SELECT username FROM user WHERE userCode=?`,
            // [res1[0].mediatoerCode],function(err,res){
            //     io.to(res1[0].mediatoerCode)
            //     .emit("message", {
            //         users: getRoomUsers(user.room),
            //         message:formatMessage(botName, `Hi ${user.username}, look little angry. for the negotiation will succed i hope you relax`)

            //     });
            // });
            //     });
        }
    });

    socket.on('typing', (data)=>{
        if(data.typing==true)
           io.emit('display', data)
        else
           io.emit('display', data)
      });
  

    //listen for chat page load
    socket.on("pageLoaded", () => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit("pageLoad", { users: getRoomUsers(user.room) }); //print everyone
    });

    socket.on("userLeft", ({ username, room }) => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit("message", {
                users: getRoomUsers(user.room),
                message: formatMessage(
                    botName,
                    `${user.username} has left the chat`
                ),
            });

            io.to(user.room).emit("redirectOut", {
                users: getRoomUsers(user.room),
                username,
            });
        }
    });

    //Rums when client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit("message", {
                users: getRoomUsers(user.room),
                message: formatMessage(
                    botName,
                    `${user.username} has left the chat`
                ),
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
