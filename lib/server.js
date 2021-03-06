/* global module, require */


var express = require('express');
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
     * Login do Utilizador devolve o id a role a que pertence e o seu avatar
     */
    this.app.get("/loginuser/:user/:pass", function (req, res) {
        connection.query(
                'SELECT u.id as id, ' +
                'u.avatar as avatar, ' +
                'r.nome as role, ' +
                'r.pagesView as pages ' +
                'FROM Roles as r, UsersRoles as ur, User as u ' +
                'WHERE r.id = ur.id_role ' +
                'and ur.id_user = u.id ' +
                'and u.username like "' + req.params.user + '" ' +
                'AND u.password like "' + req.params.pass + '" ' +
                'AND u.active = 1;', function (err, data) {
                    if (err) {
                        res.json(err);
//                        throw err;
                    }
                    res.json(data);
                });
    });

/**
 * Salvar os contributos de cada aluno intervenientee no projeto
 */
    this.app.post("/saveContributes", function (req, res) {
//        console.log(req.body.list);
        var listaU = req.body.list;
        var valuesList = "";
        var listUssers = [];
        // percorre o array com os contributos para fazer a insercao na base de 
        // // dados e controi a 
        // // lista de utilizadores unicoas para a criacao da lista dos intervenientes
        for (var j in  listaU) {
            var lista = listaU[j];
            for (var i in  lista) {
                listUssers.push(lista[i].user);
                valuesList += "('" +
                        lista[i].projecto + "','" +
                        lista[i].user + "','" +
                        lista[i].tab + "','" +
                        lista[i].editorPara + "','" +
                        lista[i].text +
                        "'),";
            }
        }
        valuesList = valuesList.slice(0, -1);
        var unique = cleanArray(listUssers.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        }));
