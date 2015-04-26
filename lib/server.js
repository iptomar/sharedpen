/* global module, require */


var express = require('express');
var http = require('http');
var socketio = require('socket.io');

/**
 * 
 * @param {type} port
 * @returns {Server}
 */
var Server = function (port) {
    this.port = port;
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);

    this.clients = new Array();
    this.numclientes = 0;
    this.msgChat = "";
    this.color = "default";
    this.tabsID = [];
    this.tabsTxt = [];
    this.hash = {};

    this.app.get('/models', function (req, res) {
        var files = require('fs').readdirSync(__dirname + '/../public/html_models').filter(function (file) {
            return file.match(/.+\.html+$/) !== null && file !== 'index.js';
        });
        res.json(files);
    });
};

/**
 * 
 * @returns {undefined}
 */
Server.prototype.start = function () {
    this.server.listen(this.port);

    this.app.use(express.static(__dirname + '/../public'));

    var self = this;
    this.io.on('connection', function (socket) {

        var address = socket.request.connection._peername;
        socket.on("myname", function (data) {
            for (var i = 0, max = self.clients.length; i < max; i++) {
                var u = self.clients[i];
                socket.emit('useron', u.name, u.port, u.socket);
            }
            var user = {
                name: data,
                port: address.port,
                socket: socket.id
            };

            socket.broadcast.emit('useron', user.name, user.port, user.socket);

            self.clients.push(user);
            ++self.numclientes;
            console.log('+++++++++++++++++++++ ADD +++++++++++++++++++++');
            console.log("Client     - " + user.name +
                    "\nPort       - " + user.port +
                    "\nSocket id  - " + user.socket);
            console.log('+++++++++++++++++++++++++++++++++++++++++++++++');




            if (Object.keys(self.hash).length !== 0) {
                console.log("hash" + self.hash[".txtTab1"]);
                socket.emit("NewTabs", {
                    tabsHash: self.hash
                });
            }
            socket.emit('OldmsgChat', self.msgChat);

            socket.emit('getcolor', {'cor': self.color});
        });

        socket.on('message', function (data) {
            self.io.sockets.emit('message', data);
            self.msgChat += data.user + ":" + data.data + ',';
        });

        socket.on('msgappend', function (data) {
            var id = data.id;
            var char = data.char;
            var pos = data.pos;
            var parent = data.parent;
            self.actualizaTabs(id, char, pos, parent);
            socket.broadcast.emit('msgappend', data);
        });

        socket.on("TabsChanged", function (data) {
            if (data.op === "remover") {
                self.removeTab(data.id);
            } else {
                self.hash[data.tab.id] = data.tab;
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
            self.color = data.cor;
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
            var usr = self.objectFindByKey(self.clients, "socket", socket.id)
            if (usr !== null) {
                console.log('------------------- REMOVE --------------------');
                console.log("Client     - " + usr.name +
                        "\nPort       - " + usr.port +
                        "\nSocket id  - " + usr.socket);
                console.log('-----------------------------------------------');
                self.clients.splice(self.clients.indexOf(usr), 1);
                console.log("Socket id removido - " + socket.id);
                --self.numclientes;
                if (self.numclientes <= 0) {
                    console.log("Sem Clientes ligado");
                    self.msgChat = "";
                    self.numclientes = 0;
                    self.clients = new Array();
                    self.color = "default";
                    //self.tabsID = [];
                    //self.tabsTxt = [];
                    self.hash = {};
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

/**
 * 
 * @param {type} idd
 * @param {type} charr
 * @param {type} poss
 * @returns {undefined}
 */
Server.prototype.actualizaTabs = function (idd, charr, poss, parent) {
    var self = this;
    var id = idd.substring(1);

    var str = "";
    if (typeof self.hash["." + parent].modelo.arrayElem[id].conteudo !== "undefined" || self.hash["." + parent].modelo.arrayElem[id].conteudo == ' ') {
        str = self.hash["." + parent].modelo.arrayElem[id].conteudo;
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
    self.hash['.' + parent].modelo.arrayElem[id].conteudo = str1;

};

/**
 * 
 * @param {type} id
 * @returns {undefined}
 */
Server.prototype.removeTab = function (id) {
    var self = this;
    delete self.hash['.txtTab' + id];
    //refactor array
    var i = 0;
    //cria array auxiliar
    var hash1 = {};
    //percorre todas as keys do array
    for (var key in self.hash) {
        var newId = key.replace(/[0-9]/, (i + 1));
        hash1[newId] = self.hash[key];
        hash1[newId].id = newId;

        for (var elemento in self.hash[key].modelo.arrayElem) {
            var idd = elemento.replace(/[0-9]/, (i + 1));

            hash1[newId].modelo.arrayElem[idd] = self.hash[key].modelo.arrayElem[elemento];

            hash1[newId].modelo.arrayElem[idd].id = self.hash[key].modelo.arrayElem[elemento].id.replace(/[0-9]/, (i + 1));
            hash1[newId].modelo.arrayElem[idd].conteudo = self.hash[key].modelo.arrayElem[elemento].conteudo;
            if ((i + 1) >= id)
                delete hash1[newId].modelo.arrayElem[elemento];
        }
        i++;
    }
    self.hash = hash1;
};

/**
 * 
 * @param {type} array
 * @param {type} key
 * @param {type} value
 * @returns {Server.prototype.objectFindByKey.array}
 */
Server.prototype.objectFindByKey = function (array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
};

module.exports = Server;
