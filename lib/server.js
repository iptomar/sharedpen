/* global module */
var clients = new Array();

var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var numclientes = 0;
var msgChat = "";
var color = "default";
var tabsID = [];
var tabsTxt = [];

var Server = function (port) {
    this.port = port;
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);
};

Server.prototype.start = function () {
    this.server.listen(this.port);

    this.app.use(express.static(__dirname + '/../public'));

    var self = this;
    this.io.on('connection', function (socket) {

        var address = socket.request.connection._peername;
        socket.on("myname", function (data) {
            for (var i = 0, max = clients.length; i < max; i++) {
                var u = clients[i];
                socket.emit('useron', u.name, u.port, u.socket);
            }
            var user = {
                name: data,
                port: address.port,
                socket: socket.id
            };

            socket.broadcast.emit('useron', user.name, user.port, user.socket);

            clients.push(user);
            ++numclientes;
            console.log('+++++++++++++++++++++ ADD +++++++++++++++++++++');
            console.log("Client     - " + user.name +
                    "\nPort       - " + user.port +
                    "\nSocket id  - " + user.socket);
            console.log('+++++++++++++++++++++++++++++++++++++++++++++++');

            socket.emit("NewTabs", {
                txt: tabsTxt,
                id: tabsID
            });

            socket.emit('OldmsgChat', msgChat);

            socket.emit('getcolor', {'cor': color});
        });

        socket.on('message', function (data) {
            self.io.sockets.emit('message', data);
            msgChat += data.user + ":" + data.data + ',';
        });

        socket.on('msgappend', function (data) {
            var id = data.id;
            var char = data.char;
            var pos = data.pos;
            actualizaTabs(id, char, pos);
            socket.broadcast.emit('msgappend', data);
        });

        socket.on("TabsChanged", function (data) {
            if (data.op == "remover") {
                removeTab(data.id);
            } else {
                addTabServer(data.id, data.pos);
            }
            socket.broadcast.emit("TabsChanged", data);
        });

        socket.on("textExist", function () {
            socket.broadcast.emit("requestOldText");
        });

        socket.on("returnOldText", function (data) {
            socket.broadcast.emit("returnOldText", data);
        });

        socket.on('setcolor', function (data) {
            color = data.cor;
            self.io.sockets.emit('getcolor', data);
        });

        socket.on('drawClick', function (data) {
            console.log("->\nIdCanvas - " + data.id + "\nX - " + data.x + "\nY - " + data.y + "\nType - " + data.type);
            socket.broadcast.emit('draw', {
               id: data.id,
                x: data.x,
                y: data.y,
                type: data.type
            });
        });

        socket.on('disconnect', function () {
            socket.broadcast.emit('diconnected', socket.id);
            var usr = objectFindByKey(clients, "socket", socket.id)
            if (usr !== null) {
                console.log('------------------- REMOVE --------------------');
                console.log("Client     - " + usr.name +
                        "\nPort       - " + usr.port +
                        "\nSocket id  - " + usr.socket);
                console.log('-----------------------------------------------');
                clients.splice(clients.indexOf(usr), 1);
                console.log("Socket id removido - " + socket.id);
                --numclientes;
                if (numclientes <= 0) {
                    console.log("Sem Clientes ligado");
                    msgChat = "";
                    numclientes = 0;
                    clients = new Array();
                    color = "default";
                    tabsID = [];
                    tabsTxt = [];
                }
            } else {
                console.log('------------ O Cliente ja nao existe ----------');
                console.log('----------------- SharedPen On ----------------');
            }

        });
    });
    console.log('Server do SharedPen On!');
    console.log('A aguardar por clientes...');
};

module.exports = Server;

function actualizaTabs(idd, charr, poss) {
    var id = idd.substring(4) - 1;

//    console.log(poss);
//    console.log("texto " + tabsTxt[id]);
    var str = "";
    if (typeof tabsTxt[id] != "undefined") {
        str = tabsTxt[id];
    }
    var char = charr;
    var pos = poss;
    var str1 = "";

    if (char === 8 /* backspace*/
            || char === 46 /* delete */) {
        if (char === 8) {
            if (pos > 0) {
                str1 = str.slice(0, pos - 1) + str.slice(pos);
            } else {
                str1 = str.slice(pos);
            }
        } else if (data.data === 46) {
            str1 = str.slice(0, pos) + str.slice(pos + 1);
        }
    } else {
        str1 = [str.slice(0, pos), String.fromCharCode(char), str.slice(pos)].join('');
    }
    tabsTxt[id] = str1;
//    console.log(str1 + " --------");
}

function addTabServer(id, pos) {
//    console.log("++++++++ " + id);
    tabsID[pos - 1] = id;
    tabsTxt[pos - 1] = "";
}

function removeTab(id) {
    tabsTxt.splice(tabsID.indexOf("msg" + id), 1);
    tabsID.splice(tabsID.indexOf("msg" + id), 1);

}

function objectFindByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}