//        console.log(unique);
        var listGetUser = "";
        for (var i in unique) {
            listGetUser += unique[i] + ",";
        }
        // insere os registos na base de daos
        listGetUser = listGetUser.slice(0, -1);
        connection.query('INSERT INTO sharedpen.UserContributo (idProjeto, idUser, pagina, editor, contributo)  VALUES ' + valuesList + ';', function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
//            res.json(data);
// consulta a base de dados para devolver o nome e o avatar do aluno interveniente
            connection.query(
                    'SELECT Aluno.nome, User.avatar ' +
                    'FROM User, Aluno ' +
                    'WHERE User.id = Aluno.id_user ' +
                    ' AND User.id IN (' + listGetUser + ');', function (err, data) {
                        if (err) {
                            res.json(err);
                            throw err;
                        }
                        res.json(data);
                    });
        });
    });
	
	/////////////////////////////////////////////////////////////////////////////////
 /**
 * Salvar os contributos de cada professor interveniente no projeto
 */
    this.app.post("/saveContributesProf", function (req, res) {
//        console.log(req.body.list);
        var listaU = req.body.list;
        var valuesList = "";
        var listUssers = [];
        // percorre o array com os contributos para fazer a insercao na base de 
        // // dados e controi a 
        // // lista de utilizadores unicoas para a criacao da lista dos intervenientes
        for (var j in  listaU) {
            var lista = listaU[j];
            for (var i in  lista) {
                listUssers.push(lista[i].user);
                valuesList += "('" +
                        lista[i].projecto + "','" +
                        lista[i].user + "','" +
                        lista[i].tab + "','" +
                        lista[i].editorPara + "','" +
                        lista[i].text +
                        "'),";
            }
        }
        valuesList = valuesList.slice(0, -1);
        var unique = cleanArray(listUssers.filter(function (item, i, ar) {
            return ar.indexOf(item) === i;
        }));
//        console.log(unique);
        var listGetUser = "";
        for (var i in unique) {
            listGetUser += unique[i] + ",";
        }
        // insere os registos na base de daos
        listGetUser = listGetUser.slice(0, -1);
        /*connection.query('INSERT INTO sharedpen.UserContributo (idProjeto, idUser, pagina, editor, contributo)  VALUES ' + valuesList + ';', function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }*/
//            res.json(data);
// consulta a base de dados para devolver o nome e o avatar do aluno interveniente
            connection.query(
                    'SELECT Professor.nome, User.avatar ' +
                    'FROM User, Professor ' +
                    'WHERE User.id = Professor.id_user ' +
                    ' AND User.id IN (' + listGetUser + ');', function (err, data) {
                        if (err) {
                            res.json(err);
                            throw err;
                        }
                        res.json(data);
                    });
       // });
    });
	
	//////////////////////////////////////////////////////////////////////////////////
	
	
	/*
	* Consulta a base de dados e devolve as molduras das paginas existentes
	*/
	this.app.get("/getMoldurasPage", function (req, res) {
        connection.query('select * from moldura_pagina', function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
	
	/////////////////////////////////////////////////////////////////////////////////////////

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
    this.app.get("/getProjects/:id", function (req, res) {
        connection.query("select * from Projectos where id_creator=" + req.params.id + ";", function (err, data) {
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
    this.app.get("/getProjectsbyID/:id", function (req, res) {
        connection.query("select * from Projectos where id=" + req.params.id + ";", function (err, data) {
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
        connection.query("SELECT idmodelo, nome_livro, num_modeloCapa, num_modeloPagina, moldurass.icon FROM sharedpen.modelo, (select * from moldura_pagina) as moldurass where moldurass.id=moldura;", function (err, data) {
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
    //query 'a tabela professores
    this.app.get("/getAllProfessor", function (req, res) {
        connection.query("SELECT * FROM sharedpen.Professor;", function (err, data) {
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

    //-------------------------------ALUNOS-----------------------------------------
    //query 'a tabela Alunos 
    this.app.get("/getsAlunos", function (req, res) {
        connection.query("select User.id,username,Aluno.nome as nome_aluno,num_aluno,turma,ano,Escola.nome as nome_escola, avatar, active from Aluno, User, Escola where User.id=Aluno.id_user and Aluno.id_escola=Escola.id ORDER BY id_user", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //query 'a tabela Alunos get by id 
    this.app.get("/getAluno/:id", function (req, res) {
        var id = req.params.id;
        connection.query("select id_user,username,Aluno.nome as nome_aluno,num_aluno,turma,ano, id_escola, avatar,password from Aluno, User where User.id=" + id + " and User.id=Aluno.id_user;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //query 'a tabela Alunos update by id 
    this.app.post("/updateAluno", function (req, res) {


        connection.query("SELECT * FROM User where username= '" + req.body.username + "'", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }

            if (data.length != 0) {
                if (data[0].id == req.body.id) {
                    connection.query("UPDATE Aluno, User SET username='" + req.body.username + "', Aluno.nome='" + req.body.nomeAluno + "', num_aluno='" + req.body.numAluno + "',  turma='" + req.body.turma + "', ano='" + req.body.ano + "', id_escola='" + req.body.id_escola + "', avatar='" + req.body.image + "' , password='" + req.body.password + "' WHERE id_user=" + req.body.id + " and User.id=Aluno.id_user", function (err, data) {
                        if (err) {
                            res.json(err);
                            throw err;
                        }

                        res.json(data);
                    });
                } else {

                    res.json("false");
                }
            }
            else {
                connection.query("UPDATE Aluno, User SET username='" + req.body.username + "', Aluno.nome='" + req.body.nomeAluno + "', num_aluno='" + req.body.numAluno + "',  turma='" + req.body.turma + "', ano='" + req.body.ano + "', id_escola='" + req.body.id_escola + "', avatar='" + req.body.image + "' , password='" + req.body.password + "' WHERE id_user=" + req.body.id + " and User.id=Aluno.id_user", function (err, data) {
                    if (err) {
                        res.json(err);
                        throw err;
                    }
                    else {

                        res.json(data);
                    }

                });

            }
        });
    });

    //Inserir novo Aluno
    this.app.post("/insertAluno", function (req, res) {
        var id;
        connection.query("INSERT INTO User ( username, password, avatar) VALUES( '" + req.body.username + "', '" + req.body.password + "', '" + req.body.avatar + "');", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }

            id = data.insertId;

            connection.query("INSERT INTO Aluno ( id_user, nome, turma, ano, id_escola, num_aluno ) VALUES( '" + id + "','" + req.body.nome + "', '" + req.body.turma + "', '" + req.body.ano + "', '" + req.body.id_escola + "', '" + req.body.numero + "');", function (err, data) {
                if (err) {
                    res.json(err);
                    throw err;
                }
                connection.query("INSERT INTO UsersRoles ( id_user, id_role) VALUES( '" + id + "', '1');", function (err, data) {
                    if (err) {
                        res.json(err);
                        throw err;
                    }
                    res.json(data);
                });
            });
        });
    });

    //query 'a tabela Alunos search
    this.app.get("/searchAluno/:search", function (req, res) {
        var search = req.params.search;
        connection.query("select User.id,username,Aluno.nome as nome_aluno,num_aluno,turma,ano,Escola.nome as nome_escola, avatar, active from Aluno, User, Escola where User.id=Aluno.id_user and Aluno.id_escola=Escola.id and (username LIKE '%" + search + "%' or Aluno.nome LIKE '%" + search + "%') ORDER BY id_user", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //-------------------------------Agrupamentos-----------------------------------------    
    //query 'a tabela Agrupamentos
    this.app.get("/getsAgrupamentos", function (req, res) {
        connection.query("SELECT * FROM sharedpen.Agrupamento;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
//            console.log(data);
        });
    });
    //query 'a tabela Agrupamentos get by id 
    this.app.get("/getAgrupamentos/:id", function (req, res) {
        var id = req.params.id;
        connection.query("select id,nome from Agrupamento where  id=" + id, function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    //query 'a tabela Agrupamentos update by id 
    this.app.post("/updateAgrupamentos", function (req, res) {




        connection.query("SELECT * FROM Agrupamento where nome= '" + req.body.nome + "'", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }

            if (data.length != 0) {
                if (data[0].id == req.body.id) {
                    connection.query("UPDATE Agrupamento set nome='" + req.body.nome + "'  where  id=" + req.body.id, function (err, data) {
                        if (err) {
                            res.json(err);
                            throw err;
                        }

                        res.json(data);
                    });
                } else {

                    res.json("false");
                }
            }
            else {
                connection.query("UPDATE Agrupamento set nome='" + req.body.nome + "'  where  id=" + req.body.id, function (err, data) {
                    if (err) {
                        res.json(err);
                        throw err;
                    }
                    else {

                        res.json(data);
                    }

                });

            }
        });
    });
    //query 'a tabela all Agrupamentos 
    this.app.get("/getsAllAgrupamentos", function (req, res) {
        connection.query("SELECT id,nome FROM sharedpen.Agrupamento ORDER BY nome ASC;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
//            console.log(data);
        });
    });

    //Inserir nova Escola
    this.app.post("/insertAgrupamento", function (req, res) {
        var id;
        connection.query("INSERT INTO Agrupamento ( nome) VALUES( '" + req.body.nome + "');", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //query 'a tabela Alunos search
    this.app.get("/searchAgrupamento/:search", function (req, res) {
        var search = req.params.search;
        connection.query("SELECT * FROM sharedpen.Agrupamento where nome LIKE '%" + search + "%'", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //-------------------------------Escolas-----------------------------------------
    //query 'a tabela Escolas
    this.app.get("/getsEscolas", function (req, res) {
        connection.query("select Escola.id,Escola.nome as nome_escola,morada, contacto, Agrupamento.nome as nome_agrupamento from Agrupamento,Escola where Agrupamento.id=Escola.id_agrupamento;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
//            console.log(data);
        });
    });

    //query 'a tabela Escolas get by id 
    this.app.get("/getEscolas/:id", function (req, res) {
        var id = req.params.id;
        connection.query("select id,nome,morada, contacto, id_agrupamento from Escola where id=" + id, function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //query 'a tabela Escolas update by id 
    this.app.post("/updateEscolas", function (req, res) {

        connection.query("SELECT * FROM Escola where nome= '" + req.body.nome + "'", function (err, data) {
            if (err) {

                res.json(err);
                throw err;
            }

            if (data.length != 0) {
                if (data[0].id == req.body.id) {

                    connection.query("UPDATE Escola set nome ='" + req.body.nome + "'    ,morada ='" + req.body.morada + "'    , contacto ='" + req.body.contacto + "'     , id_agrupamento ='" + req.body.id_agrupamento + "'   where  id=" + req.body.id, function (err, data) {
                        if (err) {

                            res.json(err);
                            throw err;
                        }
                        else {
                            res.json(data);
                        }

                    });
                } else {

                    res.json("false");
                }
            }
            else {
                connection.query("UPDATE Escola set nome ='" + req.body.nome + "'    ,morada ='" + req.body.morada + "'    , contacto ='" + req.body.contacto + "'     , id_agrupamento ='" + req.body.id_agrupamento + "'   where  id=" + req.body.id, function (err, data) {
                    if (err) {
                        res.json(err);
                        throw err;
                    }
                    else {

                        res.json(data);
                    }

                });

            }
        });
    });

    //query 'a tabela all escolas
    this.app.get("/getAllEscolas", function (req, res) {
        connection.query("SELECT id,nome FROM Escola ORDER BY nome ASC;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
//            console.log(data);
        });
    });

    //Inserir nova Escola
    this.app.post("/insertEscola", function (req, res) {
        var id;
        connection.query("INSERT INTO Escola ( nome, morada, contacto, id_agrupamento) VALUES( '" + req.body.nome + "', '" + req.body.morada + "', '" + req.body.contacto + "', '" + req.body.agrupamento + "');", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //query 'a tabela Alunos search
    this.app.get("/searchEscola/:search", function (req, res) {
        var search = req.params.search;
        connection.query("select Escola.id,Escola.nome as nome_escola,morada, contacto, Agrupamento.nome as nome_agrupamento from Agrupamento,Escola where Agrupamento.id=Escola.id_agrupamento and Escola.nome LIKE '%" + search + "%'", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    //-------------------------------Professores-----------------------------------------
    //query 'a tabela Professores
    this.app.get("/getsProfessores", function (req, res) {
        connection.query("select User.id, User.username, User.active,Professor.nome as nome_professor,email,Agrupamento.nome as nome_agrupamento,avatar from Professor,User,Agrupamento where User.id= Professor.id_user and Professor.id_agrupamento= Agrupamento.id;", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
//            console.log(data);
        });
    });

    //query 'a tabela Professores get by id 
    this.app.get("/getProfessores/:id", function (req, res) {
        var id = req.params.id;
        connection.query("select User.id, User.username,Professor.nome as nome_professor,email,id_agrupamento,avatar,password from Professor,User where User.id= Professor.id_user and  User.id=" + id, function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    //query 'a tabela Professores update by id 
    this.app.post("/updateProfessores", function (req, res) {
        connection.query("SELECT * FROM User where username= '" + req.body.username + "'", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }

            if (data.length != 0) {

                if (data[0].id == req.body.id) {
                    connection.query("update Professor,User set username='" + req.body.username + "'   ,nome='" + req.body.nome + "'   ,email='" + req.body.email + "'   ,id_agrupamento='" + req.body.id_agrupamento + "'   ,avatar='" + req.body.avatar + "',password='" + req.body.password + "'   where User.id= Professor.id_user  and User.id=" + req.body.id, function (err, data) {
                        if (err) {
                            res.json(err);
                            throw err;
                        }
                        res.json(data);
                    });
                } else {
                    res.json("false");
                }
            }
            else {
                connection.query("update Professor,User set username='" + req.body.username + "'   ,nome='" + req.body.nome + "'   ,email='" + req.body.email + "'   ,id_agrupamento='" + req.body.id_agrupamento + "'   ,avatar='" + req.body.avatar + "',password='" + req.body.password + "'   where User.id= Professor.id_user  and User.id=" + req.body.id, function (err, data) {
                    if (err) {
                        res.json(err);
                        throw err;
                    }
                    else {
                        res.json(data);
                    }

                });

            }
        });


    });


    //Inserir novo Professor
    this.app.post("/insertProfessor", function (req, res) {
        var id;
        connection.query("INSERT INTO User ( username, password, avatar) VALUES( '" + req.body.username + "', '" + req.body.password + "', '" + req.body.avatar + "');", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            id = data.insertId
            connection.query("INSERT INTO Professor ( id_user, nome, email, id_agrupamento ) VALUES( '" + id + "','" + req.body.nome + "', '" + req.body.email + "', '" + req.body.agrupamento + "');", function (err, data) {
                if (err) {
                    res.json(err);
                    throw err;
                }
                connection.query("INSERT INTO UsersRoles ( id_user, id_role) VALUES( '" + id + "', '3');", function (err, data) {
                    if (err) {
                        res.json(err);
                        throw err;
                    }
                    res.json(data);
                });
            });
        });
    });

    //query 'a tabela Alunos search
    this.app.get("/searchProfessor/:search", function (req, res) {
        var search = req.params.search;
        connection.query("select User.id, User.username, User.active,Professor.nome as nome_professor,email,Agrupamento.nome as nome_agrupamento,avatar from Professor,User,Agrupamento where User.id= Professor.id_user and Professor.id_agrupamento= Agrupamento.id and (username LIKE '%" + search + "%' or Professor.nome LIKE '%" + search + "%' or email LIKE '%" + search + "%' )", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    //-------------------------------Mudar-estado-user-----------------------------------------
    this.app.post("/updateState", function (req, res) {
        var user = req.body.user_id;
        var type = req.body.type;
        var state = req.body.state;

        connection.query("UPDATE User SET active=" + state + " WHERE id=" + user, function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    /**
     * -----------------------------------------------------------BACKOFFICE-END-------------------------------------------------------------
     */

    /**
     * insere o array na base de dados
     */
    this.app.post('/setArray', function (req, res) {
        connection.query("INSERT INTO `sharedpen`.`Projectos` (`nome`, `id_creator`, `tipo`, `id_grupo`, `id_modelo`, `estado`, `array`) VALUES ('teste', '1', 'Poema', '1', '1', '1', '" + [req.body.arrayy] + "')", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    
    /**
     * devolve o array de acordo com o id do projeto
     */
    this.app.get('/getArray/:id', function (req, res) {
        connection.query("select array from Projectos where id=(" + [req.params.id] + ")", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    
    /**
     * Consulta a base de dados e devolve o codigo html da pagina pretendida
     */
    this.app.get('/getCodModel/:id', function (req, res) {
        connection.query("SELECT htmltext from sharedpen.modelos_pagina where id= ?", [req.params.id], function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });
    
    /**
     * Devolve o codigo html das duas paginas selecionadas
     */
    this.app.get('/getCodTwoModels/:capa/:page/:model', function (req, res) {
        connection.query("SELECT p.id, p.htmltext, css.texto, moldura.img FROM sharedpen.modelos_pagina as p," +
                "(SELECT css_texto as texto FROM sharedpen.modelo where idmodelo = " + req.params.model + ") as css," +
				"(SELECT imagem as img FROM sharedpen.moldura_pagina moldura,(select moldura from sharedpen.modelo where " +
				 " idmodelo = " + req.params.model + ") as idMoldura where id=idMoldura.moldura ) as moldura" +
				 " where p.id IN (" + req.params.capa + "," + req.params.page + ");", function (err, data) {
                    //connection.query("SELECT * FROM sharedpen.modelos_pagina where `id` IN (" + req.params.capa + "," + req.params.page + ");", function (err, data) {
                    if (err) {
                        res.json(err);
                        throw err;
                    }
                    res.json(data);
                });
    });
    
    /**
     * Salva o modelo do livro
     */
    this.app.post('/saveModelLivro', function (req, res) {
//        console.log(req.body);
        connection.query("SELECT * FROM sharedpen.modelo where nome_livro like ?", [req.body.nomeProjeto], function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            if (data.length === 0) {
                connection.query("insert into modelo (nome_livro, num_modeloCapa, num_modeloPagina, html_texto, css_texto, moldura) values('" +
                        req.body.nomeProjeto + "','" +
                        req.body.numModeloC + "','" +
                        req.body.numModeloP + "','" +
						req.body.textHtml + "','" +
                        req.body.stylesLivro + "','" +
						req.body.numModeloM + "')", function (err, data) {
                            if (err) {
                                res.json(err);
                                throw err;
                            }
//                            console.log(data);
                            res.json("Ok");
                        });
            } else {
                res.json("false");
            }

        });
    });
    
    //Guardar novo projeto
    this.app.post('/saveProjLivro', function (req, res) {
        connection.query("SELECT * FROM sharedpen.Projectos where nome like ?;", [req.body.nomeProjeto], function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            if (data.length === 0) {
                connection.query("INSERT INTO `sharedpen`.`Projectos` (`nome`, `id_creator`, `tipo`, `id_modelo`, `estado`, `array`, `texto`) VALUES ('" +
                        req.body.nomeProjeto + "', '" +
                        req.body.idCreator + "', '" +
                        req.body.tipo + "','" +
                        req.body.idmodel + "', '1', '" +
                        req.body.array + "','" +
                        req.body.texto + "');", function (err, data) {
                            if (err) {
                                res.json(err);
                                throw err;
                            }
//                            console.log(data);
                            connection.query("SELECT id FROM sharedpen.Projectos where nome like '" + req.body.nomeProjeto + "';", function (err, data) {
                                if (err) {
                                    res.json(err);
                                    throw err;
                                } else {
                                    //Inserir utilizadores do projeto
                                    var users = req.body.users;//.splice(",");
                                    for (var i = 0; i < users.length; i++) {
                                        if (users[i].length > 0 && users[i] > 0) {
                                            connection.query("INSERT INTO `sharedpen`.`UsersProject` (`id_user`, `id_proj`) VALUES ('" +
                                                    users[i] + "', '" +
                                                    data[0].id + "');", function (err, data) {
                                                if (err) {
//                                                    console.log(err)
                                                }
                                            });
                                        }
                                    }
                                }
                                ;
                                res.json("Ok" + data[0].id);
                            });
                        });
            }
        });
    });

    /**
     * 	Get recebe o id do modelo e retorna toda a linha da tabela referente ao id
     */
    this.app.post('/getModelLivro/:model', function (req, res) {
        connection.query("SELECT * FROM sharedpen.modelo where idmodelo=" + req.params.model + ";", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

    /**
     * 	Get recebe o id do modelo e retorna toda a linha da tabela referente ao id
     */
    this.app.get('/getProjParticipaByID/:id', function (req, res) {
        connection.query("SELECT nome,tipo, sharedpen.Projectos.id FROM sharedpen.Projectos, sharedpen.UsersProject where sharedpen.Projectos.id = sharedpen.UsersProject.id_proj AND  sharedpen.UsersProject.id_user = '" + req.params.id + "';", function (err, data) {
            if (err) {
                res.json(err);
                throw err;
            }
            res.json(data);
        });
    });

};
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
        socket.on("myname", function (data, avatar) {

            // entrega aao novo clientre a lista dde clientes ja existentes
            for (var i = 0, max = self.clients.length; i < max; i++) {
                var u = self.clients[i];
                socket.emit('useron', u.name, u.avatar, u.port, u.socket);
            }

            // criacao do novo cliente
            var user = {
                name: data,
                avatar: avatar,
                port: address.port,
                socket: socket.id
            };
            // informacao aos outros clientes que se ligou um novo cliente
            socket.broadcast.emit('useron', user.name, user.avatar, user.port, user.socket);
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
        socket.on("getAllTabs", function (data) {

            if (Object.keys(self.hash[data.Pid]).length !== 0) {
                // informa os outros clientes da cliacao de uma nova tab
                socket.emit("NewTabs", {
                    tabsHash: self.hash[data.Pid]
                });
            }
        });
        
        socket.on('reqHashToSave', function (data) {
//            console.log("hashToSave");
//            self.io.sockets.emit('getHashToSave', {
//                hashh: self.hash[data.id]
//            });
            //UPDATE `sharedpen`.`Projectos` SET `array`='' WHERE `id`='';
            var oldData = data;
            var saving = self.hash[data.id];
            //saving.myself = self.hash[data.id];
            seen = [];
            json1 = JSON.stringify(saving, function (key, val) {
                if (typeof val == "object") {
                    if (seen.indexOf(val) >= 0)
                        return
                    seen.push(val)
                }
                return val
            });

            connection.query("UPDATE `sharedpen`.`Projectos` SET `array`='\'" + JSON.stringify(json1).toString() + "\'' WHERE `id`='" + data.id + "';", function (err, data) {
                if (err) {
                    socket.emit('saveHashStatus', {
                        sucess: false,
                        id: oldData.id
                    });
                }

                socket.emit('saveHashStatus', {
                    sucess: true,
                    id: oldData.id
                });
            });
        });
        socket.on('reqHash', function (data) {
            var usr = data.username;
            if (typeof self.hash[data.id] !== "undefined") {
                self.io.sockets.emit('getHash', {
                    hashh: JSON.stringify(self.hash[data.id]),
                    id: data.id,
                    username: usr
                });
            } else {
                var idP = data.id;
                connection.query("select array, tipo from Projectos where id='" + idP + "'", function (err, data) {
                    if (err) {
//                        console.log(err);
                    }
                    var tmp = data[0].array.replace(/'/g, "");
                    self.hash[idP] = JSON.parse(tmp);
                    for (var item in self.hash[idP]) {
                        self.hash[idP][item].projID = idP;
                        self.hash[idP][item].projtipo = data[0].tipo;
                    }
                    self.io.sockets.emit('getHash', {
                        hashh: JSON.stringify(self.hash[idP]),
                        id: idP,
                        username: usr
                    });
                });

            }
        });

        //Para por no servidor o hash quando se abre um projecto
        socket.on('storedhash', function (data) {
            self.hash[data.id] = data.storedhash;
//            console.log(self.hash);
        });
        // recebe a informacao de uma nova mensagem no chat
        socket.on('message', function (data) {
            // envia para todos incluindo para quem a envio a mensagem do chat
            self.io.sockets.emit('message', data);
            self.msgChat += data.user + ":" + data.data + ":" + data.avatar + ',';
        });
        // recebe a informacao de alteracoa de mansagens
        socket.on('msgappend', function (data) {
            var html = data.html;
            var id = data.id;
            var parent = data.parent;
            var tipo = data.tipo;
            var Pid = data.Pid;
            switch (tipo) {
                case "IMG":
                    self.hash[Pid]['.' + parent].modelo.arrayElem[id].conteudo = data.imageData;
//                    console.log("\n\n\n\n" +self.hash['.' + parent].modelo.arrayElem[id].conteudo);
                    break;
                default :
                    //self.actualizaTabs(id, char, pos, parent);
                    self.msgappend(id, parent, html, Pid);
            }
            socket.broadcast.emit('msgappend', data);
        });
        // recebe a informacao de que uma tab foi alterada
        socket.on("TabsChanged", function (data) {
            if (data.op === "remover") {
                self.removeTab(data.id, data.Pid);
            } else {
                self.hash[data.Pid][data.tab.id] = data.tab;
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
            if (data.type !== "backgoundImage") {
                self.hash[data.Pid]["." + data.parent].modelo.arrayElem[data.id].drawObj.ArrayCanvasImage[data.socket] = data.canvas;
            } else {
                self.hash[data.Pid]["." + data.parent].modelo.arrayElem[data.id].drawObj.bgImg = data.canvas;
            }
            // envia para os outros clientes as informacoes do desenho no canvas
            socket.broadcast.emit('draw', {
                data: data,
                socket: socket.id
            });
        });

        // recebe as informacoes do desenho no canvas
        socket.on('reqCanvasIMG', function (data) {
//            console.log("passou");
            // envia para os outros clientes as informacoes do desenho no canvas
            socket.broadcast.emit('getCanvasIMG', {
                canvas: self.hash[data.Pid][data.parent].modelo.arrayElem[data.id].drawObj
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
        /*socket.on("saveAsHtml", function (html) {
         
         fs.writeFile(__dirname + "/../sharedpen/www/livro/Livro.html", html, function (err) {
         if (err) {
         console.log('ERROR:: ' + err);
         throw err;
         } else {
         console.log("File saved as HTML");
         }
         });
         });*/
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
Server.prototype.msgappend = function (id, parent, html, Pid) {
    var self = this;
    //console.log(id);
    //console.log(self.hash["." + parent].modelo.arrayElem[id]);
    self.hash[Pid]["." + parent].modelo.arrayElem[id].conteudo = html;
};
/**
 *
 * @param {type} id
 * @returns {undefined}
 */
Server.prototype.removeTab = function (id, Pid) {
    var self = this;
    delete self.hash[Pid]['.txtTab' + id];
    //refactor array
    var i = 0;
    //cria array auxiliar
    var hash1 = {};
    //percorre todas as keys do array
    for (var key in self.hash[Pid]) {
        var newId = key.replace(/[0-9]/, (i + 1));
        hash1[newId] = self.hash[Pid][key];
        hash1[newId].id = newId;
        for (var elemento in self.hash[Pid][key].modelo.arrayElem) {
            var idd = elemento.replace(/[0-9]/, (i + 1));
            hash1[newId].modelo.arrayElem[idd] = self.hash[Pid][key].modelo.arrayElem[elemento];
            hash1[newId].modelo.arrayElem[idd].id = self.hash[Pid][key].modelo.arrayElem[elemento].id.replace(/[0-9]/, (i + 1));
            hash1[newId].modelo.arrayElem[idd].conteudo = self.hash[Pid][key].modelo.arrayElem[elemento].conteudo;
            if ((i + 1) >= id)
                delete hash1[newId].modelo.arrayElem[elemento];
        }
        i++;
    }
    self.hash[Pid] = hash1;
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
 * Recebe um array e limpa as posicoes udefined e devolve o array limpo
 * @param {type} actual
 * @returns {Array|cleanArray.newArray}
 */
function cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i]);
        }
    }
    return newArray;
}

/**
 *
 * @param {type} port
 * @returns {Server}
 */
module.exports = Server;
