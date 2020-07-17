const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors= require("cors");


const {
    addUser,
    removeUser,  
    getUser,
    getUserInRoom,
} = require("./user_helper"); 
const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.urlencoded({extended:true}))

app.use(cors())

app.use("/", require("./router/router"));

io.on("connection", (socket) => {
    socket.on("join", ({ name, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            name,
            room, 
        }); /*the adduser func will either return an error or a user*/
        if (error) { 
            console.log(error);
            return callback(error); //this will send the error message to the front end*/
        }
        socket.emit("message", {
            user: "admin",
            text: `${user.name}, welcome to the chat room "${user.room}"`,
        }); //this will send the message ta the particular socket(or user) that just signed in.
        socket.broadcast.to(user.room).emit("message", {
            user: "admin",
            text: `${user.name}, has joined this chat room!`,
        }); //this will send message to all the users that is connected to a particular room exception of the newly joined user;
        socket.join(user.room); //this help to connect or join a (user or socket) to a particular room, so any message,data or response share by them will be only visible to socket or user in the particular room
        io.to(user.room).emit("roomData", {
            users:getUserInRoom(user.room),
        })
        callback("user is now part of the room chat");
    });
    socket.on("sendMessage", (info, callback) => { 
        const user=getUser(socket.id)
        if(user){
        io.to(user.room).emit("message", {
            user: user.name,
            text: info.message,
            time:info.time
        });
        io.to(user.room).emit("roomData", {
            room:user.room,
            users:getUserInRoom(user.room),
        })
        callback(); //calling the callback function that is written in our client side
    }else{
        callback("please reload your browser")
    }
    });
    socket.on("disconnect", () => {
        console.log("user had left!!!");
        const user=removeUser(socket.id);//removing the user from the array
        console.log(user)
        if(user){
            io.to(user.room).emit("message",{user:"admin",text:`${user.name} has left this room`})//this will send message to other connected socket telling them this socket has left their chat room;
        }
    }); 
}); 
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
