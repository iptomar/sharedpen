/* global module, require */


var express = require('express');
var session = require('express-session');
var http = require('http');
var socketio = require('socket.io');
var fs = require('fs');
var htmlToPdf = require('html-to-pdf');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '185.15.22.55',
    user: 'sharedpen',
    password: 'sharedpen',
    database: 'sharedpen'
});


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
    this.app.use(bodyParser.urlencoded({
        extended: true
    }));
    this.app.use(bodyParser.json());
    // devolve a lista de ficheiros ods modulos
//    this.app.get('/models', function (req, res) {
//        var files = fs.readdirSync(__dirname + '/../sharedpen/www/html_models').filter(function (file) {
//            return file.match(/.+\.html+$/) !== null && file !== 'index.js';
//        });
//        res.json(files);
//    });

    /**
     * Consulta a base de dados e devolve os modelos das paginas existentes
     */
    this.app.get("/getModelsPage", function (req, res) {
        connection.query('select * from modelos_pagina', function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    /**
     * Consulta a base de dados e devolve os modelos das paginas existentes
     */
    this.app.get("/getProjects", function (req, res) {
        var vals = getValuesToUrl(req.url);
        connection.query("select * from Projectos where id_creator=" + vals.id + ";", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    /**
     * Consulta a base de dados e devolve os modelos das paginas existentes
     */
    this.app.get("/getModelsProject", function (req, res) {
        connection.query("SELECT * FROM sharedpen.modelo;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    /**
     * Consulta a base de dados e devolve os modelos das paginas existentes
     */
    this.app.get("/getProjects", function (req, res) {
        var vals = getValuesToUrl(req.url);
        connection.query("select * from Projectos where id_creator=" + vals.id + ";", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });


    //query 'a tabela alunos
    this.app.get("/getAllAluno", function (req, res) {
        connection.query("SELECT * FROM sharedpen.Aluno;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });




    /**
     * -----------------------------------------------------------BACKOFFICE--------------------------------------------------------------
     */



    //query 'a tabela Alunos 
    this.app.get("/getsAlunos", function (req, res) {
        connection.query("select id_user,username,Aluno.nome as nome_aluno,num_aluno,turma,ano,Escola.nome as nome_escola, avatar from Aluno, User, Escola where User.id=Aluno.id_user and Aluno.id_escola=Escola.id;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //query 'a tabela Alunos 
    this.app.get("/getAluno/:id", function (req, res) {
        console.log(req.params.id);
//			connection.query("select id_user,username,Aluno.nome as nome_aluno,num_aluno,turma,ano,Escola.nome as nome_escola, avatar from Aluno, User, Escola where User.id="+req.params.id+" User.id=Aluno.id_user and Aluno.id_escola=Escola.id;", function (err, data) {
//            if (err) {
//                res.json(err);
//                throw err;
//            }
//            res.json(data);
//                console.log(req.params.id);
//        });
    });


    //query 'a tabela Agrupamentos
    this.app.get("/getsAgrupamentos", function (req, res) {
        connection.query("SELECT * FROM sharedpen.Agrupamento;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
            console.log(data);
        });
    });



    //query 'a tabela Escolas
    this.app.get("/getsEscolas", function (req, res) {
        connection.query("select Escola.id,Escola.nome as nome_escola,morada, contacto, Agrupamento.nome as nome_agrupamento from Agrupamento,Escola where Agrupamento.id=Escola.id;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
            console.log(data);
        });
    });



    //query 'a tabela Professores
    this.app.get("/getsProfessores", function (req, res) {
        connection.query("select User.id, User.username,Professor.nome as nome_professor,email,Agrupamento.nome as nome_agrupamento,avatar from Professor,User,Agrupamento where User.id= Professor.id_user and Professor.id_agrupamento= Agrupamento.id;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
            console.log(data);
        });
    });











    /**
     * Consulta a base de dados e devolve o codigo html da pagina pretendida
     */
    this.app.post('/setArray', function (req, res) {
//        console.log("ola");
//        console.log(req.body);
        // var vals = getValuesToUrl(req.body.array);
        //connection.query("insert into Projectos (array) values('"+[req.body.arrayy]+"')", function (err, data) 
        connection.query("INSERT INTO `sharedpen`.`Projectos` (`nome`, `id_creator`, `tipo`, `id_grupo`, `id_modelo`, `estado`, `array`) VALUES ('teste', '1', 'Poema', '1', '1', '1', '" + [req.body.arrayy] + "')", function (err, data)
        {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    this.app.get('/getArray', function (req, res) {
        var vals = getValuesToUrl(req.url);
        console.log(vals);
        console.log(req.body);
        // var vals = getValuesToUrl(req.body.array);
        connection.query("select array from Projectos where id=(" + [vals.id] + ")", function (err, data)
        {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    this.app.get('/getCodModel', function (req, res) {
//        console.log(req.url);
        var vals = getValuesToUrl(req.url);
        connection.query("SELECT htmltext from sharedpen.modelos_pagina where nome= ?", [vals.model], function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });


    this.app.post('/saveModelLivro', function (req, res) {
        console.log(req.body);
        connection.query("SELECT * FROM sharedpen.modelo where nome_livro like ?", [req.body.nomeProjeto], function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            if (data.length === 0) {
                connection.query("insert into modelo (nome_livro, nome_modeloCapa, nome_modeloPagina, html_texto, css_texto) values('" +
                        req.body.nomeProjeto + "','" +
                        req.body.nomeModeloC + "','" +
                        req.body.nomeModeloP + "','" +
                        req.body.textHtml + "','" +
                        req.body.stylesLivro + "')", function (err, data) {
                            if (err) {
                                res.json(err);
                                throw err;
                            }
                            console.log(data);
                            res.json("Ok");
                        });
            } else {
                res.json("false");
            }

        });
    });



    /**
     * 	Get recebe o id do modelo e retorna toda a linha da tabela referente ao id
     */
    this.app.post('/getModelLivro', function (req, res) {
        var vals = getValuesToUrl(req.url);
        connection.query("SELECT * FROM sharedpen.modelo where idmodelo=" + vals[0].id + ";", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

};

/**
 * Funcao que recebe uma string e coloca num array os valores com as respectica keys
 * @param {type} url
 * @returns {unresolved}
 */
function getValuesToUrl(url) {
    var q = {};
    url.split('?')[1].split('&').forEach(function (i) {
        q[i.split('=')[0]] = i.split('=')[1];
    });
    return q;
}

/**
 *
 * @returns {undefined}
 */
Server.prototype.start = function () {
    this.server.listen(this.port);

    var allowCrossDomain = function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');

        next();
    };

    this.app.use(allowCrossDomain);


    // fornece ao cliente a pagina index.html
    this.app.use(express.static(__dirname + '/../sharedpen/www'));

    var self = this;
    this.io.on('connection', function (socket) {

        var address = socket.request.connection._peername;

        // ligacao de um novo cliente
        socket.on("myname", function (data) {

            // entrega aao novo clientre a lista dde clientes ja existentes
            for (var i = 0, max = self.clients.length; i < max; i++) {
                var u = self.clients[i];
                socket.emit('useron', u.name, u.port, u.socket);
            }

            // criacao do novo cliente
            var user = {
                name: data,
                port: address.port,
                socket: socket.id
            };

            // informacao aos outros clientes que se ligou um novo cliente
            socket.broadcast.emit('useron', user.name, user.port, user.socket);

            // coloca o novo cliente na lista de clientes
            self.clients.push(user);
            ++self.numclientes;
            console.log('+++++++++++++++++++++ ADD +++++++++++++++++++++');
            console.log("Client     - " + user.name +
                    "\nPort       - " + user.port +
                    "\nSocket id  - " + user.socket);
            console.log('+++++++++++++++++++++++++++++++++++++++++++++++');

            // envia para o novo cliente as mensagens do chat trocadas anteriormente
            socket.emit('OldmsgChat', self.msgChat);

            // envia a cor atual do anbiente web
            socket.emit('getcolor', {'cor': self.color});
        });



        // recebe o event da cliacao de uma nova tab
        socket.on("getAllTabs", function () {

            if (Object.keys(self.hash).length !== 0) {
                // informa os outros clientes da cliacao de uma nova tab
                socket.emit("NewTabs", {
                    tabsHash: self.hash
                });
            }
        });


        socket.on('reqHash', function (data) {
            console.log("aqui");
            console.log(self.hash);
            self.io.sockets.emit('getHash', {
                hashh: self.hash
            });
        });


        socket.on('storedhash', function (data) {
            //console.log(data.storedhash);
            self.hash = data.storedhash;
        });

        // recebe a informacao de uma nova mensagem no chat
        socket.on('message', function (data) {
            // envia para todos incluindo para quem a envio a mensagem do chat
            self.io.sockets.emit('message', data);
            self.msgChat += data.user + ":" + data.data + ',';
        });

        // recebe a informacao de alteracoa de mansagens
        socket.on('msgappend', function (data) {
            var html = data.html;
            var id = data.id;
            var char = data.char;
            var pos = data.pos;
            var parent = data.parent;
            var tipo = data.tipo;
            switch (tipo) {
                case "IMG":
                    self.hash['.' + parent].modelo.arrayElem[id].conteudo = data.imageData;
//                    console.log("\n\n\n\n" +self.hash['.' + parent].modelo.arrayElem[id].conteudo);
                    break;
                default :
                    //self.actualizaTabs(id, char, pos, parent);
                    self.msgappend(id, parent, html);
            }
            socket.broadcast.emit('msgappend', data);
        });

        // recebe a informacao de que uma tab foi alterada
        socket.on("TabsChanged", function (data) {
            if (data.op === "remover") {
                self.removeTab(data.id);
            } else {
                self.hash[data.tab.id] = data.tab;
            }
            socket.broadcast.emit("TabsChanged", data);
        });

        // recebe a informacao da alteracao da cor do ambiente web
        socket.on('setcolor', function (data) {
            self.color = data.cor;
            self.io.sockets.emit('getcolor', data);
        });

        // recebe as informacoes do desenho no canvas
        socket.on('drawClick', function (data) {
            if (data.type !== "backgoundImage")
                self.hash["." + data.parent].modelo.arrayElem[data.id].drawObj.ArrayCanvasImage[data.socket] = data.canvas;
            else
                self.hash["." + data.parent].modelo.arrayElem[data.id].drawObj.bgImg = data.canvas;
            // envia para os outros clientes as informacoes do desenho no canvas
            socket.broadcast.emit('draw', {
                data: data,
                socket: socket.id
            });
        });

        /**
         * Recebe a imagem, guarda-a no servidor e envia para os outros clientes
         */

        socket.on('removeimage', function () {
            var filePath = "http://localhost:8080/sharedpen/www/imgupload/img.jpg";
            fs.unlinkSync(filePath);
        });
        // recebe um data de uma imagem
        socket.on('user image', function (data) {

            var base64Data = self.decodeBase64Image(data.imageData);
            //console.log(data.name);
            // if directory is not already created, then create it, otherwise overwrite existing image
            fs.exists(__dirname + "./../sharedpen/www/imgupload/" + data.imageMetaData, function (exists) {
                if (!exists) {
                    fs.mkdir(__dirname + "./../sharedpen/www/imgupload/" + data.imageMetaData, function (e) {
                        if (!e) {
                            console.log("Created new directory without errors." + socket.id);
                        } else {
                            console.log("Exception while creating new directory....");
                            throw e;
                        }
                    });
                }
            });

            // write/save the image
            // TODO: extract file's extension instead of hard coding it data.name
            fs.writeFile(__dirname + "./../sharedpen/www/imgupload/img.jpg", base64Data.data, function (err) {
                if (err) {
                    console.log('ERROR:: ' + err);
                    throw err;
                }
            });
//             I'm sending image back to client just to see and a way of confirmation. You can send whatever.

            // envia para os outros clientes o data da imagem
            socket.broadcast.emit('user image', data);
        });

        // recebe o codigo html e o nome do ficheiro para a criacao de um pdf
        socket.on("convertToPdf", function (html, pdf) {
            htmlToPdf.setInputEncoding('UTF-8');
            htmlToPdf.setOutputEncoding('UTF-8');
            htmlToPdf.convertHTMLString(html, './' + pdf, function (error, success) {
                if (error) {
                    console.log('Oh noes! Errorz!');
                    console.log(error);
                } else {
                    console.log('Woot! Success!');
                    console.log(success);
                }
            }
            );
        });

        // recebe um array de codigo html para a criação de ficheiro html
        socket.on("saveAsHtml", function (data) {
            var scriptStart = "<script type=\"text/javascript\">";
            var scriptEnd = "</script>";
            var styleStart = "<style type=\"text/css\">";
            var styleEnd = ".dragandrophandler {width:400px;color:#92AAB0;text-align:left;vertical-align:middle;padding: 10px 10px 10px 10px;margin-bottom:10px;font-size:200%;}</style>";
            var html = "<html><head>";
            html += scriptStart + fs.readFileSync(__dirname + '/../sharedpen/www/lib/jquery-1.11.2.js') + scriptEnd;
            html += scriptStart + fs.readFileSync(__dirname + '/../sharedpen/www/lib/turn.min.js') + scriptEnd;
            html += styleStart + fs.readFileSync(__dirname + '/../sharedpen/www/css/turnjs.css') + styleEnd;
            html += "</head>\n<body>\n\t<div>\n\t\t<div id=\"flipbook\">\n\t\t<div class=\"hard\" style=\"line-height:300px\"> Livro </div>\n\t\t<div class=\"hard\"></div>\n";

            for (var i = 0; i < data.length; i++) {
                html += "\t\t<div>\n\t\t\t" + data[i] + "\n\t\t</div>\n";
            }

            html += "\n<div class=\"hard\"></div>\n<div class=\"hard\"></div>\n</div>\n</div>\n<script type=\"text/javascript\">\n$(\"#flipbook\").turn({width: \"100%\",height: \"100%\",autoCenter: true});\n</script>\n</body>\n</html>";
            fs.writeFile(__dirname + "/../Livro.html", html, function (err) {
                if (err) {
                    console.log('ERROR:: ' + err);
                    throw err;
                } else {
                    console.log("File saved as HTML");
                }
            });
        });


        // recebe o pedido com o noome de um apasta e o servidor devolve o
        // nome dos ficheiros da pasta
        socket.on("getFiles2Folder", function (data) {
            var files = fs.readdirSync(__dirname + '/../sharedpen/www/' + data.folder).filter(function (file) {
                return file;
            });
            // devolve ao cliente a lista de ficheiros da pasta
            socket.emit("files2folder", files, data);
        });

        // qunado um cliente se desliga informa os outros cliente de
        // que se desligou
        socket.on('disconnect', function () {
            socket.broadcast.emit('diconnected', socket.id);
            var usr = self.objectFindByKey(self.clients, "socket", socket.id);
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
                    //quando n ha users limpa o hash
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
 * Funcao para auxilio para guardar as imahens no servidor
 * @param {type} dataString
 * @returns {Server.prototype.decodeBase64Image.response|Error}
 */
Server.prototype.decodeBase64Image = function (dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    return response;
};


Server.prototype.msgappend = function (id, parent, html) {
    var self = this;
    //console.log(id);
    //console.log(self.hash["." + parent].modelo.arrayElem[id]);
    self.hash["." + parent].modelo.arrayElem[id].conteudo = html;
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

/**
 *
 * @param {type} port
 * @returns {Server}
 */
module.exports = Server;
