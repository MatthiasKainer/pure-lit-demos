const server = require('server');

const { createServer } = require("http");
const sockedio = require("socket.io")

const { get } = server.router;
const { render, file } = server.reply;

server([
    get('/', () => render('index.html')),
    get('/js.js', () => file("public/js.js")),
    get('/style.css', () => file("public/style.css")),
]);

const httpServer = createServer();
const io = sockedio(httpServer, {
    cors: {
        origin: "http://localhost:3000"
    }
});
io.on("connection", (socket) => {
    console.log("connection", socket.id)
    socket.on("message", (msg) => {
        console.log("send messga", msg)
        socket.emit("message", msg)
    })
    socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
    });
});
httpServer.listen(3001);