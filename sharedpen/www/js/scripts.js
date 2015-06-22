/**
 *
 * Scrip com as Funcoes de autenticação, tabs e modelos, desenho, chat, e cor de background
 */

var wait = '<div id="loading"><div><img alt="" src="./../img/wait.gif"></div></div>';
var users = []; // array com os clientes ligado
var numUsers = 0;
var socket = ""; // socket de comunicacao
var username = ""; // nome do utilizador ligado
var userColor = "";
var userNumber = "";
var avatarUser = "";
var listaColor = [// array com as corres disponiveis para alterar o fundo
    ["default", "Default"],
    ["white", "Branco"],
    ["red", "Vermelho"],
    ["yellow", "Amarelo"],
    ["blue", "Azul"],
    ["pink", "Rosa"],
    ["green", "Verde"]
];
var hash = {};              // array com as tabes atuais do projeto
var tabTest;                // auxiliar para a criacao de uma nova tab
var LivroPoemas = new Array(); // array para os poemas
var listapages = [];            // lista de paginas
var backArray = ["home"];
var folderArray = [listapages];
var tmpArrayProj = [];
var tmpModels = [];
var currentPosition = 1;
var pass;
$(document).ready(function () {
    //--------------------------BACKOFFICE----------------------------------------
    //fazer update a aluno
    $("body").on('click', "#guardarEditAluno", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) { //validacao de dados no carregar de butao
            e.stopPropagation();
            e.preventDefault();
            //se a password nao foi alterada nao encripta, se foi incripta
            if (pass != $("#password_aluno_edit").val()) {
                pass = stringToMd5($("#password_aluno_edit").val());
            }
            //guardar os dados do aluno (updateAluno)
            $.ajax({
                type: "POST",
                url: "/updateAluno",
                data: {
                    image: $("#userImage").attr('src'),
                    id: $("#Id_aluno_edit").val(),
                    username: $("#username_aluno_edit").val(),
                    nomeAluno: $("#nome_aluno_edit").val(),
                    numAluno: $("#numero_aluno_edit").val(),
                    password: pass,
                    turma: $("#turma_aluno_edit option:selected").val(),
                    ano: $("#ano_aluno_edit option:selected").val(),
                    id_escola: $("#escola_aluno_edit option:selected").val()
                },
                dataType: 'json',
                success: function (data) {
                    if (data === 'false') { //verifica se o username existe
                        alert("Este Utilizador ja existe!!");

                    } else {
                        $(".voltarLayout").click();
                    }
                },
                error: function (error) {
                    console.log(JSON.stringify(error));
                }
            });
        });
    });

    //fazer update a professor
    $("body").on('click', "#guardarEditProfessor", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) { //validacao de dados no carregar de butao
            e.stopPropagation();
            e.preventDefault();
            //guardar os dados do professor (updateProfessores)        
            $.ajax({
                type: "POST",
                url: "/updateProfessores", //Chama a query para realizar o update aos professores
                data: {
                    avatar: $("#userImage").attr('src'),
                    id: $("#Id_Professor_edit").val(),
                    username: $("#username_Professor_edit").val(),
                    nome: $("#Nome_Professor_edit").val(),
                    password: stringToMd5($("#password_Professor_edit").val()),
                    id_agrupamento: $("#Agrupamento_Professor_edit option:selected").val(),
                    email: $("#Email_Professor_edit").val()
                },
                dataType: 'json',
                success: function (data) {
                    if (data === 'false') { //verifica se o username existe, mostra uma mensagem de alerta ao utilizador
                        alert("Este Utilizador ja existe!!");

                    } else {
                        //Regressa ao menu anterior
                        $(".voltarLayout").click();
                    }
                },
                error: function (error) {
                    console.log(JSON.stringify(error));
                }
            });
        });

    });

    //fazer update a escola
    $("body").on('click', "#guardarEditEscola", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) { //validacao de dados no carregar de butao
            e.stopPropagation();
            e.preventDefault();
            //guardar os dados da escola (updateEscolas)        
            $.ajax({
                type: "POST",
                url: "/updateEscolas", //Chama a query para realizar o update às escolas
                data: {
                    id: $("#Id_Escola_edit").val(),
                    nome: $("#Nome_Escola_edit").val(),
                    morada: $("#Morada_Escola_edit").val(),
                    contacto: $("#Contacto_Escola_edit").val(),
                    id_agrupamento: $("#Agrupamento_Escola_edit option:selected").val()
                },
                dataType: 'json',
                success: function (data) {
                    if (data === 'false') {
                        alert("Esta Escola ja existe!");
                    }
                    else {
                        $(".voltarLayout").click();
                    }
                },
                error: function (error) {
                    console.log(JSON.stringify(error));
                }
            });
        });

    });

    //fazer update a agrupamento
    $("body").on('click', "#guardarEditAgrupamento", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) { //validacao de dados no carregar de butao
            e.stopPropagation();
            e.preventDefault();
            //guardar os dados da agrupamento (updateAgrupamentos)        
            $.ajax({
                type: "POST",
                url: "/updateAgrupamentos", //Chama a query para realizar o update aos agrupamentos
                data: {
                    id: $("#Id_Agrupamento_edit").val(),
                    nome: $("#Nome_Agrupamento_edit").val()
                },
                dataType: 'json',
                success: function (data) {
                    if (data === 'false') {
                        alert("Este Agrupamento ja existe!");
                    }
                    else {
                        $(".voltarLayout").click();
                    }

                },
                error: function (error) {
                    console.log(JSON.stringify(error));
                }
            });
        });
    });


    //editar aluno/professor/escola/agrupamento 
    $("body").on('click', ".editInfo", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var type = $(this).data("type"); //verifica se é aluno/professor/escola/agrupamento ( no butao data-type="aluno")
        switch (type) {
            case "aluno":
                addLayoutToDiv("#contentor", "html", "EditarAluno.html", socket); //Carrega o layout
                if (currentPosition != backArray.length) {
                    backArray.splice(currentPosition, backArray.length - currentPosition);
                    folderArray.splice(currentPosition, folderArray.length - currentPosition);
                }
                backArray.push($(this).data("layout"));
                folderArray.push($(this).data("folder"));
                currentPosition += 1;
                $("body").append(wait);
                //adicionar informacao a dropdown (escolas)
                $.ajax({
                    type: "GET",
                    url: "/getAllEscolas",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar = "";
                        for (var i = 0, max = data.length; i < max; i++) { //adicionar options a dropdown (escolas)
                            htmlVar += "<option value=" + data[i].id + ">" + data[i].nome + "</option>";
                        }
                        $("body").find("#loading").remove();
                        $("body").find("#escola_aluno_edit").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                //preencher campos de editar aluno
                $.ajax({
                    type: "GET",
                    url: "/getAluno/" + $(this).attr("rel"),
                    dataType: 'json',
                    success: function (data) {
                        $("#Id_aluno_edit").val(data[0].id_user);
                        $("#userImage").attr("src", data[0].avatar);
                        $("#username_aluno_edit").val(data[0].username);
                        $("#nome_aluno_edit").val(data[0].nome_aluno);
                        $("#numero_aluno_edit").val(data[0].num_aluno);
                        $("#turma_aluno_edit").val(data[0].turma);
                        $("#ano_aluno_edit").val(data[0].ano);
                        $("#escola_aluno_edit").val(data[0].id_escola);
                        $("#password_aluno_edit").val(data[0].password);
                        pass = data[0].password;
                        $("body").find("#loading").remove();
                    },
                    error: function (error) {
                        //Remove o ecran de loading e apresenta uma mensagem de alerta de erro
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;

            case "professor":
                addLayoutToDiv("#contentor", "html", "EditarProfessor.html", socket); //Carrega o layout
                if (currentPosition != backArray.length) {
                    backArray.splice(currentPosition, backArray.length - currentPosition);
                    folderArray.splice(currentPosition, folderArray.length - currentPosition);
                }
                backArray.push($(this).data("layout"));
                folderArray.push($(this).data("folder"));
                currentPosition += 1;
                $("body").append(wait);
                $.ajax({
                    //preencher campos do dropdown de editar (Agrupamentos)
                    type: "GET",
                    url: "/getsAllAgrupamentos",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar = "";
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlVar += "<option value=" + data[i].id + ">" + data[i].nome + "</option>";
                        }
                        $("body").find("#loading").remove();
                        $("body").find("#Agrupamento_Professor_edit").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                $.ajax({
                    //Mostra os dados dos professores
                    type: "GET",
                    url: "/getProfessores/" + $(this).attr("rel"),
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar;
                        $("#userImage").attr("src", data[0].avatar);
                        $("#Id_Professor_edit").val(data[0].id);
                        $("#username_Professor_edit").val(data[0].username);
                        $("#Nome_Professor_edit").val(data[0].nome_professor);
                        $("#Email_Professor_edit").val(data[0].email);
                        $("#password_Professor_edit").val(data[0].password);
                        $("#Agrupamento_Professor_edit").val(data[0].id_agrupamento);
                        $("body").find("#loading").remove();
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        //Remove o ecran de loading e apresenta uma mensagem de alerta de erro
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;

            case "escola":
                addLayoutToDiv("#contentor", "html", "EditarEscola.html", socket); //Carrega o layout
                if (currentPosition != backArray.length) {
                    backArray.splice(currentPosition, backArray.length - currentPosition);
                    folderArray.splice(currentPosition, folderArray.length - currentPosition);
                }
                backArray.push($(this).data("layout"));
                folderArray.push($(this).data("folder"));
                currentPosition += 1;
                $("body").append(wait);
                //adicionar informacao a dropdown (agrupamentos)
                $.ajax({
                    type: "GET",
                    url: "/getsAllAgrupamentos",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar = "";
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlVar += "<option value=" + data[i].id + ">" + data[i].nome + "</option>";
                        }
                        $("body").find("#loading").remove();
                        $("body").find("#Agrupamento_Escola_edit").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                $.ajax({
                    type: "GET",
                    url: "/getEscolas/" + $(this).attr("rel"),
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar;
                        $("#Id_Escola_edit").val(data[0].id);
                        $("#Nome_Escola_edit").val(data[0].nome);
                        $("#Morada_Escola_edit").val(data[0].morada);
                        $("#Contacto_Escola_edit").val(data[0].contacto);
                        $("#Agrupamento_Escola_edit").val(data[0].id_agrupamento);
                        $("body").find("#loading").remove();
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        //Remove o ecran de loading e apresenta uma mensagem de alerta de erro
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;

            case "agrupamento":
                addLayoutToDiv("#contentor", "html", "EditarAgrupamento.html", socket); //Carrega o layout
                if (currentPosition != backArray.length) {
                    backArray.splice(currentPosition, backArray.length - currentPosition);
                    folderArray.splice(currentPosition, folderArray.length - currentPosition);
                }
                backArray.push($(this).data("layout"));
                folderArray.push($(this).data("folder"));
                currentPosition += 1;
                $("body").append(wait);
                $.ajax({
                    type: "GET",
                    url: "/getAgrupamentos/" + $(this).attr("rel"),
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar;
                        $("#Id_Agrupamento_edit").val(data[0].id);
                        $("#Nome_Agrupamento_edit").val(data[0].nome);
                        $("body").find("#loading").remove();
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
        }
        validacaoFormAll();
    });

    //editar estado de um utilizador
    $("body").on('click', ".editState", function (e) {
        e.stopPropagation();
        e.preventDefault();
        var tipo = $(this).data("type");
        var user = $(this).attr("rel");
        var est;
        if ($(this).find("img").attr("src") == "../img/green.png") {
            est = 0;
        } else {
            est = 1;
        }
        $.ajax({
            type: "POST",
            url: "/updateState",
            data: {
                user_id: user,
                type: tipo,
                state: est
            },
            dataType: 'json',
            success: function (data) {
                switch (tipo) {
                    case "aluno":
                        addLayoutToDiv("#contentor", "html", "GerirAlunos.html", socket);
                        break;
                    case "professor":
                        addLayoutToDiv("#contentor", "html", "GerirProfessores.html", socket);
                        break;
                }
            },
            error: function (error) {
            }
        });
    });

    //criar aluno
    $("body").on('click', "#btnAdicionarEntity_aluno", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) {

            e.stopPropagation();
            e.preventDefault();
            var tipo = $(this).data("type");
            var avatar = $("#add-Entity-Image").attr('src');
            var username = $("#username_aluno_add").val();
            var password = stringToMd5($("#password_aluno_add").val());
            var nome = $("#nome_aluno_add").val();
            var numero = $("#numero_aluno_add").val();
            var escola = $("#escola_aluno_add option:selected").val();
            var ano = $("#ano_aluno_add").val();
            var turma = $("#turma_aluno_add").val();
            $.ajax({
                type: "POST",
                url: "/insertAluno",
                data: {
                    //id: user,
                    type: tipo,
                    username: username,
                    password: password,
                    nome: nome,
                    numero: numero,
                    id_escola: escola,
                    ano: ano,
                    turma: turma,
                    avatar: avatar
                },
                dataType: 'json',
                success: function (data) {

                     $(".voltarLayout").click();
                },
                error: function (error) {
                }
            });
        });
    });

    //criar professor
    $("body").on('click', "#btnAdicionarEntity_professor", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var tipo = $(this).data("type");
            var avatar = $("#add-Entity-Image").attr('src');
            var username = $("#username_Professor_add").val();
            var password = stringToMd5($("#password_Professor_add").val());
            var nome = $("#Nome_Professor_add").val();
            var email = $("#Email_Professor_add").val();
            var agrupamento = $("#Agrupamento_Professor_add option:selected").val();
            $.ajax({
                type: "POST",
                url: "/insertProfessor",
                data: {
                    //id: user,
                    type: tipo,
                    username: username,
                    password: password,
                    nome: nome,
                    email: email,
                    agrupamento: agrupamento,
                    avatar: avatar
                },
                dataType: 'json',
                success: function (data) {

                    $(".voltarLayout").click();
                    //addLayoutToDiv("#contentor", "html", "GerirProfessores.html", socket);
                },
                error: function (error) {
                }
            });
        });
    });
    //criar escola
    $("body").on('click', "#btnAdicionarEntity_escola", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) {

            e.stopPropagation();
            e.preventDefault();
            //var avatar = $("#add-Entity-Image").attr('src');
            var nome = $("#Nome_Escola_add").val();
            var morada = $("#Morada_Escola_add").val();
            var contacto = $("#Contacto_Escola_add").val();
            var agrupamento = $("#Agrupamento_Escola_add option:selected").val();
            $.ajax({
                type: "POST",
                url: "/insertEscola",
                data: {
                    //id: user,
                    nome: nome,
                    morada: morada,
                    contacto: contacto,
                    agrupamento: agrupamento
                },
                dataType: 'json',
                success: function (data) {

                    $(".voltarLayout").click();
                    //addLayoutToDiv("#contentor", "html", "GerirProfessores.html", socket);
                },
                error: function (error) {
                }
            });
        });
    });
    //criar escola
    $("body").on('click', "#btnAdicionarEntity_agrupamento", function (e) {
        $("body").find('.validForm').on('success.form.bv', function (e) {

            e.stopPropagation();
            e.preventDefault();
            //var avatar = $("#add-Entity-Image").attr('src');
            var nome = $("#Nome_Agrupamento_add").val();
            $.ajax({
                type: "POST",
                url: "/insertAgrupamento",
                data: {
                    //id: user,
                    nome: nome
                },
                dataType: 'json',
                success: function (data) {

                    $(".voltarLayout").click();
                    //addLayoutToDiv("#contentor", "html", "GerirProfessores.html", socket);
                },
                error: function (error) {
                }
            });
        });
    });
    // procurar por Username de aluno
    $("body").on('input', "#inputSearch", function (e) {
        var type = $(this).data("type");
        switch (type) {
            case "aluno":
                $("body").append(wait);
                if (($("#inputSearch").val() == "") || ($("#inputSearch").val() == " ")) {
                    addLayoutToDiv("#contentor", "html", "GerirAlunos.html", socket); //Carrega o layout
                    $("#inputSearch").focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/searchAluno/" + $("#inputSearch").val(), //Chama a query de procurar aluno por ID
                        dataType: 'json',
                        success: function (data) {
                            //Re-cria a tabela com os resultados de pesquisa
                            var htmlVar;
                            $('#gerirEntitiesTable tbody').empty();
                            //Re-cria a tabela com os resultados de pesquisa
                            for (var i = 0, max = data.length; i < max; i++) {
                                htmlVar += "<tr>";
                                htmlVar += "<td>" + data[i].id + "</td>" +
                                        "<td>" + '<img class="text-center avatar-mini" src="' + data[i].avatar + '"></td>' +
                                        "<td>" + data[i].username + "</td>" +
                                        "<td>" + data[i].nome_aluno + "</td>" +
                                        "<td>" + data[i].num_aluno + "</td>" +
                                        "<td>" + data[i].ano + "</td>" +
                                        "<td>" + data[i].turma + "</td>" +
                                        "<td>" + data[i].nome_escola + "</td>" +
                                        '<td class="image">' +
                                        '<div rel=' + data[i].id + ' class="editInfo" data-type="aluno" data-folder="html" data-layout="EditarAluno.html">' +
                                        '<img class="text-center image" src="../img/edit_40.png">' +
                                        '</div>' +
                                        '</td>' +
                                        '<td class="image">' +
                                        '<div rel=' + data[i].id + ' class="editState" data-type="aluno">' +
                                        '<img class="text-center image" width="35"';
                                if (data[i].active == "1") {
                                    htmlVar += ' src="../img/green.png">';
                                } else {
                                    htmlVar += ' src="../img/red.png">';
                                }
                                '</div>' +
                                        '</td>' +
                                        "</tr>";
                            }
                            $("body").find("#loading").remove();
                            $("body").find("#gerirEntitiesTable").append(htmlVar);
                        },
                        error: function (error) {
                            $("body").find("#loading").remove();
                            alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                            console.log(JSON.stringify(error));
                        }
                    });
                }
                $("body").find("#loading").remove();
                break;

            case "professor":
                $("body").append(wait);
                if (($("#inputSearch").val() == "") || ($("#inputSearch").val() == " ")) {
                    addLayoutToDiv("#contentor", "html", "GerirProfessores.html", socket); //Carrega o layout
                    $("#inputSearch").focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/searchProfessor/" + $("#inputSearch").val(), //Chama a query de procurar professor por ID
                        dataType: 'json',
                        success: function (data) {
                            //Re-cria a tabela com os resultados de pesquisa
                            var htmlVar;
                            $('#gerirEntitiesTable tbody').empty();
                            //Re-cria a tabela com os resultados de pesquisa
                            for (var i = 0, max = data.length; i < max; i++) {
                                htmlVar += "<tr>";
                                htmlVar += "<td>" + data[i].id + "</td>" +
                                        "<td>" + '<img class="text-center avatar-mini" src="' + data[i].avatar + '"></td>' +
                                        "<td>" + data[i].username + "</td>" +
                                        "<td>" + data[i].nome_professor + "</td>" +
                                        "<td>" + data[i].email + "</td>" +
                                        "<td>" + data[i].nome_agrupamento + "</td>" +
                                        '<td class="image">' +
                                        '<div rel=' + data[i].id + ' class="editInfo" data-type="aluno" data-folder="html" data-layout="EditarAluno.html">' +
                                        '<img class="text-center image" src="../img/edit_40.png">' +
                                        '</div>' +
                                        '</td>' +
                                        '<td class="image">' +
                                        '<div rel=' + data[i].id + ' class="editState" data-type="aluno">' +
                                        '<img class="text-center image" width="35"';
                                if (data[i].active == "1") {
                                    htmlVar += ' src="../img/green.png">';
                                } else {
                                    htmlVar += ' src="../img/red.png">';
                                }
                                '</div>' +
                                        '</td>' +
                                        "</tr>";
                            }
                            $("body").find("#loading").remove();
                            $("body").find("#gerirEntitiesTable").append(htmlVar);
                        },
                        error: function (error) {
                            $("body").find("#loading").remove();
                            alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                            console.log(JSON.stringify(error));
                        }
                    });
                }
                $("body").find("#loading").remove();
                break;

            case "escola":
                $("body").append(wait);
                if (($("#inputSearch").val() == "") || ($("#inputSearch").val() == " ")) {
                    addLayoutToDiv("#contentor", "html", "GerirEscolas.html", socket);
                    $("#inputSearch").focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/searchEscola/" + $("#inputSearch").val(), //Chama a query de procurar professor por ID
                        dataType: 'json',
                        success: function (data) {
                            var htmlVar;
                            $('#gerirEntitiesTable tbody').empty();
                            for (var i = 0, max = data.length; i < max; i++) {
                                htmlVar += "<tr>";
                                htmlVar +=
                                        "<td>" + data[i].id + "</td>" +
                                        "<td>" + data[i].nome_escola + "</td>" +
                                        "<td>" + data[i].morada + "</td>" +
                                        "<td>" + data[i].contacto + "</td>" +
                                        "<td>" + data[i].nome_agrupamento + "</td>" +
                                        '<td class="image">' +
                                        '<div rel=' + data[i].id + ' class="editInfo" data-type="aluno" data-folder="html" data-layout="EditarAluno.html">' +
                                        '<img class="text-center image" src="../img/edit_40.png">' +
                                        '</div>' +
                                        '</td>' +
                                        "</tr>";
                            }
                            $("body").find("#loading").remove();
                            $("body").find("#gerirEntitiesTable").append(htmlVar);
                        },
                        error: function (error) {
                            $("body").find("#loading").remove();
                            alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                            console.log(JSON.stringify(error));
                        }
                    });
                }
                $("body").find("#loading").remove();
                break;

            case "agrupamento":
                $("body").append(wait);
                if (($("#inputSearch").val() == "") || ($("#inputSearch").val() == " ")) {
                    addLayoutToDiv("#contentor", "html", "GerirAgrupamentos.html", socket);
                    $("#inputSearch").focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/searchAgrupamento/" + $("#inputSearch").val(),
                        dataType: 'json',
                        success: function (data) {
                            var htmlVar;
                            $('#gerirEntitiesTable tbody').empty();
                            for (var i = 0, max = data.length; i < max; i++) {
                                htmlVar += "<tr>";
                                htmlVar +=
                                        "<td>" + data[i].id + "</td>" +
                                        "<td>" + data[i].nome + "</td>" +
                                        '<td class="image">' +
                                        '<div rel=' + data[i].id + ' class="editInfo" data-type="aluno" data-folder="html" data-layout="EditarAluno.html">' +
                                        '<img class="text-center image" src="../img/edit_40.png">' +
                                        '</div>' +
                                        '</td>' +
                                        "</tr>";
                            }
                            $("body").find("#loading").remove();
                            $("body").find("#gerirEntitiesTable").append(htmlVar);
                        },
                        error: function (error) {
                            $("body").find("#loading").remove();
                            alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                            console.log(JSON.stringify(error));
                        }
                    });
                }
                $("body").find("#loading").remove();
        }
    });
    //--------------------------BACKOFFICE-END---------------------------------------


// coloca os pedidos do ajax async false
    $.ajaxSetup({async: false});
    /**
     * Configuracao das opcoes do popup de online / offline de novos clientes
     */
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn"
    };


    // cria a ligacoo com o servidor que disponibiliza o socket
    //    socket = io.connect('http://185.15.22.55:8080');
    socket = io.connect(window.location.href);
    // Carrega o dropdown com a liosta das cores
    $('#colorpicker').addAllColors(listaColor);
    // coloca o cursor para introduzir o nome do utilizador
    $("#username").focus();
    // ao carregar em enter no nome do utilizador carrega no button
    $("#username, #password").keydown(function (event) {
        if (event.keyCode == 13) {
            $("#startlogin").click();
        }
    });
    /**
     * Funcoes relacionadas com a autenticacao --------------------------------------------------------------------
     */

    // evento de carregar no button para fazer o login
    $("#startlogin").click(function () {
        username = $("#username").val();
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/loginuser/" + username + "/" + stringToMd5($("#password").val()),
            dataType: 'json',
            async: true,
            success: function (data) {
                if (data.length > 0) {
                    userNumber = data[0].id;
                    avatarUser = data[0].avatar;
                    alert(data[0].role);
                    $("#div-login").remove();
                    $("#contentor").css({
                        display: "block"
                    });
                    $("#atualuser").html(
                            "<u><i><b>" +
                            username +
                            "</b></i></u>");
                    socket.emit("myname", username, avatarUser);
                    userColor = hexToRgb(0, socket.id, username);
                    listapages = JSON.parse(data[0].pages);
                    carregarPaginasLogin(listapages);
                } else {
                    alert("Esperimente\n" +
                            "User = a, pass = a => Aluno\n" +
                            "User = b, pass = b => Admin\n" +
                            "User = c, pass = c => Professor");
                    $("#erro_name").html("Nome Incorreto ou Password!");
                    setTimeout(function () {
                        $("#erro_name").animate({
                            opacity: 0
                        }, 2000, function () {
                            $("#erro_name").html("");
                            $("#erro_name").css({
                                opacity: 1
                            });
                        });
                    }, 500);
                }
                $("body").find("#loading").remove();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Esperimente\n" +
                        "User = a, pass = a => Aluno\n" +
                        "User = b, pass = b => Admin\n" +
                        "User = c, pass = c => Professor\n" +
                        "O Nome de Utilizador ou PassWord Incorretos.\n" +
                        "Tente Novamente.");
                console.log(JSON.stringify(error));
            }
        });
    });

    // ajusta os elementos na pagina
    ajustElements();
    // recebe as cordenadas dos outros utilizadores e movimenta a label dele
    // conforme as coordenadas recebidas
    socket.on('useron', function (data, avatar, port, socketid) {
        if (data != "") {
            if (typeof users[socketid] == "undefined") {
                users[socketid] = new Client($("#" + socketid), data, port, socketid);
                $("#listaUsers").append(
                        "<p class='" +
                        socketid +
                        "'><img class='imguser' src='" + avatar + "'>" +
                        data +
                        "</p>");
                toastr.success(data, 'Online');
                users[socketid].setName(data);
            } else {
                users[socketid].setSocketId(socketid);
            }
        }
    });
    /**
     * Funcoes relacionadas com o desenho -------------------------------------------------------------------------
     */
    /**
     * evento do socket para desenhar o que recebe pelo socket
     */
    socket.on('draw', function (data) {
        var kk = Object.keys(hash)
//        console.log(hash[kk[0]].projID);
//        console.log(data.data.Pid);
        if (hash[kk[0]].projID == data.data.Pid) {
            if (typeof hash["." + data.data.parent] != "undefined") {
                var cmvv = hash["." + data.data.parent].modelo.arrayElem[data.data.id].drawObj;
                cmvv.drawOtherUser(
                        data.data.color,
                        data.data.sizeCursor,
                        data.data.x,
                        data.data.y,
                        data.data.type,
                        data.data.socket,
                        //envia a imagem
                        data.data.image,
                        data.data.apagar,
                        data.data.apagarTudo
                        );
            }
        }
    });
    /**
     * Eventos do mouse para desenhar no canvas
     */
    $("body").on('click mousedown mouseup mousemove mouseleave mouseout touchstart touchmove touchend touchcancel', "canvas", function (e) {
        var idToll = "." + $(this).parent().parent().parent().attr('class').split(' ')[1];
        var iddd = $(this).attr('id');
        var tabNumber = iddd.match(/\d+/)[0];
        var thisId = "tab" + tabNumber + "-Mycanvas";

        if (e.which == 1 ||
                e.handleObj.type == "touchstart" ||
                e.handleObj.type == "touchmove" ||
                e.handleObj.type == "touchend") {
            var offset, type, x, y;
            type = e.handleObj.type;
            offset = $(this).offset();
            e.offsetX = e.clientX - offset.left;
            e.offsetY = e.clientY - offset.top;

            if (e.handleObj.type == "touchstart" ||
                    e.handleObj.type == "touchmove" ||
                    e.handleObj.type == "touchend") {
                //para apanhar o erro no touchend
                try {
                    x = e.originalEvent.touches[0].pageX - offset.left;
                    y = e.originalEvent.touches[0].pageY - offset.top;
                } catch (err) {
                }
            } else {
                x = e.offsetX;
                y = e.offsetY;
            }
            var cmv = hash[idToll].modelo.arrayElem[thisId].drawObj;
            var sizeCurs = hash[idToll].modelo.arrayElem["tab" + tabNumber + "-Mycanvas"].drawObj.getSizeCursor();
            cmv.draw(x, y, type, sizeCurs);
            var kk = Object.keys(hash);
//            console.log(hash[kk[0]].projID)
            socket.emit('drawClick', {
                id: thisId,
                x: x,
                y: y,
                type: type,
                color: hash[idToll].modelo.arrayElem["tab" + tabNumber + "-Mycanvas"].drawObj.getColor(),
                apagar: hash[idToll].modelo.arrayElem["tab" + tabNumber + "-Mycanvas"].drawObj.getApagar(),
                sizeCursor: hash[idToll].modelo.arrayElem["tab" + tabNumber + "-Mycanvas"].drawObj.getSizeCursor(),
                socket: socket.id,
                //imagem do meu canvas!!
                canvas: hash[idToll].modelo.arrayElem[thisId].drawObj.getCanvas().toDataURL(),
                parent: $(this).parent().parent().parent().attr('class').split(' ')[1],
                apagarTudo: hash[idToll].modelo.arrayElem["tab" + tabNumber + "-Mycanvas"].drawObj.getApagarTudo(),
                Pid: hash[kk[0]].projID
            });
            //                        alert('Left Mouse button pressed.');
        } else if (e.which == 2) {
            //                        alert('Middle Mouse button pressed.');
        } else if (e.which == 3 ||
                e.handleObj.type == "doubletap") {
            $(this).contextMenu({
                menuSelector: "#toolbar",
                menuSelected: function (invokedOn, selectedMenu) {
                    switch (selectedMenu.data("tipo")) {
                        // apagar em todos os canvas
                        case "corTudo":
                            hash[idToll].modelo.arrayElem[thisId].drawObj.setApagarTudo(selectedMenu.data("cor"));
                            //                                alert(selectedMenu.data("cor"));
                            break;
                            // selecionar cor
                        case "cor":
                            hash[idToll].modelo.arrayElem[thisId].drawObj.setColor(selectedMenu.data("cor"));
                            //                                alert(selectedMenu.data("cor"));
                            break;
                            // selecionar cor do cursor
                        case "size":
                            hash[idToll].modelo.arrayElem[thisId].drawObj.setSizePensil(selectedMenu.data("size"));
                            //                                alert(selectedMenu.data("size"));
                            break;
                            // coloca uma gem do pc
                        case "img":
                            $("#LoadImageCanvas").click();
                            //                                alert(selectedMenu.data("tipo"));
                            break;
                            // coloca a imagem da galeria
                        case "galeria":
                            var vals = {
                                folder: "galeria",
                                idtab: idToll,
                                idObj: thisId
                            };
                            getFilesToFolder(socket, vals);
                            break;
                        default:
                            break;
                    }
                }
            });
            hash[idToll].modelo.arrayElem[thisId].drawObj.setPallet(idToll.replace(".", ""), thisId);
            //                        alert('Right Mouse button pressed.');
        }
        //                        alert('You have a strange Mouse!');


    });

    /**
     * adiciona a imagem selecionada no canvas e envia-a aos outros utilizadores
     */
    $("body").on('change', '#LoadImageCanvas', function (e) {
        var Thid = $("#LoadImageCanvas").attr('data-idpai');
        var parent = "txtTab" + Thid.match(/^\d+|\d+\b|\d+(?=\w)/);
        var cnv = $("#LoadImageCanvas").attr('data-idcnv');
        var input = e.target;
        var kk = Object.keys(hash);
        var reader = new FileReader();
        reader.onload = function () {
            var dataURL = reader.result;
            hash["." + Thid].modelo.arrayElem[cnv].drawObj.imageCanvas(dataURL);
            //            imageCanvas(dataURL, Thid);
            socket.emit('drawClick', {
                id: cnv,
                type: "backgoundImage",
                color: hash["." + Thid].modelo.arrayElem[cnv].drawObj.getColor(),
                sizeCursor: hash["." + Thid].modelo.arrayElem[cnv].drawObj.getSizeCursor(),
                socket: socket.id,
                canvas: dataURL,
                parent: Thid,
                image: dataURL,
                Pid: hash[kk[0]].projID
            });
        };
        reader.readAsDataURL(input.files[0]);
    });
    /*
     * Funcoes relacionadas com as cores ----------------------------------------------------------------------
     */

    /**
     * Evento onChange da cor de fundo
     */
    $("#colorpicker").change(function () {
        socket.emit('setcolor', {
            cor: $(this).find('option:selected').val()
        });
    });
    /**
     * Evento gerado quando recebe uma alteraÃ§ao de cores
     */
    socket.on('getcolor', function (data) {
        if (data.cor == "default") {
            $('body').css('background-image', 'url(../img/background.png)');
        } else {
            $("body").css('background-image', 'none');
            switch (data.cor) {
                case "white":
                    $("h1, h3").css({
                        color: "black"
                    });
                    break;
                default:
                    $("h1, h3").css({
                        color: "white"
                    });
                    break;
            }
            $("body").css("background-color", data.cor);
        }
        $("#colorpicker").val(data.cor);
    });
    /*
     * Funcoes relacionas com as Tabs e modelos --------------------------------------------------------------------------------
     */

    // *******************************************************************
    // dados recebidos pelo socket para o browser
    // *******************************************************************
    // recebe o codigo ASCII da tecla recebida, converte-a para
    // carater e adiciona-o na posicao coreta
    socket.on('msgappend', function (data) {
        //verificar se o projecto de onde foi emitido Ã© o meu
        var kk = Object.keys(hash);
        if (data.Pid == hash[kk[0]].projID) {
            switch (data.tipo) {
                case "IMG":
                    $("body").find('#' + data.id).attr('src', data.imageData);
                    break;
                default:
                    if (typeof $("#" + data.id).parent().parent().attr('class') != "undefined") {
                        var parentid = $("#" + data.id).parent().parent().attr('class').split(' ')[1];
                        var editor = hash["." + parentid].modelo.arrayElem[data.id].editor;
                        editor.setTextEditor(data);
                    }
            }
        }
    });
    /**
     * Evento gerado quando um utilizador se connecta, coloca as tabs
     */
    socket.on('NewTabs', function (data) {
        var newHash = {};
        for (var item in data.tabsHash) {
            newHash[item] = castTab(data.tabsHash[item]);
        }
        hash = newHash;
        var i = 0;
        for (var key in hash) {
            i++;
            Addtab(hash[key].numModelo, i);
            updateTab(i, key, null);
        }
    });

    /**
     *  envia o texto do editor para o servidor
     */
    $("body").on('keypress keyup mousedown mouseup click', '.editable', function (e) {
        var listClass = $(this).attr("id");
        var listClassPAI = $(this).parent().parent().attr('class').split(' ')[1];
        // console.log(listClassPAI);
        var edit = hash["." + listClassPAI].modelo.arrayElem[listClass].editor;
        // verifica se nao estou a criar um projeto
        if (backArray[backArray.length - 1] != "MenuCriarProjectos.html") {
            // verifica se o pe e do utilizador
            if ($("#" + edit.idpai + " > #" + e.target.id).attr("class") != edit.userNum) {
                // se for um evento do mouse coloca o cursor no fim do texto
                if (e.handleObj.type.charAt(0) == 'm' || e.handleObj.type.charAt(0) == 'c') {
                    setCaretAtEditor(e.target.id, 0, $("#" + edit.idpai + " > #" + e.target.id).text().length);
                } else {
                    // se o utilizador carregar no enter constroi um novo 
                    // // paragrafo e informa o servidor 
                    if (e.keyCode == edit.key.ENTER) {
                        // verifica se tem espaco para crar mais outro paragrafo
                        if ($("#" + edit.idpai).height() > edit.getSizePUtilizado()) {
                            e.preventDefault(); //Prevent default browser behavior
                            edit.createPara(edit.userNum, e.target.id);
                            var kk = Object.keys(hash);
                            socket.emit('msgappend', {
                                html: $("#" + edit.idpai).html(),
                                textSinc: $(e.target).text(),
                                pos: 0,
                                socketid: edit.userNum,
                                id: edit.idpai,
                                novoPara: true,
                                idPara: e.target.id,
                                parent: $("#" + edit.idpai).parent().parent().attr('class').split(' ')[1],
                                'Pid': hash[kk[0]].projID
                            });
                            // se nao tiver espaco informa o utilizador
                        } else {
                            alert("Não pode colocar mais nenhum paragrafo.\nSe for necessário crie uma nova folha.");
                        }
                    } else {
                        e.preventDefault();
                    }
                }
                // se for o dono do paragrafo escreve e podeefetuar toas as 
                // operacoes no mesmo
            } else {
                var newPara = false;
                // valida se a tecla pressionada e o enter
                if (e.handleObj.type.charAt(0) == 'k' && e.keyCode == edit.key.ENTER) {
                    if (e.handleObj.type == 'keypress') {
                        if ($("#" + edit.idpai).height() > edit.getSizePUtilizado()) {
                            edit.createPara(edit.userNum, e.target.id);
                            newPara = true;
                        } else {
                            alert("Não pode colocar mais nenhum paragrafo.\nSe for necessário crie uma nova folha.");
                        }
                    }
                    e.preventDefault(); //Prevent default browser behavior
                }
                edit.atualPara = e.target.id;
//            console.log(hash[".txtTab1"].projID)
                var kk = Object.keys(hash);
                // envia o seu paragrafo para o servidor
                socket.emit('msgappend', {
                    html: $("#" + edit.idpai).html(),
                    textSinc: $(e.target).text(),
                    pos: 0,
                    socketid: edit.userNum,
                    id: edit.idpai,
                    novoPara: newPara,
                    idPara: e.target.id,
                    parent: $("#" + edit.idpai).parent().parent().attr('class').split(' ')[1],
                    'Pid': hash[kk[0]].projID
                });
                newPara = false;
            }
            edit.changeColorPUsers();
        } else {
            // se estiver a criar um prijeto verifica se pressionou no enter 
            // para cir um novo paragrsfo
            if (e.handleObj.type.charAt(0) == 'k' && e.keyCode == edit.key.ENTER) {
                if (e.handleObj.type == 'keypress') {
                    if ($("#" + edit.idpai).height() > edit.getSizePUtilizado()) {
                        edit.createPara(edit.userNum, e.target.id);
                        newPara = true;
                    } else {
                        alert("Não pode colocar mais nenhum paragrafo.\nSe for necessário crie uma nova folha.");
                    }
                }
                e.preventDefault(); //Prevent default browser behavior
            }
            edit.atualPara = e.target.id;
            edit.conteudo = $("#" + edit.idpai).html().replace(/"/g, "");
        }

    });
    /**
     * Evento gerado quando ha alteracoes nas tabs
     */
    socket.on("TabsChanged", function (data) {
        var kk = Object.keys(hash);
        if (hash[kk[0]].projID == data.Pid) {
            if ($.trim(username) != "") {
                if (data.op == "remover") {
                    removeTab(data.id);
                } else {
                    Addtab(data.modelo, data.pos);
                    hash[".txtTab" + data.pos] = castTab(data.tab);
                    updateTab(data.pos, ".txtTab" + data.pos, data.creator);
                }
            }
        }
    });
    /**
     * Evento que determina qual e o modelo escolhido
     */

    $("body").on('click', "#bt_guardar", function () {
        var kk = Object.keys(hash);
        socket.emit('reqHashToSave', {
            id: hash[kk[0]].projID
        });
    });

    socket.on('saveHashStatus', function (data) {
        var kk = Object.keys(hash);
        if (typeof hash[kk[0]] != "undefined") {
            var idProjAtual = hash[kk[0]].projID;
            if (idProjAtual == data.id && data.sucess) {
                alert("Projeto Gravado na base de dados");
            }
        }

    });

    $("body").on('click', "#bt_getHash", function () {
        //alert(hash);
        $.ajax({
            type: "GET",
            url: "/getArray/" + 9,
            dataType: 'json',
            success: function (data) {
//                console.log(data[0]);
                //var ola =   JSON.parse('[object Object]');
                // console.log(ola);

                var test = JSON.parse('' + data[0].array + '');

//                console.log(test);
                //for (var a in test) break;
                //console.log("aaaaaaaaaaaaaa"+a);
                var olaola = castTab(test);
                //console.log(olola);
            },
            error: function (error) {
                alert("ERRO HASH");
                //console.log(JSON.stringify(error));
            }
        });
    });

    /**
     * evento de carrear para adicionar uma nova tab ao carregar no modelo pretendido
     */
    $("body").on('click', ".btnmodels", function () {
        var modelo = $(this).data('idmodel');
        var idNum = (Object.keys(hash).length + 1);
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getCodModel/" + modelo,
            dataType: 'json',
            success: function (data) {
                $("body").find("#loading").remove();
                Addtab(modelo, idNum);
                $(".txtTab" + idNum).html(data[0].htmltext);
                refactorTab(modelo, idNum);
                addtohash(idNum);
                var kk = Object.keys(hash);
                socket.emit('TabsChanged', {
                    //remover ou adicionar
                    op: "adicionar",
                    //tab
                    tab: tabTest,
                    //posiÃ§ao
                    pos: (Object.keys(hash).length),
                    //modelo
                    modelo: modelo,
                    //numero de elementos do modelo
                    noEl: $(".txtTab" + (hash.length + 1)).children('div').children().length,
                    creator: userNumber,
                    //por id da nova TAB
                    Pid: hash[kk[0]].projID
                });
                $("body").find("#loading").remove();
                $("body").find("#divchangemodel").remove();
                // Foco na ultima pagina adicionada
                $("body").find("a[href^='#page']:last").click();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar o modelo selecionado.\n\Tente novamente.");
                console.log(JSON.stringify(error));
            }
        });
    });

    /**
     * Evento onClik que gera a criacao de uma nova Tab e respectivo modelo
     */
    $("body").on('click', 'a[href="#add-page"]', function (e) {
        var obj = Object.keys(hash)[Object.keys(hash).length - 1];
        if (hash[obj].projtipo.toUpperCase() == "Livro".toUpperCase() ||
                hash[obj].projtipo.toUpperCase() == "Poema".toUpperCase()) {
            var modelo = hash[obj].numModelo;
            var idNum = (Object.keys(hash).length + 1);
            $("body").append(wait);
            $.ajax({
                type: "GET",
                url: "/getCodModel/" + modelo,
                dataType: 'json',
                success: function (data) {
                    Addtab(modelo, idNum);
                    $(".txtTab" + idNum).html(data[0].htmltext);
                    refactorTab(modelo, idNum, hash[obj].styles);
                    addtohash(idNum);
                    var kk = Object.keys(hash);
                    socket.emit('TabsChanged', {
                        //remover ou adicionar
                        op: "adicionar",
                        //tab
                        tab: tabTest,
                        //posiÃ§ao
                        pos: (Object.keys(hash).length),
                        //modelo
                        modelo: modelo,
                        //numero de elementos do modelo
                        noEl: $(".txtTab" + (hash.length + 1)).children('div').children().length,
                        creator: userNumber,
                        //por id da nova TAB
                        Pid: hash[kk[0]].projID
                    });
                    $("body").find("#loading").remove();
                    // Foco na ultima pagina adicionada
                    $("body").find("a[href^='#page']:last").click();
                },
                error: function (error) {
                    $("body").find("#loading").remove();
                    alert("Erro ao tentar carregar o modelo selecionado.\n\Tente novamente.");
                    console.log(JSON.stringify(error));
                }
            });

        } else if (hash[obj].projtipo.toUpperCase() == "Jornal".toUpperCase()) {
            $("body").append(wait);
            $.ajax({
                type: "GET",
                url: "/getModelsPage",
                dataType: 'json',
                success: function (data) {
                    var htmlModel = "<div id='divchangemodel'>" +
                            "<div><div><input class='btn-primary btn-round' id='btncancelmodels' type='button' value='Cancel'></div><div><div>";
                    for (var i = 0, max = data.length; i < max; i++) {
                        htmlModel += "<figure>" +
                                "<img class='btnmodels btnmodels-style' alt='' src='" +
                                (data[i].icon == null ? "./img/" + data[i].nome + ".png" : data[i].icon) +
                                "' data-idmodel='" + data[i].id +
                                "' data-model='" + data[i].nome + "'/>" +
                                "<figcaption> " + data[i].nome + " </figcaption>" +
                                "</figure>";
                    }
                    htmlModel += "</div></div></div></div>";
                    $("body").append(htmlModel);
                    $("body").find("#loading").remove();
                },
                error: function (error) {
                    $("body").find("#loading").remove();
                    alert("Erro ao tentar carregar os modelos selecionado.\n\Tente novamente.");
                    console.log(JSON.stringify(error));
                }
            });
        }
    });

    /**
     * evento que remove tabs
     */
    $("body").on('click', '.xtab', function () {
        liElem = $(this).attr('id');
        // Mostra "Tem a certeza que quer apagar?" e espera que se carregue em "Ok"
        if (confirm("Tem a certeza que quer apagar?")) {
            removeTab(liElem);
            socket.emit('TabsChanged', {
                //remover ou adicionar
                op: "remover",
                //id (Numero)
                id: liElem
            });
        }
        return false;
    });

    $("body").on('click', '.xpoema', function () {
        liElem = $(this).attr('id');
        // Mostra "Tem a certeza que quer apagar?" e espera que se carregue em "Ok"
        if (confirm("Tem a certeza que quer apagar?")) {
            $('#page' + liElem).remove();
            $('#li' + liElem).remove();
            LivroPoemas.splice(liElem, 1);
        }
        ;
    });

    /**
     * evento para fechar o painel dos modelos
     */
    $("body").on('click', '#btncancelmodels', function () {
        $("body").find("#divchangemodel").remove();
    });
    /*
     * Funcoes relacionas com o Chat ---------------------------------------------------------------------------------------
     */

    /**
     * Evento gerado quando um utilizador manda mensagem no chat
     */
    var countMsg = 0;
    socket.on('message', function (data) {
        $('#panelChat').addNewText(data.user, data.data, data.avatar);
        $('#panelChat').animate({
            scrollTop: $('#panelChat').prop("scrollHeight")
        }, 500);
        if ($("#divUsers").css("visibility") == "hidden") {
            $("#numMsg").html(++countMsg);
            $("#numMsg").css({
                visibility: "visible"
            });
        }
    });
    /**
     * Funcao para enviar uma mensagem no chat
     */
    $('#btnSendChat').click(function () {
        var chatMessage = $('#msgChat').val();
        //limpa input
        if (chatMessage != "")
            socket.emit('message', {
                'data': chatMessage,
                'user': username,
                avatar: avatarUser
            });
        $('#msgChat').val('');
    });

    /**
     * Funcao para enviar mensagem com o enter
     */
    $('#msgChat').keydown(function (e) {
        if (e.keyCode == 13) {
            $('#btnSendChat').click();
        }
    });

    /**
     * Evento gerado quando um utilizador se liga, recebe todas as mensagens do chat
     */
    socket.on("OldmsgChat", function (data) {
        $("#panelChat").html("");
        var aux = data.split(",");
        if (typeof aux[0] != "undefined" && aux.length > 0) {
            for (var i = 0, max = aux.length; i < max; i++) {
                var aux2 = aux[i].split(":");
                if (typeof aux2[1] != "undefined") {
                    $('#panelChat').addNewText(aux2[0], aux2[1], aux2[2].replace(",", ""));
                    if ($("#divUsers").css("visibility") == "hidden") {
                        $("#numMsg").html(++countMsg);
                        $("#numMsg").css({
                            visibility: "visible"
                        });
                    }
                }
            }
        }
        $('#panelChat').animate({
            scrollTop: $('#panelChat').prop("scrollHeight")
        }, 500);
    });

    // *******************************************************************
    // botao chat
    // *******************************************************************
    $('#bt_Chat').click(function () {
        if ($("#divUsers").css("visibility") == "hidden") {
            $("#divUsers").css({
                'visibility': "visible"
            });
            $("#divUsers").animate({
                "left": "74%"
            }, 1000, "swing", function () {
                $("#numMsg").animate({
                    opacity: 0
                }, 500, function () {
                    $("#numMsg").css({
                        visibility: "hidden",
                        opacity: 1
                    });
                    countMsg = 0;
                });
            });
        } else {
            $("#divUsers").animate({
                "left": "100%"
            }, function () {
                $("#divUsers").css({
                    'visibility': "hidden"
                });
            });
        }
    });

    /*
     * Fim Funcoes relacionas com o Chat -------------------------------------------------------------------------------
     */

    //Click para ver os meus projectos atraves do data-layout
    $("body").on('click', "#contentor > div > div[data-layout='MenuGerirProjectos.html']", function () {
        var myID = userNumber;
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getProjects/" + myID,
            async: true,
            dataType: 'json',
            success: function (data) {
                //insere todos os projectos no html!!!!
                for (var proj in data) {
                    //guarda os arrays dos projetos
//                    console.log(data[proj].id);
                    tmpArrayProj[data[proj].id] = data[proj].array;
                    var htmlLine = "<tr class='actve'>" +
                            "<td><a class='' href='#AbrirProj' data-idProj='" + data[proj].id + "' data-folder='html_Work_Models' data-layout='Livro.html'>" + data[proj].nome + "</a></td>" +
                            "<td>" + data[proj].tipo + "</td>" +
                            "<td class='image'>" +
                            "<div class='carregarLayout' data-folder='html' data-layout='EditarProjectos.html'>" +
                            '<img class="text-center image" src="../img/edit_40.png">' +
                            "</div>" +
                            "</td>" +
                            "<td class='image'><img class='text-center image' src='../img/delete_40.png'></td>" +
                            "<td class='image'>" +
                            "<div class='carregarLayout' data-folder='html' data-layout='AvaliarProjecto.html'>" +
                            "<img class='text-center image' src='../img/avaliar_40.png'></td>" +
                            "</div>" +
                            "</td>" +
                            "</tr>";
                    //faz o append do html gerado
                    $("body").find("#meusProjTable").append(htmlLine);
                }
                $("body").find("#loading").remove();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar o modelo selecionado.\n\Tente novamente.");
                console.log(JSON.stringify(error));
            }
        });
    });

    /**
     * evento para abrir um projeto especifico
     */
    $("body").on('click', 'a[href="#AbrirProj"]', function () {
        var idProj = $(this).data("idproj");
        //tmpArrayProj[idProj] = tmpArrayProj[idProj].replace(/'/g, "");

        //verificar se o projecto existe no server
        socket.emit('reqHash', {
            id: idProj,
            username: username
        });

        hash = null;
    });

    socket.on('getHash', function (data) {
        if (data.username == username) {
            //adiciona o novo hash
            hash = JSON.parse(data.hashh);

            //cast das tabs
            var newHash = {};
            for (var item in hash) {
                newHash[item] = castTab(hash[item]);
            }
            hash = newHash;
            addLayoutToDiv("#contentor", "html_Work_Models", "Livro.html", null);
            //se ja existir no servidor
            //carrega o do servidor

            var i = 0;
            for (var item in hash) {
                i++;
                Addtab(hash[item].modelo, i);
                updateTab(i, ".txtTab" + i, null);
            }
        }
    });

    /**
     * Funcoes para drag and drop de imagens -----------------------------------------
     */

    $(".container-fluid").on('change', 'input[type=file]', function (e) {
        var imgId = $(this).next().attr("id");
        var file = e.originalEvent.target.files[0],
                reader = new FileReader(file);
        reader.onload = function (evt) {
            $("body").find('#' + imgId).attr('src', evt.target.result);
            if (imgId != "userImage" && imgId != "image" && imgId != "add-Entity-Image" && imgId != "avatar-Image") {
                // envia as informacoes da nova imagem para os outros clientes
                var kk = Object.keys(hash);
                socket.emit('msgappend', {
                    id: imgId,
                    name: file.name,
                    'imageData': evt.target.result,
                    'tipo': $("body").find('#' + imgId).prop("tagName"),
                    'parent': $("#" + imgId).parent().parent().attr('class').split(' ')[1],
                    'Pid': hash[kk[0]].projID

                });
            }
        };
        reader.readAsDataURL(file);
    });
    $("body").on('dragenter', ".dragandrophandler", function (e) {
        e.stopPropagation();
        e.preventDefault();
        $(this).css('border', '2px solid #0B85A1');
    });
    $("body").on('dragover', ".dragandrophandler", function (e) {
        e.stopPropagation();
        e.preventDefault();
    });
    $("body").on('click', ".dragandrophandler", function (e) {
        var obj = $(this);
        obj.prev('input[type=file]').click();
    });
    $("body").on('drop', ".dragandrophandler", function (e) {
        var idImg = this.id;
        $(this).css('border', '2px dotted #0B85A1');
        e.preventDefault();
        var files = e.originalEvent.dataTransfer.files;
        var errMessage = 0;
        $.each(files, function (index, file) {
            // Some error messaging
            if (!files[index].type.match('image.*')) {
                if (errMessage == 0) {
                    alert('Hey! Images only');
                    ++errMessage
                } else if (errMessage == 1) {
                    alert('Stop it! Images only!');
                    ++errMessage
                } else if (errMessage == 2) {
                    alert("Can't you read?! Images only!");
                    ++errMessage
                } else if (errMessage == 3) {
                    alert("Fine! Keep dropping non-images.");
                    errMessage = 0;
                }
                return false;
            }

            var reader = new FileReader(file);
            reader.onload = function (evt) {
                if (idImg != "userImage" && idImg != "image" && idImg != "add-Entity-Image" && idImg != "avatar-Image") {
                    // envia as informacoes da nova imagem para os outros clientes
                    var kk = Object.keys(hash);
                    socket.emit('msgappend', {
                        id: idImg,
                        name: file.name,
                        'imageData': evt.target.result,
                        'tipo': $("body").find('#' + idImg).prop("tagName"),
                        'parent': $("#" + idImg).parent().parent().attr('class').split(' ')[1],
                        'Pid': hash[kk[0]].projID
                    });
                }
                $("body").find('#' + idImg).attr('src', evt.target.result);
            };
            reader.readAsDataURL(file);
        });
    });

    // recebe a imagem e coloca-a de acordo com o id recebido
    socket.on('user image', function (data) {
        $("body").find('#' + data.id).attr("src", data.imageData);
    });
    
    //************************************************
    //****Esconder botoes do menu*********************
    //************************************************
    $('#bt_PDF, #bt_PRE, #bt_HTML, #bt_guardar').css({
        'visibility': "hidden"
    });

    // *******************************************************************
    // Botao do pdf, Botao do Pre-visualizar
    // *******************************************************************

    $('#bt_PRE, #bt_PDF').click(function () {
        var textPdf = "";
        $('#tabs > li > a').each(function () {
            $($(this).attr("href")).children().children().children().each(function () {
                var idDiv = this.id;
                if (idDiv.indexOf("input") != -1) {


                    var listClass = $(this).attr("id");
                    var listClassPAI = $(this).parent().parent().attr('class').split(' ')[1];

                    var edit = hash["." + listClassPAI].modelo.arrayElem[listClass].editor;
                    textPdf += edit.getTextEditor();

                } else if (idDiv.indexOf("image") != -1) {

                    //console.log($(this)[0].outerHTML);
                    // textPdf += "<div>" + $(this)[0].outerHTML + "</div>";

                    // textPdf += '<img src="http://www.mensagenscomamor.com/images/interna/new/imagens_amor_2.jpg" >';
//                    console.log($(this)[0].src);

                    socket.emit('user image', {
                        imageData: $(this)[0].src
                    });


                    textPdf += '<img src="http://localhost:8080/imgupload/img.jpg" >';
                    socket.emit('removeimage');

                    textPdf += "<div>" + $(this)[0].outerHTML + "</div>";
                    //teste imagem
                    //textPdf='<img src="https://valerianakamura.files.wordpress.com/2011/05/oti_imagem.jpg"/>';
                } else if (idDiv.indexOf("canvas") != -1) {
//                    console.log($("#" + idDiv).parent().parent().attr('class').split(' ')[1] + " - " + hash["." + $("#" + idDiv).parent().parent().attr('class').split(' ')[1]]);

                    textPdf += "<div>" + hash["." + $("#" + idDiv).parent().parent().attr('class').split(' ')[1]].modelo.arrayElem[this.id].drawObj.getImgCanvas() + "</div>";

                }
            });
            //alert("PDF Criado")
        });

        // var doc =jsPDF();
        //  doc.output("./Livro.pdf")

//        console.log(textPdf);

        //PDF NO SERVIDOR
        socket.emit("convertToPdf", textPdf, "Livro.pdf");
    });


    // *******************************************************************
    // Botao de HTML
    // *******************************************************************
    $('#bt_HTML').click(function () {
        var pages = [];
        var usercontributes = [];
        $('#tabs > li > a').each(function () {
            var page = "";
            $($(this).attr("href")).children().children().children().each(function () {
                var idDiv = this.id;
                if (idDiv.indexOf("input") != -1) {
                    var listClass = $(this).attr("id");
                    var listClassPAI = $(this).parent().parent().attr('class').split(' ')[1];
                    var edit = hash["." + listClassPAI].modelo.arrayElem[listClass].editor;
                    page += edit.getTextEditorForHtml();
                    usercontributes.push(edit.contributes(hash["." + listClassPAI].projID));

                } else if (idDiv.indexOf("image") != -1) {
                    page += "<div>" + $(this)[0].outerHTML + "</div>";
                } else if (idDiv.indexOf("canvas") != -1) {
                    var idToll = "." + $(this).parent().parent().attr('class').split(' ')[1];
                    var iddd = $(this).attr('id');
                    var tabNumber = iddd.match(/\d+/)[0];
                    var thisId = "tab" + tabNumber + "-Mycanvas";
                    var drawCanvas = hash[idToll].modelo.arrayElem[thisId];

                    var kk = Object.keys(hash);

                    //tab number
                    var tabNumber = thisId.match(/\d+/)[0];
                    //canvas final!!
                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");
                    canvas.width = $("#tab" + tabNumber + "-canvasdr").children().first().attr("Width");
                    canvas.height = $("#tab" + tabNumber + "-canvasdr").children().first().attr("Height");
                    var h = $("#tab" + tabNumber + "-canvasdr").children().first().attr("Height");
                    var w = $("#tab" + tabNumber + "-canvasdr").children().first().attr("Width");
                    console.log(h + " | " + w);
                    var imagee = new Image(h, w);
                    //var imgAUX = new Image();
                    var canvas2;


                    //desenha o fundo
                    //ctx.drawImage(imgCnv.bgImg, 0, 0);
                    $("#tab" + tabNumber + "-canvasdr").children().each(function () {
                        var imgAUX = new Image($(this).attr("Height"), $(this).attr("Width"));
                        if ($(this).attr("id").match("background")) {
                            var iimg = $(this).css("background-image");
                            iimg = iimg.substring(4, iimg.length - 1);
                            imgAUX.src = iimg;
                            ctx.drawImage(imgAUX, 0, 0);
                        } else {
                            canvas2 = document.getElementById($(this).attr("id"));
                            imgAUX.src = canvas2.toDataURL();
                            ctx.drawImage(imgAUX, 0, 0);
                        }
                    });

                    imagee.src = canvas.toDataURL();
                    page += "<div><img alt= '' src='" + canvas.toDataURL() + "'></div>";
//                    page += "<div>" + drawCanvas.drawObj.getImgCanvas() + "</div>";
                }
            });
            pages.push(page);
        });
        pages.pop();
//        console.log(usercontributes);
        $("body").append(wait);
        // envia para o servidor a lista dos utilizadores e os seu cotributos
        $.ajax({
            type: "POST",
            url: "/saveContributes",
            data: {
                list: usercontributes
            },
            dataType: 'json',
            success: function (data) {
//                console.log(data);
// recebe a lista dos utilizadores com o nome e o avatar de 
// cada um e controi a tabela
                var tableusers = "<h3>Alunos que contribuiram para a realização deste trabalho.</h3>" +
                        "<table style='margin:20px' border='1'>";
                tableusers += "<tr><th>Imagem</th><th>Nome</th></tr>";
                for (var i in data) {
                    tableusers += "<tr><td><img style='width: 70px;height: 70px;' alt='' src='" +
                            data[i].avatar +
                            "'></td><td><p style='font-size:30px;margin:0 20px 0 20px;' >" +
                            data[i].nome +
                            "</p></td></tr>";
                }
                tableusers += "</table>";
                pages.push("<div>" + tableusers + "</div>");

                save_html(pages);
                //socket.emit("saveAsHtml", pages);
                //window.open("./livro/Livro.html");
                $("body").find("#loading").remove();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar o modelo selecionado.\n\Tente novamente.");
                console.log(JSON.stringify(error));
            }
        });
    });

/**
 * evento de selecionar uma imagem na galeria de imagens para adicionar ao canvas
 */
    $("body").on("click", ".imageGaleria", function () {
        var Thid = $(this).attr('data-idpai').replace(".", "");
        var cnv = $(this).attr('data-idcnv');
        var imgSrc = $(this).children("img").attr("src");
        var imgData = getBase64Image(imgSrc);
        hash["." + Thid].modelo.arrayElem[cnv].drawObj.imageCanvas(imgData);
        var kk = Object.keys(hash);
        socket.emit('drawClick', {
            id: cnv,
            type: "backgoundImage",
            color: hash["." + Thid].modelo.arrayElem[cnv].drawObj.getColor(),
            sizeCursor: hash["." + Thid].modelo.arrayElem[cnv].drawObj.getSizeCursor(),
            socket: socket.id,
            canvas: imgSrc,
            parent: Thid,
            image: imgData,
            Pid: hash[kk[0]].projID
        });
        $("#divGaleria").animate({
            "left": "-30%"
        }, 1000, function () {
            $("#divGaleria").css({
                "visibility": "hidden"
            });
        });
    });
    
/**
 * evento dre fechar a galeria de imagens
 */
    $(".fecharGaleria").click(function () {
        $("#divGaleria").animate({
            "left": "-30%"
        }, 1000, function () {
            $("#divGaleria").css({
                "visibility": "hidden"
            });
        });
    });

/**
 * evento de voltar ao menu inicial
 */
    $("#homemenu").click(function () {
        backArray.push("home");
        folderArray.push(listapages);
        currentPosition += 1;
//        console.log(backArray);
        $('#bt_PDF, #bt_PRE, #bt_HTML, #bt_guardar').css({
            'visibility': "hidden"
        });
        LivroPoemas = new Array();
        carregarPaginasLogin(listapages);
    });

    //******************************************************************
    // Recebe a lista de ficheiros de uma determinada pasta
    //******************************************************************
    socket.on("files2folder", function (data, dataVals) {
        //Verifica se esta' a receber imagens de um certo tema
        switch (dataVals.folder) {
            case "galeria":
                if ($("#divGaleria").css("visibility") == "hidden") {
                    var imgList = '<div class="col-xs-12 col-sm-12 col-md-12">';
                    for (var i = 0, max = data.length; i < max; i++) {
                        imgList += '<div class="imageGaleria col-xs-4 col-sm-4 col-md-4 image" data-idpai="' + dataVals.idtab + '" data-idcnv="' + dataVals.idObj + '">';
                        imgList += '<img src="./' + dataVals.folder + '/' + data[i] + '" alt="">';
                        imgList += '</div>';
                    }
                    imgList += ' </div>';
                    $("#panelGaleria").html(imgList);
                    $("#divGaleria").css({
                        "visibility": "visible"
                    });
                    $("#divGaleria").animate({
                        "left": "1%"
                    }, 1000, "swing");
                } else {
                    $("#divGaleria").animate({
                        "left": "-30%"
                    }, 1000, function () {
                        $("#divGaleria").css({
                            "visibility": "hidden"
                        });
                    });
                }
                break;
            case "temaspoemas":
                //Temas para os poemas
                var htmlModel = "<div id='divchangemodel'>" +
                        "<div><div><input class='btn-primary btn-round' id='btncancelmodels' type='button' value='Cancel'></div><div><div>" +
                        "<h1 class='text-center'>Temas</h1>";
                for (var i = 0, max = data.length; i < max; i++) {
                    //se o nome retornado nao contem "." desduz-se que Ã© uma pasta
                    if (data[i].indexOf(".") == -1) {
                        var pasta = data[i];
                        htmlModel += "<figure class='image'>" +
                                "<img class='tema-img' data-folder='temaspoemas/" + pasta + "' alt='' imagensdotema='" + pasta + "' src='./img/temaspoema/" + pasta + ".png' '/>" +
                                "<figcaption> " + pasta + " </figcaption>" +
                                "</figure>";
                    }
                }
                htmlModel += "</div></div></div></div>";
                $("body").append(htmlModel);
                break;
            case "showperfil":
                //Teste para Perfil do utilizador
                var htmlModel = "<div id='divchangemodel'>" +
                        "<div><div><input class='btn-primary btn-round' id='btncancelmodels' type='button' value='Cancel'></div><div><div>" +
                        "<h1 class='text-center'>Bem-vindo ao teu Perfil," + username + "</h1>";
                for (var i = 0, max = data.length; i < max; i++) {
                    //se o nome retornado nao contem "." desduz-se que Ã© uma pasta
                    if (data[i].indexOf(".") == -1) {
                        var pasta = data[i];
                        htmlModel += "<figure class='image'>" +
                                "<img class='tema-img' data-folder='showperfil/" + pasta + "' src='./img/showperfil/" + pasta + ".png' '/>" +
                                "<figcaption> " + pasta + " </figcaption>" +
                                "</figure>";
                    }
                }
                htmlModel += "</div></div></div></div>";
                $("body").append(htmlModel);
                break;
            default:
                if (typeof dataVals.imagensdotema != "undefined" && dataVals.imagensdotema != null) {
                    //Verifica se existem imagens do tema
                    if (data.length > 0) {
                        $("body").find("#divchangemodel").remove();
                        var htmlModel = "<div id='divchangemodel'>" +
                                "<div><div><input id='btncancelmodels' type='button' value='Cancel'></div><div><div>" +
                                "<h1 style='text-center'>Imagens do tema - " + dataVals.imagensdotema + "</h1>";
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlModel += "<figure class='image'>" +
                                    "<img class='imgPoema' data-folder='./temaspoemas/" + dataVals.imagensdotema + "' alt='' src='./temaspoemas/" + dataVals.imagensdotema + "/" + data[i] + "'/>" +
                                    "<figcaption> " + data[i].split(".")[0] + " </figcaption>" +
                                    "</figure>";
                        }
                        htmlModel += "</div></div></div></div>";
                        $("body").append(htmlModel);
                    } else
                        alert("NÃ£o existem imagens do tema " + dataVals.imagensdotema);
                }
                break;
        }
    });

/**
 * evento que coloca uma pagina num determiado local
 */
    $("body").on("click", ".carregarLayout", function () {
        if (currentPosition != backArray.length) {
            backArray.splice(currentPosition, backArray.length - currentPosition);
            folderArray.splice(currentPosition, folderArray.length - currentPosition);
        }

        backArray.push($(this).data("layout"));
        folderArray.push($(this).data("folder"));

        currentPosition += 1;
        //console.log(backArray + " " + currentPosition);
        addLayoutToDiv("#contentor", $(this).data("folder"), $(this).data("layout"), socket);
    });

    $("body").on("click", ".voltarLayout", function () {
        if (currentPosition - 1 >= 1) {
            currentPosition -= 1;
            var aux = backArray[currentPosition - 1];
            if (aux == "home") {
                $('#bt_PDF, #bt_PRE, #bt_HTML, #bt_guardar').css({
                    'visibility': "hidden"
                });
                LivroPoemas = new Array();
                carregarPaginasLogin(listapages);

            } else if (aux != "home" && aux != "") {
                addLayoutToDiv("#contentor", folderArray[currentPosition - 1], aux, socket);
            }
//            console.log(backArray + " " + currentPosition);
        }
    });

    //Mostrar os temas disponÃ­veis para o poema
    $("body").on("click", 'a[href="#add-poema"]', function () {
        var data = {
            folder: "temaspoemas",
            idtab: "",
            idObj: ""
        };
        getFilesToFolder(socket, data);
    });

    //adicionar palavra 'a ajuda do poema
    $("body").on('click', "div.help.col-xs-4.col-sm-4.col-md-4.altura-poema > h3 > span", function () {
        var idpage = $(this).parent().parent().parent().attr('id');
        var text = prompt("Adicione um palavra de ajuda para este poema", "");
        if (text.length > 0) {
            LivroPoemas[idpage.substring(4)].getAjuda()[LivroPoemas[idpage.substring(4)].getAjuda().length] = text;
            $(this).before('<span class="label label-info" style="float:left; margin: 3px;">' + text + '</span>');
        }
    });


    //Mostrar perfil do Utilizador
    $("body").on("click", 'a[href="#show-perfil"]', function () {
        //        var data = {
        //            folder: "showperfil",
        //            idtab: "",
        //            idObj: ""
        //        };
        //        getFilesToFolder(socket, data);
    });
    
    //Mostrar os imagens disponÃ­veis para o tema
    $("body").on("click", '.tema-img', function () {
        var self = this;
        var data = {
            folder: $(self).attr("data-folder"),
            imagensdotema: $(self).attr("imagensdotema"),
            idObj: ""
        };
        getFilesToFolder(socket, data);
    });

    //Adiciona a tab do poema
    $("body").on("click", '.imgPoema', function () {
        /**folder: $(self).attr("data-folder"),
         imagensdotema: $(self).attr("imagensdotema"),
         idObj: "",**/
        AddPoema(LivroPoemas, $(this).attr("src"));
        $("body").find("#divchangemodel").remove();
        $("body").find("a[href^='#page']:last").click();
    });

/**
 * eventos das formatacoes para o modelo de livro
 */
    $("body").on("click", ".dropdown-menu li a", function () {
        switch ($(this).data("type")) {
            case "font-family":
                $("body").find(".textResultado").css({
                    "font-family": $(this).data("value")
                }).children(".font").html("Tipo de Letra - " + $(this).text());
                break;
            case "font-size":
                $("body").find(".textResultado").css({
                    "font-size": $(this).data("value")
                }).children(".size").html("Tamanho - " + $(this).text() + "px");
                break;
            case "text-align":
                $("body").find(".textResultado").css({
                    "text-align": $(this).data("value")
                }).children(".alin").html("Alinhamento - " + $(this).text());
                break;
            case "color":
                $("body").find(".textResultado").css({
                    "color": $(this).data("value")
                }).children(".cor").html("Cor da Letra - " + $(this).text());
                break;
            case "background-color":
                $("body").find(".textResultado").css({
                    "background-color": $(this).data("value")
                }).children(".corback").html("Cor do fundo - " + $(this).text());
                break;
            default:
                break;
        }
    });

    $("body").on("click", ".adicionarEntity", function () {
        validacaoFormAll();
        var id = $(this).attr("id");
        $("body").append(wait);
        var htmlModel = "";
        var newSrc = "../img/";
        var newHeader = "";
        switch (id) {
            case "adicionarAluno":
                newHeader = "Adicionar Novo Aluno";
                newSrc = newSrc + "userAluno.png";
                htmlModel = "";
                $("body").find("#form-professor").css("display", "none");
                $("body").find("#form-escola").css("display", "none");
                $("body").find("#form-agrupamento").css("display", "none");

                $.ajax({
                    type: "GET",
                    url: "/getAllEscolas",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar = "";
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlVar += "<option value=" + data[i].id + ">" + data[i].nome + "</option>";
                        }
                        $("body").find("#loading").remove();
                        $("body").find("#escola_aluno_add").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;
            case "adicionarProfessor":
                newHeader = "Adicionar Novo Professor";
                newSrc = newSrc + "userProf.png";
                $("body").find("#form-aluno").css("display", "none");
                $("body").find("#form-escola").css("display", "none");
                $("body").find("#form-agrupamento").css("display", "none");
                $.ajax({
                    type: "GET",
                    url: "/getsAllAgrupamentos",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar = "";
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlVar += "<option value=" + data[i].id + ">" + data[i].nome + "</option>";
                        }
                        $("body").find("#loading").remove();
                        $("body").find("#Agrupamento_Professor_add").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;
            case "adicionarEscola":
                newHeader = "Adicionar Nova Escola";
                newSrc = newSrc + "userEscola.png";
                $("body").find("#form-aluno").css("display", "none");
                $("body").find("#form-professor").css("display", "none");
                $("body").find("#form-agrupamento").css("display", "none");
                $.ajax({
                    type: "GET",
                    url: "/getsAllAgrupamentos",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar = "";
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlVar += "<option value=" + data[i].id + ">" + data[i].nome + "</option>";
                        }
                        $("body").find("#loading").remove();
                        $("body").find("#Agrupamento_Escola_add").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;
            case "adicionarAgrupamento":
                newHeader = "Adicionar Novo Agrupamento";
                newSrc = newSrc + "userAgrupamento.png";
                $("body").find("#form-aluno").css("display", "none");
                $("body").find("#form-professor").css("display", "none");
                $("body").find("#form-escola").css("display", "none");

                break;
            default:
                break;
        }

        $("body").find("#add-Entity-Header").append(newHeader);
        $("body").find("#add-Entity-Image").attr("src", newSrc);
        $("body").find("#div-Adicionar-Entity").append(htmlModel);
        $("body").find("#loading").remove();

    });

/**
 * seletor para selecionar a capa e a pagina seguinte para a criacao do projeto
 */
    $("body").on("click", ".selectModelo", function () {
        if (($("form input[type='radio']:checked").val()).toUpperCase() == "capa".toUpperCase()) {
            $("body").find("#ModeloSelectCapa").attr("src", $(this).attr("src"));
            $("body").find("#ModeloSelectCapa").attr("data-model", $(this).data("model"));
            $("body").find("#ModeloSelectCapa").attr("data-idmodel", $(this).data("idmodel"));
        } else {
            $("body").find("#ModeloSelectPagina").attr("src", $(this).attr("src"));
            $("body").find("#ModeloSelectPagina").attr("data-model", $(this).data("model"));
            $("body").find("#ModeloSelectPagina").attr("data-idmodel", $(this).data("idmodel"));
        }
    });

/**
 * guarda o projeto na base de dados
 */
    $("body").on("click", "#guardarModeloLivro", function () {
        var nomeProj = $("body").find("#nomeProjeto").val();
        var modelProjC = $("body").find("#ModeloSelectCapa").attr("data-idmodel");
        var modelProjP = $("body").find("#ModeloSelectPagina").attr("data-idmodel");
        if (nomeProj.trim() == "") {
            alert("Introduza um nome para o Projeto.");
            return;
        }
        if (typeof modelProjC == "undefined" || typeof modelProjP == "undefined") {
            alert("Selecione um modelo para a capa ou para as paginas do livro.");
            return;
        }
        var textAjuda = $("body").find("#textAjudaLivro").html();
        var fontName = $("body").find(".textResultado").css("font-family");
        fontName = fontName.replace("'", '');
        fontName = fontName.replace("'", '');
        var formatText = "font-family:" + fontName + ";" +
                "font-size:" + $("body").find(".textResultado").css("font-size") + ";" +
                "text-align:" + $("body").find(".textResultado").css("text-align") + ";" +
                "color:" + $("body").find(".textResultado").css("color") + ";" +
                "background-color:" + $("body").find(".textResultado").css("background-color");
        ;
        $("body").append(wait);
        $.ajax({
            type: "POST",
            url: "/saveModelLivro",
            data: {
                nomeProjeto: nomeProj,
                numModeloC: modelProjC,
                numModeloP: modelProjP,
                textHtml: textAjuda,
                stylesLivro: formatText
            },
            dataType: 'json',
            success: function (data) {
                if (data == "Ok") {
                    $("body").find("#loading").remove();
                    alert("Livro Criado Com Sucesso!");
                    addLayoutToDiv("#contentor", "Menu_Navegacao", "CriarLivro.html", null);
                } else {
                    alert("O nome do livro já existe na base da dados.");
                    $("body").find("#loading").remove();
                }
            },
            error: function (error) {
                $("body").find("#loading").remove();
                //                alert("Erro ao tentar carregar os Modelos para s paginas.\nTente Novamente.")
                console.log(JSON.stringify(error));
            }
        });

    });

/**
 * consulta a base de daos para receber os projetos em qque o utilizador 
 * esta iserido
 */
    $("body").on("click", "#contentor > div > div[data-layout='MenuMeusProjectosAbertos.html']", function () {
        //GET getProjParticipaByID

        $.ajax({
            type: "GET",
            url: "/getProjParticipaByID/" + userNumber,
            dataType: 'json',
            success: function (data) {
                for (var proj in data) {
                    var htmlLine = "<tr class='active'>" +
                            '<td><a href="#AbrirProj" data-idProj=' + data[proj].id + ' data-folder="html_Work_Models" data-layout="Livro.html">' + data[proj].nome + '</a></td>' +
                            '<td>' + data[proj].tipo + '</td>' +
                            '</tr>';
                    //faz o append do html gerado
                    $("body").find("#meusProjAbertosTable").append(htmlLine);
                }
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    });


    // carregar lista de alunos
    $("body").on("click", "#contentor > div > div[data-layout='MenuCriarProjectos.html']", function () {
        tmpModels = [];
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getAllAluno",
            dataType: 'json',
            success: function (data) {
                $("body").find("#loading").remove();
                //insere todos os alunos no html!!!!
                var htmlLine = "";
                for (var aluno in data) {
                    //para cada aluno, carrega a informaÃ§Ã£o
                    htmlLine = "<option value=" + data[aluno].id_user + ">" + data[aluno].nome + "</option>";
                    //faz o append do html gerado
                    $("#alluseralunos:first").append(htmlLine);
                }
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar lista de alunos.");
                console.log(JSON.stringify(error));
            }
        });

        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getAllProfessor",
            dataType: 'json',
            success: function (data) {
                $("body").find("#loading").remove();
                //insere todos os professores no html!!!!
                var htmlLine = "";
                for (var prof in data) {
                    //para cada professor, carrega a informaÃ§Ã£o
                    htmlLine = "<option value=" + data[prof].id_user + ">" + data[prof].nome + "</option>";
                    //faz o append do html gerado
                    $("#alluserProfessores:first").append(htmlLine);
                }
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar lista de professores.");
                console.log(JSON.stringify(error));
            }
        });

        //Carregar os modelos dos projetos para array
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getModelsPage",
            dataType: 'json',
            success: function (data) {
                for (var i = 0, max = data.length; i < max; i++) {
                    tmpModels[data[i].id] = (data[i].icon == null ? "./img/" + data[i].nome + ".png" : data[i].icon);
                }
                $("body").find("#loading").remove();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar os Modelos para as paginas.\nTente Novamente.");
                console.log(JSON.stringify(error));
            }
        });


        //Carregar os modelos dos projetos para a interface
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getModelsProject",
            dataType: 'json',
            success: function (data) {
                var html = "";
                for (var i = 0, max = data.length; i < max; i++) {
                    html += "<tr data-select='false' data-idmodel='" + data[i].idmodelo + "' data-modelCapa='" + data[i].num_modeloCapa + "' data-modelPagina='" + data[i].num_modeloPagina + "'>" +
                            "<td class='bs-checkbox'><input name='radioName' type='radio'></td>" +
                            "<td style='text-align: center;'>" + data[i].nome_livro + "</td>" +
                            "<td style='text-align: right;'><img class='btnmodels-style img-responsive' alt='' src='" + tmpModels[data[i].num_modeloCapa] +
                            "'/></td>" +
                            "<td style='text-align: right;'><img class='btnmodels-style img-responsive' alt='' src='" + tmpModels[data[i].num_modeloPagina] +
                            "'/></td>" +
                            "</tr>";
                }
                $("body").find("#SelectPageStyle > table").append(html);
                $("body").find("#loading").remove();

            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar os Modelos para as paginas.\nTente Novamente.")
                console.log(JSON.stringify(error));
            }
        });
    });


    //muda o data-select do element escolhido da tabela
    $("body").on("click", "#SelectPageStyle > table > tbody > tr > td.bs-checkbox > input[type='radio']", function () {
        $("#SelectPageStyle > table > tbody > tr").each(function (index, element) {
            $(element).get(0)["attributes"][0]["value"] = "false";
        });

        $($(this).parent().parent()).get(0)["attributes"][0]["value"] = "true";
    });

    // selecionar user para participar no projeto
    $("body").on("click", "#addButtonAluno", function () {
        $("#addedAlunos").append($("#alluseralunos option:selected").get(0));
        $("#alluseralunos option:selected").remove();
    });


    // (des)selecionar user para participar no projeto
    $("body").on("click", "#removeButtonAluno", function () {
        var valor = $("#addedAlunos > option:selected").prop("value");
        if (typeof valor !== "undefined") {
            $("#alluseralunos").append("<option value=" + valor + ">" + $("#addedAlunos > option:selected").text() + "</option>");
            $("body").find("#addedAlunos > option:selected").remove();
        }

    });
    
    $("body").on("click", "#addButtonProf", function () {
        $("#addedProfessores").append($("#alluserProfessores option:selected").get(0));
        $("#alluserProfessores option:selected").remove(); //css("display", "none");
    });

    // (des)selecionar user para participar no projeto
    $("body").on("click", "#removeButtonProf", function () {
        var valor = $("#addedProfessores option:selected").prop("value");
        if (typeof valor !== "undefined") {
            $("#alluserProfessores").append("<option value=" + valor + ">" + $("#addedProfessores > option:selected").text() + "</option>");
            $("body").find("#addedProfessores > option:selected").remove();
        }

    });

    // Avancar no projeto 
    $("body").on("click", "#btProjAvancar", function () {

        //Nome do projeto
        var nomeProj = $("#nomeProj").val();

        //verificar o nome do projeto
        if (nomeProj.trim() == "") {
            $("#nomeProj").focus();
            alert("Nome do Projeto Inválido");
            return;
        }

        $("#contentor").attr("NomeProj", nomeProj);

        //array com os utilizadores do projeto
        var usersid = [];
        $("#addedAlunos > option").each(function () {
            usersid.push($(this).prop("value"));
        });

        $("#addedProfessores > option").each(function () {
            usersid.push($(this).prop("value"));
        });

        //verificar se foram selecionados alunos para participar no projeto
        if (usersid.length == 0) {
            alert("Escolha Utilizadores para participar no projeto");
            return;
        }
        $("#contentor").attr("projuser", usersid);

        //id modelo utilizado
        var idmodel = $("#SelectPageStyle > table > tbody > tr[data-select='true']").attr("data-idmodel");

        if (typeof idmodel == "undefined") {
            alert("Escolha um modelo de projeto");
            return;
        }

        $("#contentor").attr("idmodel", idmodel);

        $("#contentor").attr("tipoproj", $(".TipoProj > .active > input").val());

        var numCapa = $("#SelectPageStyle > table > tbody > tr[data-select='true']").attr("data-modelcapa");
        var numPagina = $("#SelectPageStyle > table > tbody > tr[data-select='true']").attr("data-modelpagina");
//        console.log("Nome do novo Projeto:" + nomeProj + "\n id users:" + users + "\n ID do modelo:" + idmodel + "\nCapa:" + numCapa + "\t Pagina:" + numPagina);

        //Limpar hash local e do server
        hash = {};

        addLayoutToDiv("#contentor", "html_Work_Models", "Livro.html", null);

        var idNum = (Object.keys(hash).length + 1);
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getCodTwoModels/" + numCapa + "/" + numPagina + "/" + idmodel,
            async: true,
            dataType: 'json',
            success: function (data) {
                $("body").find("#loading").remove();
                //Reduzir tamanho da div das tabs
                $("#contentor > div.col-lg-12").removeClass("col-lg-12");
                $("#contentor > div").addClass("col-xs-8 col-sm-8 col-md-8");
                //Adicionar a div com o texto de ajuda		
                $("#contentor").append("<div class='containerTxtAjuda col-xs-4 col-sm-4 col-md-4'>" +
                        "<h2 class='text-center tabspace'>Texto de Ajuda</h1>" +
                        "<div id='divTxtAjuda'  contenteditable='true'></div>" +
                        "<a href='#' id='btGuardarProjeto' class='btn btn-lg btn-primary pull-right'>Guardar Projeto  <span class='glyphicon glyphicon glyphicon-saved'></span></a></div>");

                $(".containerTxtAjuda").animate({
                    opacity: 1,
                }, 1000, function () {
                    // Animation complete.
                });
                $("#divTxtAjuda").focus();

                for (var i in data) {
                    if (data[i].id == numCapa) {
                        Addtab(numCapa, idNum);
                        $(".txtTab" + idNum).html(data[i].htmltext);
                        refactorTab(numCapa, idNum, data[0].texto);
                        addtohash(idNum);

                    } else if (data[i].id == numPagina) {
                        idNum = (Object.keys(hash).length + 1);
                        Addtab(numPagina, idNum);
                        $(".txtTab" + idNum).html(data[i].htmltext);
                        refactorTab(numPagina, idNum, data[0].texto);
                        addtohash(idNum);
                    }
                }
                $("#contentor").attr("tab", idmodel);
                $("body").find("a[href^='#page']:last").click();

// remocao do botao de adicionar mais tabs
                if (backArray[backArray.length - 1] == "MenuCriarProjectos.html") {
                    $("body").find("#li-last").remove();
                }
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar o modelo selecionado.\n\Tente novamente.");
                console.log(JSON.stringify(error));
            }
        });
    });

/**
 * Guarda o projetp na base de dados
 */
    $("body").on("click", "#btGuardarProjeto", function () {

        $("body").append(wait);
        var nomeP = $("#contentor").attr("NomeProj");
        var usersP = $("#contentor").attr("projuser").split(",");
        var idmodel = $("#contentor").attr("idmodel");
        var idTmp = userNumber;
        var textHelp = $("#divTxtAjuda").text();
        var typeP = $("#contentor").attr("tipoproj");
        var hashtoSave = hash;

        for (var item in hashtoSave) {
            for (var elem in hashtoSave[item].modelo.arrayElem) {
                if (hashtoSave[item].modelo.arrayElem[elem].conteudo != "") {
                    var conteudo = hashtoSave[item].modelo.arrayElem[elem].conteudo;
                    var newchar = '\\"';
                    conteudo = conteudo.split('"').join(newchar);
                    newchar = '\\/';
                    conteudo = conteudo.split('/').join(newchar);
                    hashtoSave[item].modelo.arrayElem[elem].conteudo = conteudo;
                }
            }
        }
        hashtoSave = JSON.stringify(hashtoSave);
        $.ajax({
            type: "POST",
            url: "/saveProjLivro",
            data: {
                nomeProjeto: nomeP,
                idCreator: idTmp,
                text: textHelp,
                tipo: typeP,
                idmodel: idmodel,
                array: hashtoSave,
                texto: textHelp,
                users: usersP
            },
            dataType: 'json',
            success: function (data) {
                if (data.indexOf("Ok") > -1) {
                    $("body").find("#loading").remove();
                    alert("Projeto Gravado");
                    $("#homemenu").click();
//                    console.log("id proj: " + data.toString().split("Ok")[1]);
                } else {
                    $("body").find("#loading").remove();
                    alert("O nome do livro já existe na base da dados.");
                }
            },
            error: function (error) {
                $("body").find("#loading").remove();
                console.log(JSON.stringify(error));
            }
        });
    });
    
    /**
     * Funcoes de logout -----------------------------------------------------------------------------------------------
     */
    /**
     * recebe o evento do socket com o socket id do cliente que se desligou
     */

    socket.on('diconnected', function (socketid) {
        for (var item in users) {
            if (users[item].getSocketId() == socketid) {
                var numid = users[item].getdivid();
                toastr.warning(users[item].getUsername(), 'Offline');
                users.splice(users[item], 1);
                $("." + numid).remove();
            }
        }
    });    
    /*
     * Fim Funcoes de logout -----------------------------------------------------------------------------------------------
     */
});
$(window).resize(function () {
    ajustElements();
});
/*
 * FunÃ§Ãµes relacionas com as Tabs e modelos --------------------------------------------------------------------------------
 */

// Code taken from MatthewCrumley (http://stackoverflow.com/a/934925/298479)
/**
 *
 recebe uma imagem e devolve o base64 da imagem
 * @param {type} img
 * @returns {unresolved} */
function getBase64Image(img) {
    var img2 = document.createElement("img");
    img2.src = img;
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img2.width;
    canvas.height = img2.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img2, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to guess the
    // original format, but be aware the using "image/jpg" will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");
    return dataURL;
}

/**
 * Carrega as paginas do utilizador
 * @param {type} vals paginas do utilizador
 * @returns {undefined}
 */
function carregarPaginasLogin(vals) {
    var allPages = '<div class="col-xs-12 col-sm-12 col-md-12">';
    for (var i = 0, max = vals.length; i < max; i++) {
        allPages += '<div class="col-xs-4 col-sm-4 col-md-4  carregarLayout" data-folder="Menu_Navegacao" data-layout="' + vals[i] + '">';
        allPages += '<figure class="image">';
        allPages += '<img src="./img/' + vals[i].split(".")[0] + '.png" alt="">';
        allPages += '<figcaption> ' + vals[i].split(".")[0] + ' </figcaption></figure></div>';
    }
    allPages += '</div>';
    $("#contentor").html(allPages);
}


function toObject(arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
        if (arr[i] != undefined)
            rv[i] = arr[i];
    return rv;
}

/**
 *
 
 * @param {type} tabToCast
 * @returns {Object|castTab.tab} */
function castTab(tabToCast) {
    //tabToCast = toObject(tabToCast);
    //tabToCast = tabToCast[".txtTab1"];
    //Faz o cast da Tab, e todos os seus elementos
    //tabToCast = tabToCast[;

    var tab = $.extend(new Tab(), tabToCast);
    //    console.log(tabToCast.numModelo);
    tab.modelo = $.extend(new Modelo(), tabToCast.modelo);
    for (var item in tabToCast.modelo.arrayElem) {
        tab.modelo.arrayElem[item] = $.extend(new Element(), tabToCast.modelo.arrayElem[item]);
        if (tab.modelo.arrayElem[item].elementType == "CANVAS") {
            tab.modelo.arrayElem[item].drawObj = $.extend(new Draw(), tabToCast.modelo.arrayElem[item].drawObj);
        } else if (typeof tabToCast.modelo.arrayElem[item].editor != "undefined") {
            //console.log(socket);
            //tabToCast.modelo.arrayElem[item].socket = socket;
            tab.modelo.arrayElem[item].editor = $.extend(new TextEditor(), tabToCast.modelo.arrayElem[item].editor);
            tab.modelo.arrayElem[item].editor.styles(tab.styles);
        }
    }
    return tab;
}

/**
 *faz o pedido ao servidor dos lificheiros existentes dentro de uma pasta
 
 * @param {type} sckt
 * @param {type} data
 * @returns {undefined} */
function getFilesToFolder(sckt, data) {
//    console.log("inside getfilestofolder funtion");
    sckt.emit("getFiles2Folder", data);
}

/**
 * Poe o modelo no Html so e executado quando recebe alguma coisa de outro cliente
 
 * @param {type} i
 * @param {type} key
 * @returns {undefined} */
function updateTab(i, key, creator) {
    $.ajax({
        type: "GET",
        url: "/getCodModel/" + hash[key].numModelo,
        dataType: 'json',
        success: function (data) {
            $(".txtTab" + i).append(data[0].htmltext);
            refactorTab(hash[key].numModelo, i);
            for (var elemento in hash[key].modelo.arrayElem) {
                if (hash[key].modelo.arrayElem[elemento].elementType == "IMG") {
                    $("body").find("#" + hash[key].modelo.arrayElem[elemento].id).attr('src', hash[key].modelo.arrayElem[elemento].conteudo);

                } else if (hash[key].modelo.arrayElem[elemento].elementType == "CANVAS") {
                    //cria o seu canvas!
                    hash[key].modelo.arrayElem[elemento].drawObj.init();

                    //se o array nao estiver vazio (se nao tiver clientes canvas)
                    if (hash[key].modelo.arrayElem[elemento].drawObj.ArrayCanvasImage != []) {
                        for (var item in hash[key].modelo.arrayElem[elemento].drawObj.ArrayCanvasImage) {
                            //cria as canvas dos outros clientes
                            hash[key].modelo.arrayElem[elemento].drawObj.VerificaUser(item);
                            var dr = $("#" + elemento + "" + item)[0];
                            //cria imagem
                            var img = document.createElement('img');
                            img.src = hash[key].modelo.arrayElem[elemento].drawObj.ArrayCanvasImage[item];
                            //vai buscar o context
                            var ctx = dr.getContext('2d');
                            //pinta a imagem
                            ctx.drawImage(img, 0, 0);
                        }
                        //se tiver backgorund desenha o
                        if (hash[key].modelo.arrayElem[elemento].drawObj.bgImg != "") {
                            var imgg = hash[key].modelo.arrayElem[elemento].drawObj.bgImg;
                            hash[key].modelo.arrayElem[elemento].drawObj.imageCanvas(imgg);
                        }
                    }
                } else {
                    //                    console.log("update Editable");
                    if (typeof $("#" + elemento).attr('class') != "undefined") {
                        if ($("#" + elemento).attr('class').indexOf('editable') != -1) {
                            $("#" + elemento).addClass(elemento);
                            var txtedit = new TextEditor(elemento, username, userColor, (creator == null ? hash[key].modelo.arrayElem[elemento].editor.creator : creator), userNumber);
                            txtedit.styles(hash[key].styles);
                            hash[key].modelo.arrayElem[elemento].editor = txtedit;
                            //                        console.log(hash[key].modelo.arrayElem[elemento]);
                            txtedit.setTextToEditor(hash[key].modelo.arrayElem[elemento].conteudo);
                        }
                    }
                    $("#" + hash[key].modelo.arrayElem[elemento].id).val(hash[key].modelo.arrayElem[elemento].conteudo);
                }
            }
        },
        error: function (error) {
            console.log(JSON.stringify(error));
        }
    });
}


/**
 *  Adiciona a tab ao Html
 * @param {type} html
 * @param {type} idNum
 * @returns {undefined} */
function Addtab(html, idNum) {
    //console.log(html);
    //console.log(idNum);
    //var idNum = (Object.keys(hash).length + 1);
    // Adiciona um separador antes do ÃƒÂºltimo (linha <li></li> antes do last-child)
    //    console.log($('#tabs li:last-child').attr('id'));
    $('ul#tabs li:last-child').before(
            '<li id="li' +
            (idNum) +
            '"><a href="#page' +
            (idNum) +
            '" role="tab" data-toggle="tab">Página ' +
            (idNum) +
//            ' <button type="button" id=' +
//            (idNum) +
//            ' class="btn btn-warning btn-xs xtab"><span>x</span></button>' +
            '</a>');
    // Adiciona a pÃƒÂ¡gina depois da ÃƒÂºltima pÃƒÂ¡gina (<div></div> markup after the last-child of the <div class="tab-content">)
    $('div.tab-content').append(
            '<div class="tab-pane fade" id="page' + idNum +
            '"><div class="txtTab txtTab' + idNum + '"></div>' +
            '</div>');
}

/**
 * FunÃ§Ã£o que carrega o modelo para a tab e altera os id's de toda a tab
 * para id's relacionados com o numero da tab
 
 * @param {type} html   pagina html a ser carregada
 * @param {type} idNum  numeor da tab para alterar os id's da tab
 * @param {type} estilos Lista com os estilos aserem aplicasdos no texteditor
 * * @returns {undefined} */

function refactorTab(html, idNum, estilos) {

    //depois de carregar o html, vai buscar o numero de filhos q a div tem
    var numElements = $(".txtTab" + (idNum)).children('div').children().length;
    //cria tab no array
    tabTest = new Tab(".txtTab" + (idNum), numElements, html);
    if (typeof estilos !== "undefined") {
        tabTest.styles = estilos;
    }
    var i = 0;
    $(".txtTab" + idNum).children('div').attr("id", "tab" + idNum + "-" + $(".txtTab" + idNum).children('div').attr('id'));
    $(".txtTab" + idNum).children('div').children().each(function () {
        $(this).attr("id", "tab" + idNum + "-" + this.id);
        i++;
    });
    $(".txtTab" + idNum).css({
        height: $("#contentor").height() * 0.82
    });
}

/**
 * Adiciona o a tab ao hash
 *
 * @param {type} idNum
 * @returns {undefined} */
function addtohash(idNum) {

    $(".txtTab" + idNum).children('div').children().each(function () {

        //vai buscar id atribuido
        var thID = $(this).attr("id");
        var thType = $(this).prop("tagName");
        var tabNumber = thID.match(/\d+/)[0];
        var newElementID = "tab" + tabNumber + "-Mycanvas";
        if (typeof hash[".txtTab1"] != "undefined") {
            tabTest.styles = hash[".txtTab1"].styles;
        }
        if ($(this).attr("id").match("tab" + tabNumber + "-canvasdr")) {

            tabTest.modelo.arrayElem[newElementID] = new Element(newElementID, "CANVAS");
            tabTest.modelo.arrayElem[newElementID].createCanvasObj(".txtTab" + idNum, "#tab" + idNum + "-tabpage", this.id);
            tabTest.modelo.arrayElem[newElementID].drawObj.init();

        } else if ($(this).attr("class").match("editable")) {
            tabTest.modelo.arrayElem[thID] = new Element(thID, thType);
            var txtedit = new TextEditor($(this).attr("id"), username, userColor, userNumber, userNumber);
            $(this).addClass(thID);
            tabTest.modelo.arrayElem[thID].editor = txtedit;
            tabTest.modelo.arrayElem[thID].editor.styles(tabTest.styles);

        } else {
            tabTest.modelo.arrayElem[thID] = new Element(thID, thType);
        }

    });
    hash[tabTest.id] = tabTest;
    hash[tabTest.id].projtipo = hash[".txtTab1"].projtipo;
    hash[tabTest.id].styles = hash[".txtTab1"].styles;
}

/**
 * Remove a tab correspondente ao <li>
 
 * @param {type} liElem
 * @returns {undefined} */
function removeTab(liElem) {

    $('ul#tabs > li#li' + liElem).fadeOut(1000, function () {
        // Apaga o <li></li>(separador) com um efeito fadeout
        $(this).remove();
    });
    // Tambem apaga o <div>(pagina) correta dentro de <div class="tab-content">
    $('div.tab-content div#page' + liElem).remove();
    var i = 1;
    //para renomear Li
    $('#tabs').children('li').each(function () {

        if ($(this).attr('id') != "li-last" && $(this).attr('id') != $('ul#tabs > li#li' + liElem).attr('id')) {
            $(this).attr('id', "li" + i);
            $(this).children('a').attr('href', "#page" + i);
            var button = $(this).children('a').children();
            $(this).children('a').text('Pagina ' + i + " ").append(button);
            $(this).children('a').children('button').attr('id', i);
            i++;
        }
    });
    //para renomear o conteudo
    var i = 0;
    $('.tab-content').children('div').each(function () {
        if ($(this).attr('id') != $('div.tab-content div#page' + liElem)) {
            $(this).attr('id', "page" + (i + 1));
            var classs = $(this).children('div').attr('class').replace(/[0-9]/, (i + 1));
            $(this).children('div').attr('class', classs);
            $(this).children('div').children().find('*').each(function () {
                //muda o id
                if (typeof $(this).attr('id') != "undefined") {
                    var id = $(this).attr('id').replace(/[0-9]/, (i + 1));
                    //coloca outro id
                    $(this).attr('id', id);
                }
            });
            $(this).children('textarea').attr('id', "msg" + (i + 1));
            i++;
        }
    });
    // activa a tab anterior no caso de a actual ser eliminada
    if (liElem > 1 && $("#li" + liElem).attr('class') == "active") {
        $("body").find("a[href='#page" + (liElem - 1) + "']:last").click();
    }
    refactorHash(liElem);
}

/**
 * FunÃ§Ã£o para reorganizar o hash
 
 * @param {type} liElem
 * @returns {undefined} */
function refactorHash(liElem) {
    //elimina do hash
    delete hash[".txtTab" + liElem];
    var id = liElem;
    //refactor array
    var i = 0;
    //cria array auxiliar
    var hash1 = {};
    //percorre todas as keys do array
    for (var key in hash) {
        var newId = key.replace(/[0-9]/, (i + 1));
        hash1[newId] = hash[key];
        hash1[newId].id = newId;
        for (var elemento in hash[key].modelo.arrayElem) {
            var idd = elemento.replace(/[0-9]/, (i + 1));
            hash1[newId].modelo.arrayElem[idd] = hash[key].modelo.arrayElem[elemento];
            hash1[newId].modelo.arrayElem[idd].id = hash[key].modelo.arrayElem[elemento].id.replace(/[0-9]/, (i + 1));
            hash1[newId].modelo.arrayElem[idd].conteudo = hash[key].modelo.arrayElem[elemento].conteudo;
            if (hash[key].modelo.arrayElem[elemento].elementType == "CANVAS") {
                hash1[newId].modelo.arrayElem[idd].drawObj.tabClass = hash[key].modelo.arrayElem[elemento].drawObj.tabClass.replace(/[0-9]/, (i + 1));
                hash1[newId].modelo.arrayElem[idd].drawObj.page = hash[key].modelo.arrayElem[elemento].drawObj.page.replace(/[0-9]/, (i + 1));
                hash1[newId].modelo.arrayElem[idd].drawObj.id = hash[key].modelo.arrayElem[elemento].drawObj.id.replace(/[0-9]/, (i + 1));
            }
            if ((i + 1) >= id) {
                delete hash1[newId].modelo.arrayElem[elemento];
            }
        }
        i++;
    }
    hash = hash1;
}

/**
 * FunÃ§Ã£o que recebe um array a uma chave e devolve o objeto dessa posiÃ§Ã£o se
 * existir e nÃ£o nulkl
 
 * @param {type} array  array para a pesquisa
 * @param {type} id     valor a ser encontrado
 * @returns {value} */
function getArrayElementObj(array, id) {
    var a = null;
    $.each(array, function (index, value) {
        if (value.id == id) {
            a = value;
        }
    });
    return a;
}

/**
 *
 
 * @param {type} local
 * @param {type} folder
 * @param {type} layout
 * @param {type} stk
 * @returns {undefined} */
function addLayoutToDiv(local, folder, layout, stk) {
    var kk = Object.keys(hash);
    $(local).load("./" + folder + "/" + layout, function () {
        switch (layout) {
            /**
             * Livro com as tabes 
             */
            case "Livro.html":
                if (stk != null) {
                    stk.emit("getAllTabs", {
                        Pid: hash[kk[0]].projID
                    });
                }
                if (typeof hash[kk[0]] != "undefined") {
                    $.ajax({
                        type: "GET",
                        url: "/getProjectsbyID/" + hash[kk[0]].projID,
                        async: true,
                        dataType: 'json',
                        success: function (data) {
                            if (data[0].tipo == "Livro" || data[0].tipo == "Poema") {
                                if (data[0].texto.trim().length  > 0) {
                                    
                                //Reduzir tamanho da div das tabs
                                $("#contentor > div.col-lg-12").removeClass("col-lg-12");
                                $("#contentor > div").addClass("col-xs-8 col-sm-8 col-md-8");

                                var tmpAjuda = "<div class='containerTxtAjuda col-xs-4 col-sm-4 col-md-4'>" +
                                        "<h2 class='text-center tabspace'>Texto de Ajuda</h1>" +
                                        "<div id='divTxtAjuda'>";
                                //Adicionar a div com o texto de ajuda		

                                var tmpText = data[0].texto;
                                if (data[0].tipo == "Poema") {
                                    tmpText = tmpText.split(" ");
                                    for (var i = 0, max = tmpText.length; i < max; i++) {
                                        tmpAjuda += '<h3><span class="label label-info" style="float:left; margin: 3px;">' + tmpText[i] + '</span></h3>';
                                    }
                                } else {
                                    tmpAjuda += data[0].texto;
                                }
                                tmpAjuda += "</div>" + "</div>";
                                $("#contentor").append(tmpAjuda);


                                $(".containerTxtAjuda").animate({
                                    opacity: 1
                                }, 1000, function () {
                                    // Animation complete.
                                });
                                }
                            }
                        },
                        error: function (error) {
                            console.log(JSON.stringify(error));
                        }
                    });
                }


                if (backArray[backArray.length - 1] == "MenuGerirProjectos.html") {
                    $('#bt_PDF, #bt_PRE, #bt_HTML, #bt_guardar').css({
                        'visibility': "visible"
                    });
                }

                break;

                /**
                 * criacao do livro para os modelos
                 */
            case "CriarLivro.html":
                $("body").append(wait);
                $.ajax({
                    type: "GET",
                    url: "/getModelsPage",
                    dataType: 'json',
                    success: function (data) {
                        var listLayout = "<div>";
                        for (var i = 0, max = data.length; i < max; i++) {
                            listLayout += "<figure>" +
                                    "<img class='selectModelo btnmodels-style' alt='' src='" +
                                    (data[i].icon == null ? "./img/" + data[i].nome + ".png" : data[i].icon) +
                                    "' data-idmodel='" + data[i].id +
                                    "' data-model='" + data[i].nome + "'/>" +
                                    "<figcaption> " + data[i].nome + " </figcaption>" +
                                    "</figure>";
                        }
                        listLayout += "</div>";
                        $("body").find("#loading").remove();
                        $("body").find("#painelModelos").append(listLayout);

                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os Modelos para s paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;
                /**
                 * --------------------BACKOFFICE-----------------------------
                 */

                //------------------------GERIR-------------------------------

            case "GerirAlunos.html":
                $("body").append(wait);
                $.ajax({
                    type: "GET",
                    url: "/getsAlunos",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar;
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlVar += "<tr>";
                            htmlVar += "<td>" + data[i].id + "</td>" +
                                    "<td>" + '<img class="text-center avatar-mini" src="' + data[i].avatar + '"></td>' +
                                    "<td>" + data[i].username + "</td>" +
                                    "<td>" + data[i].nome_aluno + "</td>" +
                                    "<td>" + data[i].num_aluno + "</td>" +
                                    "<td>" + data[i].ano + "</td>" +
                                    "<td>" + data[i].turma + "</td>" +
                                    "<td>" + data[i].nome_escola + "</td>" +
                                    '<td class="image">' +
                                    '<div rel=' + data[i].id + ' class="editInfo" data-type="aluno" data-folder="html" data-layout="EditarAluno.html">' +
                                    '<img class="text-center image" src="../img/edit_40.png">' +
                                    '</div>' +
                                    '</td>' +
                                    '<td class="image">' +
                                    '<div rel=' + data[i].id + ' class="editState" data-type="aluno">' +
                                    '<img class="text-center image" width="35"';
                            if (data[i].active == "1") {
                                htmlVar += ' src="../img/green.png">';
                            }
                            else {
                                htmlVar += ' src="../img/red.png">';
                            }
                            htmlVar += '</div>' + '</td>' + "</tr>";
                        }
                        $("body").find("#loading").remove();
                        $("#gerirEntitiesTable tbody").remove();
                        $("body").find("#gerirEntitiesTable").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.");
                        console.log(JSON.stringify(error));
                    }
                });
                break;

            case "GerirProfessores.html":
                $("body").append(wait);
                $.ajax({
                    type: "GET",
                    url: "/getsProfessores",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar;// = "<td>"+data[0].id_user+"</td>";
                        for (var i = 0, max = data.length; i < max; i++) {

                            htmlVar += "<tr>";
                            htmlVar += "<td>" + data[i].id + "</td>" +
                                    "<td>" + '<img class="text-center avatar-mini" src="' + data[i].avatar + '"></td>' +
                                    "<td>" + data[i].username + "</td>" +
                                    "<td>" + data[i].nome_professor + "</td>" +
                                    "<td>" + data[i].email + "</td>" +
                                    "<td>" + data[i].nome_agrupamento + "</td>" +
                                    '<td class="image">' +
                                    '<div rel="' + data[i].id + '" class="editInfo" data-type="professor" data-folder="html" data-layout="EditarProfessor.html">' +
                                    '<img class="text-center image" src="../img/edit_40.png">' +
                                    '</div>' +
                                    '</td>' +
                                    '<td class="image">' +
                                    '<div rel=' + data[i].id + ' class="editState" data-type="professor">' +
                                    '<img class="text-center image" width="35"';
                            if (data[i].active == "1") {
                                htmlVar += ' src="../img/green.png">';
                            }
                            else {
                                htmlVar += ' src="../img/red.png">';
                            }
                            '</div>' +
                                    '</td>' +
                                    "</tr>";
                        }

                        $("body").find("#loading").remove();
                        $("#gerirEntitiesTable tbody").remove();
                        $("body").find("#gerirEntitiesTable").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;

            case "GerirEscolas.html":
                $("body").append(wait);
                $.ajax({
                    type: "GET",
                    url: "/getsEscolas",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar;// = "<td>"+data[0].id_user+"</td>";
                        for (var i = 0, max = data.length; i < max; i++) {
                            htmlVar += "<tr>";
                            htmlVar += "<td>" + data[i].id + "</td>" +
                                    "<td>" + data[i].nome_escola + "</td>" +
                                    "<td>" + data[i].morada + "</td>" +
                                    "<td>" + data[i].contacto + "</td>" +
                                    "<td>" + data[i].nome_agrupamento + "</td>" +
                                    '<td class="image">' +
                                    '<div rel=' + data[i].id + ' class="editInfo" data-type="escola" data-folder="html" data-layout="EditarEscola.html">' +
                                    '<img class="text-center image" src="../img/edit_40.png">' +
                                    '</div>' +
                                    '</td>' +
                                    "</tr>";
                        }

                        $("body").find("#loading").remove();
                        $("#gerirEntitiesTable tbody").remove();
                        $("body").find("#gerirEntitiesTable").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;

            case "GerirAgrupamentos.html":
                $("body").append(wait);
                $.ajax({
                    type: "GET",
                    url: "/getsAgrupamentos",
                    dataType: 'json',
                    success: function (data) {
                        var htmlVar;// = "<td>"+data[0].id_user+"</td>";
                        for (var i = 0, max = data.length; i < max; i++) {

                            htmlVar += "<tr>";
                            htmlVar += "<td>" + data[i].id + "</td>" +
                                    "<td>" + data[i].nome + "</td>" +
                                    '<td class="image">' +
                                    '<div rel=' + data[i].id + ' class="editInfo" data-type="agrupamento" data-folder="html" data-layout="EditarAgrupamento.html">' +
                                    '<img class="text-center image" src="../img/edit_40.png">' +
                                    '</div>' +
                                    '</td>' +
                                    "</tr>";
                        }
                        $("body").find("#loading").remove();
                        $("#gerirEntitiesTable tbody").remove();
                        $("body").find("#gerirEntitiesTable").append(htmlVar);
                    },
                    error: function (error) {
                        $("body").find("#loading").remove();
                        alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                        console.log(JSON.stringify(error));
                    }
                });
                break;
            default:
                $('#bt_PDF, #bt_PRE, #bt_HTML, #bt_guardar').css({
                    'visibility': "hidden"
                });
                break;
        }
    });
}

//Validação feita dos forms
function validacaoFormAll() {
    $("body").find('.validForm').bootstrapValidator({
        feedbackIcons: {//Ícones de validação (Gryphicons do bootstrap)
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        locale: 'pt_PT',
        fields: {
            input_username: {
                validators: {
                    stringLength: {// Tamanhho de string (chars)
                        min: 3,
                        max: 20,
                    },
                    notEmpty: {} //Não-nulo
                }
            },
            input_password: {
                validators: {
                    stringLength: {
                        min: 5,
                        max: 50,
                    },
                    notEmpty: {}
                }
            },
            input_nome: {
                validators: {
                    stringLength: {
                        min: 3,
                        max: 40
                    },
                    notEmpty: {}
                }
            },
            input_email: {//Validação de mail
                validators: {
                    emailAddress: {},
                    notEmpty: {}
                }
            },
            input_numero: {
                validators: {
                    notEmpty: {},
                    between: {//Intervalo de números
                        min: 2,
                        max: 50
                    }
                }
            },
            input_morada: {
                validators: {
                    notEmpty: {},
                    stringLength: {
                        min: 3,
                        max: 30
                    }
                }
            },
            input_contacto: {
                validators: {
                    notEmpty: {},
                    numeric: {}, //Inserção de números obrigatório (Apenas numérico)
                    stringLength: {
                        min: 9,
                        max: 9,
                        message: 'Por favor insira numero de telefone' //É necessário mensagem de alerta

                    }
                }
            },
            select_choise: {//Validação de dropdown (se for val="" dá mensagem)
                validators: {
                    notEmpty: {}
                }
            }
        }
    });
}

/**
 * Ajusta os elementos do ecram principal
 
 * @returns {undefined} */
function ajustElements() {
    $("#contentor").css({
        height: $(window).height() * 0.89
    });
    // calcula a altura das tabes
    $("body").find(".txtTab").css({
        height: $("#contentor").height() * 0.82
    });
}

/**
 * Fucao que recebe um array de paginas e constroi o livro e guarda-o no 
 * cliente que fez o pedido do livro.
 * @param {type} data
 * @returns {undefined}
 */
function save_html(data) {
    var scriptStart = "<script type=\"text/javascript\">";
    var scriptEnd = "setInterval(function() {$('p').attr('contenteditable','false');}, 1000);</script>";
    var styleStart = "<style type=\"text/css\">";
    var styleEnd = "body{    overflow:hidden;}#flipbook{    width:100%;    height:100%;}#flipbook .page{    width:100%;    height:100%;    background-color:white;    line-height:1em;    font-size:20px;    text-align:center;}#flipbook .page-wrapper{    -webkit-perspective:2000px;    -moz-perspective:2000px;    -ms-perspective:2000px;    -o-perspective:2000px;    perspective:2000px;}#flipbook .hard{    background:#ccc !important;    color:#333;    -webkit-box-shadow:inset 0 0 5px #666;    -moz-box-shadow:inset 0 0 5px #666;    -o-box-shadow:inset 0 0 5px #666;    -ms-box-shadow:inset 0 0 5px #666;    box-shadow:inset 0 0 5px #666;    font-weight:bold;}#flipbook .odd{    background:-webkit-gradient(linear, right top, left top, color-stop(0.95, #FFF), color-stop(1, #DADADA));    background-image:-webkit-linear-gradient(right, #FFF 95%, #C4C4C4 100%);    background-image:-moz-linear-gradient(right, #FFF 95%, #C4C4C4 100%);    background-image:-ms-linear-gradient(right, #FFF 95%, #C4C4C4 100%);    background-image:-o-linear-gradient(right, #FFF 95%, #C4C4C4 100%);    background-image:linear-gradient(right, #FFF 95%, #C4C4C4 100%);    -webkit-box-shadow:inset 0 0 5px #666;    -moz-box-shadow:inset 0 0 5px #666;    -o-box-shadow:inset 0 0 5px #666;    -ms-box-shadow:inset 0 0 5px #666;    box-shadow:inset 0 0 5px #666;    }#flipbook .even{    background:-webkit-gradient(linear, left top, right top, color-stop(0.95, #fff), color-stop(1, #dadada));    background-image:-webkit-linear-gradient(left, #fff 95%, #dadada 100%);    background-image:-moz-linear-gradient(left, #fff 95%, #dadada 100%);    background-image:-ms-linear-gradient(left, #fff 95%, #dadada 100%);    background-image:-o-linear-gradient(left, #fff 95%, #dadada 100%);    background-image:linear-gradient(left, #fff 95%, #dadada 100%);    -webkit-box-shadow:inset 0 0 5px #666;    -moz-box-shadow:inset 0 0 5px #666;    -o-box-shadow:inset 0 0 5px #666;    -ms-box-shadow:inset 0 0 5px #666;    box-shadow:inset 0 0 5px #666;}p {    height: 20px;}.dragandrophandler {    	    width:400px;    color:#92AAB0;    text-align:left;vertical-align:middle;font-size:200%;}canvas{    position: absolute;}#canvasdr{    position: relative;    overflow: hidden;    overflow-y: scroll;}.tabpage {    border: 1px solid black;    width: 210mm;    height: 297mm;    padding: 20px;    margin: auto;}.tabpage > .titulo, .titulo1, .titulo2, .titulo3, .titulo4, .titulo5, .titulo6, .titulo7 {	font-size: 32px;	text-align: center;}.titulo {       height: 30%; width: 90%;  margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;    	}.titulo1 {    float: left;    width: 50%;    height: 100%;    margin-top: 50px;}.titulo2 {    width: 200mm;    height: 70mm;    margin-top: 20px;}.titulo3 {	float: left;    width: 39%;    height: 40%;    margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;}.titulo4 {	float: left;    width: 40%;    height: 40%;    margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;}.titulo5 {	width: 90%;    height: 40%;    margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;}.titulo6 {	width: 90%;    height: 20%;    margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;}.titulo7 {	height: 30%; width: 90%;  margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;}img {	border: 1px solid black;                    -moz-box-shadow:    inset 0 0 5px #000000;    -webkit-box-shadow: inset 0 0 5px #000000;    box-shadow:         inset 0 0 5px #000000;}.image {    height: 50%;	width: 50%;    margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;}.image1 {     float: left;    height: 30%;	width: 30%;    margin-top: 50px;	margin-left: 30px;	margin-right: 30px;}.image2 {        margin-top: 50px;	margin-left: 30px;	margin-right: 30px;	height: 30%;	width: 30%;}.image3 {	float: left;    height: 40%;	width: 40%;    margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;}.image4 {	float: left;    height: 40%;	width: 39%;    margin-top: 5%;	margin-left: 5%;	margin-right: 5%;	margin-bottom: 5%;    }.image5 {	display: block;    margin: 0 auto;    height: 100mm;    margin-top: 50px;    width: 100mm;}.image6 {	display: block;    margin: 0 auto;    height: 90mm;    margin-top: 20px;    width: 90mm;}.conteudo {	margin-top: 50px;	margin-right: 500px;	margin-left: 50px;    width: 90%;    height: 90%;} .tabpage > div, .tabpagedraw > input {    width: 100%;    border: 1px solid black;                    -moz-box-shadow:    inset 0 0 5px #000000;    -webkit-box-shadow: inset 0 0 5px #000000;    box-shadow:         inset 0 0 5px #000000;}.tabpagedraw {    border: 1px solid black;    width: 210mm;    height: 297mm;    padding: 20px;    margin: auto;}.tabpagedraw > input {    height: 40px;    text-align: center;    font-size: xx-large;    margin-top: 50px;}.tabpagedraw > canvas {    border: 1px solid black;    width: 100%;    height: 700px;    margin-top: 30px;}input[type=file] {    display: none;}.empty {	float:left;	height: 0mm;    margin-top: 0px;    width: 200mm;	border: 0px;}body{background-color:#AAAAFF;}p {font-size:86%; margin-bottom: 3px;}</style>";
    var html = "<html><head><meta charset=\"UTF-8\">";
    html += scriptStart + "\n(function( global, factory ) {\n\n\u0009if ( typeof module === \"object\" && typeof module.exports === \"object\" ) {\n\u0009\u0009// For CommonJS and CommonJS-like environments where a proper window is present,\n\u0009\u0009// execute the factory and get jQuery\n\u0009\u0009// For environments that do not inherently posses a window with a document\n\u0009\u0009// (such as Node.js), expose a jQuery-making factory as module.exports\n\u0009\u0009// This accentuates the need for the creation of a real window\n\u0009\u0009// e.g. var jQuery = require(\"jquery\")(window);\n\u0009\u0009// See ticket #14549 for more info\n\u0009\u0009module.exports = global.document ?\n\u0009\u0009\u0009factory( global, true ) :\n\u0009\u0009\u0009function( w ) {\n\u0009\u0009\u0009\u0009if ( !w.document ) {\n\u0009\u0009\u0009\u0009\u0009throw new Error( \"jQuery requires a window with a document\" );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return factory( w );\n\u0009\u0009\u0009};\n\u0009} else {\n\u0009\u0009factory( global );\n\u0009}\n\n// Pass this if window is not defined yet\n}(typeof window !== \"undefined\" ? window : this, function( window, noGlobal ) {\n\n// Can't do this because several apps including ASP.NET trace\n// the stack via arguments.caller.callee and Firefox dies if\n// you try to trace through \"use strict\" call chains. (#13335)\n// Support: Firefox 18+\n//\n\nvar deletedIds = [];\n\nvar slice = deletedIds.slice;\n\nvar concat = deletedIds.concat;\n\nvar push = deletedIds.push;\n\nvar indexOf = deletedIds.indexOf;\n\nvar class2type = {};\n\nvar toString = class2type.toString;\n\nvar hasOwn = class2type.hasOwnProperty;\n\nvar support = {};\n\n\n\nvar\n\u0009version = \"1.11.2\",\n\n\u0009// Define a local copy of jQuery\n\u0009jQuery = function( selector, context ) {\n\u0009\u0009// The jQuery object is actually just the init constructor 'enhanced'\n\u0009\u0009// Need init if jQuery is called (just allow error to be thrown if not included)\n\u0009\u0009return new jQuery.fn.init( selector, context );\n\u0009},\n\n\u0009// Support: Android<4.1, IE<9\n\u0009// Make sure we trim BOM and NBSP\n\u0009rtrim = /^[\\s\\uFEFF\\xA0]+|[\\s\\uFEFF\\xA0]+$/g,\n\n\u0009// Matches dashed string for camelizing\n\u0009rmsPrefix = /^-ms-/,\n\u0009rdashAlpha = /-([\\da-z])/gi,\n\n\u0009// Used by jQuery.camelCase as callback to replace()\n\u0009fcamelCase = function( all, letter ) {\n\u0009\u0009return letter.toUpperCase();\n\u0009};\n\njQuery.fn = jQuery.prototype = {\n\u0009// The current version of jQuery being used\n\u0009jquery: version,\n\n\u0009constructor: jQuery,\n\n\u0009// Start with an empty selector\n\u0009selector: \"\",\n\n\u0009// The default length of a jQuery object is 0\n\u0009length: 0,\n\n\u0009toArray: function() {\n\u0009\u0009return slice.call( this );\n\u0009},\n\n\u0009// Get the Nth element in the matched element set OR\n\u0009// Get the whole matched element set as a clean array\n\u0009get: function( num ) {\n\u0009\u0009return num != null ?\n\n\u0009\u0009\u0009// Return just the one element from the set\n\u0009\u0009\u0009( num < 0 ? this[ num + this.length ] : this[ num ] ) :\n\n\u0009\u0009\u0009// Return all the elements in a clean array\n\u0009\u0009\u0009slice.call( this );\n\u0009},\n\n\u0009// Take an array of elements and push it onto the stack\n\u0009// (returning the new matched element set)\n\u0009pushStack: function( elems ) {\n\n\u0009\u0009// Build a new jQuery matched element set\n\u0009\u0009var ret = jQuery.merge( this.constructor(), elems );\n\n\u0009\u0009// Add the old object onto the stack (as a reference)\n\u0009\u0009ret.prevObject = this;\n\u0009\u0009ret.context = this.context;\n\n\u0009\u0009// Return the newly-formed element set\n\u0009\u0009return ret;\n\u0009},\n\n\u0009// Execute a callback for every element in the matched set.\n\u0009// (You can seed the arguments with an array of args, but this is\n\u0009// only used internally.)\n\u0009each: function( callback, args ) {\n\u0009\u0009return jQuery.each( this, callback, args );\n\u0009},\n\n\u0009map: function( callback ) {\n\u0009\u0009return this.pushStack( jQuery.map(this, function( elem, i ) {\n\u0009\u0009\u0009return callback.call( elem, i, elem );\n\u0009\u0009}));\n\u0009},\n\n\u0009slice: function() {\n\u0009\u0009return this.pushStack( slice.apply( this, arguments ) );\n\u0009},\n\n\u0009first: function() {\n\u0009\u0009return this.eq( 0 );\n\u0009},\n\n\u0009last: function() {\n\u0009\u0009return this.eq( -1 );\n\u0009},\n\n\u0009eq: function( i ) {\n\u0009\u0009var len = this.length,\n\u0009\u0009\u0009j = +i + ( i < 0 ? len : 0 );\n\u0009\u0009return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );\n\u0009},\n\n\u0009end: function() {\n\u0009\u0009return this.prevObject || this.constructor(null);\n\u0009},\n\n\u0009// For internal use only.\n\u0009// Behaves like an Array's method, not like a jQuery method.\n\u0009push: push,\n\u0009sort: deletedIds.sort,\n\u0009splice: deletedIds.splice\n};\n\njQuery.extend = jQuery.fn.extend = function() {\n\u0009var src, copyIsArray, copy, name, options, clone,\n\u0009\u0009target = arguments[0] || {},\n\u0009\u0009i = 1,\n\u0009\u0009length = arguments.length,\n\u0009\u0009deep = false;\n\n\u0009// Handle a deep copy situation\n\u0009if ( typeof target === \"boolean\" ) {\n\u0009\u0009deep = target;\n\n\u0009\u0009// skip the boolean and the target\n\u0009\u0009target = arguments[ i ] || {};\n\u0009\u0009i++;\n\u0009}\n\n\u0009// Handle case when target is a string or something (possible in deep copy)\n\u0009if ( typeof target !== \"object\" && !jQuery.isFunction(target) ) {\n\u0009\u0009target = {};\n\u0009}\n\n\u0009// extend jQuery itself if only one argument is passed\n\u0009if ( i === length ) {\n\u0009\u0009target = this;\n\u0009\u0009i--;\n\u0009}\n\n\u0009for ( ; i < length; i++ ) {\n\u0009\u0009// Only deal with non-null/undefined values\n\u0009\u0009if ( (options = arguments[ i ]) != null ) {\n\u0009\u0009\u0009// Extend the base object\n\u0009\u0009\u0009for ( name in options ) {\n\u0009\u0009\u0009\u0009src = target[ name ];\n\u0009\u0009\u0009\u0009copy = options[ name ];\n\n\u0009\u0009\u0009\u0009// Prevent never-ending loop\n\u0009\u0009\u0009\u0009if ( target === copy ) {\n\u0009\u0009\u0009\u0009\u0009continue;\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Recurse if we're merging plain objects or arrays\n\u0009\u0009\u0009\u0009if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {\n\u0009\u0009\u0009\u0009\u0009if ( copyIsArray ) {\n\u0009\u0009\u0009\u0009\u0009\u0009copyIsArray = false;\n\u0009\u0009\u0009\u0009\u0009\u0009clone = src && jQuery.isArray(src) ? src : [];\n\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009clone = src && jQuery.isPlainObject(src) ? src : {};\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Never move original objects, clone them\n\u0009\u0009\u0009\u0009\u0009target[ name ] = jQuery.extend( deep, clone, copy );\n\n\u0009\u0009\u0009\u0009// Don't bring in undefined values\n\u0009\u0009\u0009\u0009} else if ( copy !== undefined ) {\n\u0009\u0009\u0009\u0009\u0009target[ name ] = copy;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009// Return the modified object\n\u0009return target;\n};\n\njQuery.extend({\n\u0009// Unique for each copy of jQuery on the page\n\u0009expando: \"jQuery\" + ( version + Math.random() ).replace( /\\D/g, \"\" ),\n\n\u0009// Assume jQuery is ready without the ready module\n\u0009isReady: true,\n\n\u0009error: function( msg ) {\n\u0009\u0009throw new Error( msg );\n\u0009},\n\n\u0009noop: function() {},\n\n\u0009// See test/unit/core.js for details concerning isFunction.\n\u0009// Since version 1.3, DOM methods and functions like alert\n\u0009// aren't supported. They return false on IE (#2968).\n\u0009isFunction: function( obj ) {\n\u0009\u0009return jQuery.type(obj) === \"function\";\n\u0009},\n\n\u0009isArray: Array.isArray || function( obj ) {\n\u0009\u0009return jQuery.type(obj) === \"array\";\n\u0009},\n\n\u0009isWindow: function( obj ) {\n\u0009\u0009/* jshint eqeqeq: false */\n\u0009\u0009return obj != null && obj == obj.window;\n\u0009},\n\n\u0009isNumeric: function( obj ) {\n\u0009\u0009// parseFloat NaNs numeric-cast false positives (null|true|false|\"\")\n\u0009\u0009// ...but misinterprets leading-number strings, particularly hex literals (\"0x...\")\n\u0009\u0009// subtraction forces infinities to NaN\n\u0009\u0009// adding 1 corrects loss of precision from parseFloat (#15100)\n\u0009\u0009return !jQuery.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;\n\u0009},\n\n\u0009isEmptyObject: function( obj ) {\n\u0009\u0009var name;\n\u0009\u0009for ( name in obj ) {\n\u0009\u0009\u0009return false;\n\u0009\u0009}\n\u0009\u0009return true;\n\u0009},\n\n\u0009isPlainObject: function( obj ) {\n\u0009\u0009var key;\n\n\u0009\u0009// Must be an Object.\n\u0009\u0009// Because of IE, we also have to check the presence of the constructor property.\n\u0009\u0009// Make sure that DOM nodes and window objects don't pass through, as well\n\u0009\u0009if ( !obj || jQuery.type(obj) !== \"object\" || obj.nodeType || jQuery.isWindow( obj ) ) {\n\u0009\u0009\u0009return false;\n\u0009\u0009}\n\n\u0009\u0009try {\n\u0009\u0009\u0009// Not own constructor property must be Object\n\u0009\u0009\u0009if ( obj.constructor &&\n\u0009\u0009\u0009\u0009!hasOwn.call(obj, \"constructor\") &&\n\u0009\u0009\u0009\u0009!hasOwn.call(obj.constructor.prototype, \"isPrototypeOf\") ) {\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009}\n\u0009\u0009} catch ( e ) {\n\u0009\u0009\u0009// IE8,9 Will throw exceptions on certain host objects #9897\n\u0009\u0009\u0009return false;\n\u0009\u0009}\n\n\u0009\u0009// Support: IE<9\n\u0009\u0009// Handle iteration over inherited properties before own properties.\n\u0009\u0009if ( support.ownLast ) {\n\u0009\u0009\u0009for ( key in obj ) {\n\u0009\u0009\u0009\u0009return hasOwn.call( obj, key );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Own properties are enumerated firstly, so to speed up,\n\u0009\u0009// if last one is own, then all properties are own.\n\u0009\u0009for ( key in obj ) {}\n\n\u0009\u0009return key === undefined || hasOwn.call( obj, key );\n\u0009},\n\n\u0009type: function( obj ) {\n\u0009\u0009if ( obj == null ) {\n\u0009\u0009\u0009return obj + \"\";\n\u0009\u0009}\n\u0009\u0009return typeof obj === \"object\" || typeof obj === \"function\" ?\n\u0009\u0009\u0009class2type[ toString.call(obj) ] || \"object\" :\n\u0009\u0009\u0009typeof obj;\n\u0009},\n\n\u0009// Evaluates a script in a global context\n\u0009// Workarounds based on findings by Jim Driscoll\n\u0009// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context\n\u0009globalEval: function( data ) {\n\u0009\u0009if ( data && jQuery.trim( data ) ) {\n\u0009\u0009\u0009// We use execScript on Internet Explorer\n\u0009\u0009\u0009// We use an anonymous function so that context is window\n\u0009\u0009\u0009// rather than jQuery in Firefox\n\u0009\u0009\u0009( window.execScript || function( data ) {\n\u0009\u0009\u0009\u0009window[ \"eval\" ].call( window, data );\n\u0009\u0009\u0009} )( data );\n\u0009\u0009}\n\u0009},\n\n\u0009// Convert dashed to camelCase; used by the css and data modules\n\u0009// Microsoft forgot to hump their vendor prefix (#9572)\n\u0009camelCase: function( string ) {\n\u0009\u0009return string.replace( rmsPrefix, \"ms-\" ).replace( rdashAlpha, fcamelCase );\n\u0009},\n\n\u0009nodeName: function( elem, name ) {\n\u0009\u0009return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();\n\u0009},\n\n\u0009// args is for internal usage only\n\u0009each: function( obj, callback, args ) {\n\u0009\u0009var value,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009length = obj.length,\n\u0009\u0009\u0009isArray = isArraylike( obj );\n\n\u0009\u0009if ( args ) {\n\u0009\u0009\u0009if ( isArray ) {\n\u0009\u0009\u0009\u0009for ( ; i < length; i++ ) {\n\u0009\u0009\u0009\u0009\u0009value = callback.apply( obj[ i ], args );\n\n\u0009\u0009\u0009\u0009\u0009if ( value === false ) {\n\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009for ( i in obj ) {\n\u0009\u0009\u0009\u0009\u0009value = callback.apply( obj[ i ], args );\n\n\u0009\u0009\u0009\u0009\u0009if ( value === false ) {\n\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009// A special, fast, case for the most common use of each\n\u0009\u0009} else {\n\u0009\u0009\u0009if ( isArray ) {\n\u0009\u0009\u0009\u0009for ( ; i < length; i++ ) {\n\u0009\u0009\u0009\u0009\u0009value = callback.call( obj[ i ], i, obj[ i ] );\n\n\u0009\u0009\u0009\u0009\u0009if ( value === false ) {\n\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009for ( i in obj ) {\n\u0009\u0009\u0009\u0009\u0009value = callback.call( obj[ i ], i, obj[ i ] );\n\n\u0009\u0009\u0009\u0009\u0009if ( value === false ) {\n\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return obj;\n\u0009},\n\n\u0009// Support: Android<4.1, IE<9\n\u0009trim: function( text ) {\n\u0009\u0009return text == null ?\n\u0009\u0009\u0009\"\" :\n\u0009\u0009\u0009( text + \"\" ).replace( rtrim, \"\" );\n\u0009},\n\n\u0009// results is for internal usage only\n\u0009makeArray: function( arr, results ) {\n\u0009\u0009var ret = results || [];\n\n\u0009\u0009if ( arr != null ) {\n\u0009\u0009\u0009if ( isArraylike( Object(arr) ) ) {\n\u0009\u0009\u0009\u0009jQuery.merge( ret,\n\u0009\u0009\u0009\u0009\u0009typeof arr === \"string\" ?\n\u0009\u0009\u0009\u0009\u0009[ arr ] : arr\n\u0009\u0009\u0009\u0009);\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009push.call( ret, arr );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return ret;\n\u0009},\n\n\u0009inArray: function( elem, arr, i ) {\n\u0009\u0009var len;\n\n\u0009\u0009if ( arr ) {\n\u0009\u0009\u0009if ( indexOf ) {\n\u0009\u0009\u0009\u0009return indexOf.call( arr, elem, i );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009len = arr.length;\n\u0009\u0009\u0009i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;\n\n\u0009\u0009\u0009for ( ; i < len; i++ ) {\n\u0009\u0009\u0009\u0009// Skip accessing in sparse arrays\n\u0009\u0009\u0009\u0009if ( i in arr && arr[ i ] === elem ) {\n\u0009\u0009\u0009\u0009\u0009return i;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return -1;\n\u0009},\n\n\u0009merge: function( first, second ) {\n\u0009\u0009var len = +second.length,\n\u0009\u0009\u0009j = 0,\n\u0009\u0009\u0009i = first.length;\n\n\u0009\u0009while ( j < len ) {\n\u0009\u0009\u0009first[ i++ ] = second[ j++ ];\n\u0009\u0009}\n\n\u0009\u0009// Support: IE<9\n\u0009\u0009// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)\n\u0009\u0009if ( len !== len ) {\n\u0009\u0009\u0009while ( second[j] !== undefined ) {\n\u0009\u0009\u0009\u0009first[ i++ ] = second[ j++ ];\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009first.length = i;\n\n\u0009\u0009return first;\n\u0009},\n\n\u0009grep: function( elems, callback, invert ) {\n\u0009\u0009var callbackInverse,\n\u0009\u0009\u0009matches = [],\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009length = elems.length,\n\u0009\u0009\u0009callbackExpect = !invert;\n\n\u0009\u0009// Go through the array, only saving the items\n\u0009\u0009// that pass the validator function\n\u0009\u0009for ( ; i < length; i++ ) {\n\u0009\u0009\u0009callbackInverse = !callback( elems[ i ], i );\n\u0009\u0009\u0009if ( callbackInverse !== callbackExpect ) {\n\u0009\u0009\u0009\u0009matches.push( elems[ i ] );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return matches;\n\u0009},\n\n\u0009// arg is for internal usage only\n\u0009map: function( elems, callback, arg ) {\n\u0009\u0009var value,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009length = elems.length,\n\u0009\u0009\u0009isArray = isArraylike( elems ),\n\u0009\u0009\u0009ret = [];\n\n\u0009\u0009// Go through the array, translating each of the items to their new values\n\u0009\u0009if ( isArray ) {\n\u0009\u0009\u0009for ( ; i < length; i++ ) {\n\u0009\u0009\u0009\u0009value = callback( elems[ i ], i, arg );\n\n\u0009\u0009\u0009\u0009if ( value != null ) {\n\u0009\u0009\u0009\u0009\u0009ret.push( value );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009// Go through every key on the object,\n\u0009\u0009} else {\n\u0009\u0009\u0009for ( i in elems ) {\n\u0009\u0009\u0009\u0009value = callback( elems[ i ], i, arg );\n\n\u0009\u0009\u0009\u0009if ( value != null ) {\n\u0009\u0009\u0009\u0009\u0009ret.push( value );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Flatten any nested arrays\n\u0009\u0009return concat.apply( [], ret );\n\u0009},\n\n\u0009// A global GUID counter for objects\n\u0009guid: 1,\n\n\u0009// Bind a function to a context, optionally partially applying any\n\u0009// arguments.\n\u0009proxy: function( fn, context ) {\n\u0009\u0009var args, proxy, tmp;\n\n\u0009\u0009if ( typeof context === \"string\" ) {\n\u0009\u0009\u0009tmp = fn[ context ];\n\u0009\u0009\u0009context = fn;\n\u0009\u0009\u0009fn = tmp;\n\u0009\u0009}\n\n\u0009\u0009// Quick check to determine if target is callable, in the spec\n\u0009\u0009// this throws a TypeError, but we will just return undefined.\n\u0009\u0009if ( !jQuery.isFunction( fn ) ) {\n\u0009\u0009\u0009return undefined;\n\u0009\u0009}\n\n\u0009\u0009// Simulated bind\n\u0009\u0009args = slice.call( arguments, 2 );\n\u0009\u0009proxy = function() {\n\u0009\u0009\u0009return fn.apply( context || this, args.concat( slice.call( arguments ) ) );\n\u0009\u0009};\n\n\u0009\u0009// Set the guid of unique handler to the same of original handler, so it can be removed\n\u0009\u0009proxy.guid = fn.guid = fn.guid || jQuery.guid++;\n\n\u0009\u0009return proxy;\n\u0009},\n\n\u0009now: function() {\n\u0009\u0009return +( new Date() );\n\u0009},\n\n\u0009// jQuery.support is not used in Core but other projects attach their\n\u0009// properties to it so it needs to exist.\n\u0009support: support\n});\n\n// Populate the class2type map\njQuery.each(\"Boolean Number String Function Array Date RegExp Object Error\".split(\" \"), function(i, name) {\n\u0009class2type[ \"[object \" + name + \"]\" ] = name.toLowerCase();\n});\n\nfunction isArraylike( obj ) {\n\u0009var length = obj.length,\n\u0009\u0009type = jQuery.type( obj );\n\n\u0009if ( type === \"function\" || jQuery.isWindow( obj ) ) {\n\u0009\u0009return false;\n\u0009}\n\n\u0009if ( obj.nodeType === 1 && length ) {\n\u0009\u0009return true;\n\u0009}\n\n\u0009return type === \"array\" || length === 0 ||\n\u0009\u0009typeof length === \"number\" && length > 0 && ( length - 1 ) in obj;\n}\nvar Sizzle =\n/*!\n * Sizzle CSS Selector Engine v2.2.0-pre\n * http://sizzlejs.com/\n *\n * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors\n * Released under the MIT license\n * http://jquery.org/license\n *\n * Date: 2014-12-16\n */\n(function( window ) {\n\nvar i,\n\u0009support,\n\u0009Expr,\n\u0009getText,\n\u0009isXML,\n\u0009tokenize,\n\u0009compile,\n\u0009select,\n\u0009outermostContext,\n\u0009sortInput,\n\u0009hasDuplicate,\n\n\u0009// Local document vars\n\u0009setDocument,\n\u0009document,\n\u0009docElem,\n\u0009documentIsHTML,\n\u0009rbuggyQSA,\n\u0009rbuggyMatches,\n\u0009matches,\n\u0009contains,\n\n\u0009// Instance-specific data\n\u0009expando = \"sizzle\" + 1 * new Date(),\n\u0009preferredDoc = window.document,\n\u0009dirruns = 0,\n\u0009done = 0,\n\u0009classCache = createCache(),\n\u0009tokenCache = createCache(),\n\u0009compilerCache = createCache(),\n\u0009sortOrder = function( a, b ) {\n\u0009\u0009if ( a === b ) {\n\u0009\u0009\u0009hasDuplicate = true;\n\u0009\u0009}\n\u0009\u0009return 0;\n\u0009},\n\n\u0009// General-purpose constants\n\u0009MAX_NEGATIVE = 1 << 31,\n\n\u0009// Instance methods\n\u0009hasOwn = ({}).hasOwnProperty,\n\u0009arr = [],\n\u0009pop = arr.pop,\n\u0009push_native = arr.push,\n\u0009push = arr.push,\n\u0009slice = arr.slice,\n\u0009// Use a stripped-down indexOf as it's faster than native\n\u0009// http://jsperf.com/thor-indexof-vs-for/5\n\u0009indexOf = function( list, elem ) {\n\u0009\u0009var i = 0,\n\u0009\u0009\u0009len = list.length;\n\u0009\u0009for ( ; i < len; i++ ) {\n\u0009\u0009\u0009if ( list[i] === elem ) {\n\u0009\u0009\u0009\u0009return i;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009\u0009return -1;\n\u0009},\n\n\u0009booleans = \"checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped\",\n\n\u0009// Regular expressions\n\n\u0009// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace\n\u0009whitespace = \"[\\\\x20\\\\t\\\\r\\\\n\\\\f]\",\n\u0009// http://www.w3.org/TR/css3-syntax/#characters\n\u0009characterEncoding = \"(?:\\\\\\\\.|[\\\\w-]|[^\\\\x00-\\\\xa0])+\",\n\n\u0009// Loosely modeled on CSS identifier characters\n\u0009// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors\n\u0009// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier\n\u0009identifier = characterEncoding.replace( \"w\", \"w#\" ),\n\n\u0009// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors\n\u0009attributes = \"\\\\[\" + whitespace + \"*(\" + characterEncoding + \")(?:\" + whitespace +\n\u0009\u0009// Operator (capture 2)\n\u0009\u0009\"*([*^$|!~]?=)\" + whitespace +\n\u0009\u0009// \"Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]\"\n\u0009\u0009\"*(?:'((?:\\\\\\\\.|[^\\\\\\\\'])*)'|\\\"((?:\\\\\\\\.|[^\\\\\\\\\\\"])*)\\\"|(\" + identifier + \"))|)\" + whitespace +\n\u0009\u0009\"*\\\\]\",\n\n\u0009pseudos = \":(\" + characterEncoding + \")(?:\\\\((\" +\n\u0009\u0009// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:\n\u0009\u0009// 1. quoted (capture 3; capture 4 or capture 5)\n\u0009\u0009\"('((?:\\\\\\\\.|[^\\\\\\\\'])*)'|\\\"((?:\\\\\\\\.|[^\\\\\\\\\\\"])*)\\\")|\" +\n\u0009\u0009// 2. simple (capture 6)\n\u0009\u0009\"((?:\\\\\\\\.|[^\\\\\\\\()[\\\\]]|\" + attributes + \")*)|\" +\n\u0009\u0009// 3. anything else (capture 2)\n\u0009\u0009\".*\" +\n\u0009\u0009\")\\\\)|)\",\n\n\u0009// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter\n\u0009rwhitespace = new RegExp( whitespace + \"+\", \"g\" ),\n\u0009rtrim = new RegExp( \"^\" + whitespace + \"+|((?:^|[^\\\\\\\\])(?:\\\\\\\\.)*)\" + whitespace + \"+$\", \"g\" ),\n\n\u0009rcomma = new RegExp( \"^\" + whitespace + \"*,\" + whitespace + \"*\" ),\n\u0009rcombinators = new RegExp( \"^\" + whitespace + \"*([>+~]|\" + whitespace + \")\" + whitespace + \"*\" ),\n\n\u0009rattributeQuotes = new RegExp( \"=\" + whitespace + \"*([^\\\\]'\\\"]*?)\" + whitespace + \"*\\\\]\", \"g\" ),\n\n\u0009rpseudo = new RegExp( pseudos ),\n\u0009ridentifier = new RegExp( \"^\" + identifier + \"$\" ),\n\n\u0009matchExpr = {\n\u0009\u0009\"ID\": new RegExp( \"^#(\" + characterEncoding + \")\" ),\n\u0009\u0009\"CLASS\": new RegExp( \"^\\\\.(\" + characterEncoding + \")\" ),\n\u0009\u0009\"TAG\": new RegExp( \"^(\" + characterEncoding.replace( \"w\", \"w*\" ) + \")\" ),\n\u0009\u0009\"ATTR\": new RegExp( \"^\" + attributes ),\n\u0009\u0009\"PSEUDO\": new RegExp( \"^\" + pseudos ),\n\u0009\u0009\"CHILD\": new RegExp( \"^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\\\(\" + whitespace +\n\u0009\u0009\u0009\"*(even|odd|(([+-]|)(\\\\d*)n|)\" + whitespace + \"*(?:([+-]|)\" + whitespace +\n\u0009\u0009\u0009\"*(\\\\d+)|))\" + whitespace + \"*\\\\)|)\", \"i\" ),\n\u0009\u0009\"bool\": new RegExp( \"^(?:\" + booleans + \")$\", \"i\" ),\n\u0009\u0009// For use in libraries implementing .is()\n\u0009\u0009// We use this for POS matching in `select`\n\u0009\u0009\"needsContext\": new RegExp( \"^\" + whitespace + \"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\\\(\" +\n\u0009\u0009\u0009whitespace + \"*((?:-\\\\d)?\\\\d*)\" + whitespace + \"*\\\\)|)(?=[^-]|$)\", \"i\" )\n\u0009},\n\n\u0009rinputs = /^(?:input|select|textarea|button)$/i,\n\u0009rheader = /^h\\d$/i,\n\n\u0009rnative = /^[^{]+\\{\\s*\\[native \\w/,\n\n\u0009// Easily-parseable/retrievable ID or TAG or CLASS selectors\n\u0009rquickExpr = /^(?:#([\\w-]+)|(\\w+)|\\.([\\w-]+))$/,\n\n\u0009rsibling = /[+~]/,\n\u0009rescape = /'|\\\\/g,\n\n\u0009// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters\n\u0009runescape = new RegExp( \"\\\\\\\\([\\\\da-f]{1,6}\" + whitespace + \"?|(\" + whitespace + \")|.)\", \"ig\" ),\n\u0009funescape = function( _, escaped, escapedWhitespace ) {\n\u0009\u0009var high = \"0x\" + escaped - 0x10000;\n\u0009\u0009// NaN means non-codepoint\n\u0009\u0009// Support: Firefox<24\n\u0009\u0009// Workaround erroneous numeric interpretation of +\"0x\"\n\u0009\u0009return high !== high || escapedWhitespace ?\n\u0009\u0009\u0009escaped :\n\u0009\u0009\u0009high < 0 ?\n\u0009\u0009\u0009\u0009// BMP codepoint\n\u0009\u0009\u0009\u0009String.fromCharCode( high + 0x10000 ) :\n\u0009\u0009\u0009\u0009// Supplemental Plane codepoint (surrogate pair)\n\u0009\u0009\u0009\u0009String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );\n\u0009},\n\n\u0009// Used for iframes\n\u0009// See setDocument()\n\u0009// Removing the function wrapper causes a \"Permission Denied\"\n\u0009// error in IE\n\u0009unloadHandler = function() {\n\u0009\u0009setDocument();\n\u0009};\n\n// Optimize for push.apply( _, NodeList )\ntry {\n\u0009push.apply(\n\u0009\u0009(arr = slice.call( preferredDoc.childNodes )),\n\u0009\u0009preferredDoc.childNodes\n\u0009);\n\u0009// Support: Android<4.0\n\u0009// Detect silently failing push.apply\n\u0009arr[ preferredDoc.childNodes.length ].nodeType;\n} catch ( e ) {\n\u0009push = { apply: arr.length ?\n\n\u0009\u0009// Leverage slice if possible\n\u0009\u0009function( target, els ) {\n\u0009\u0009\u0009push_native.apply( target, slice.call(els) );\n\u0009\u0009} :\n\n\u0009\u0009// Support: IE<9\n\u0009\u0009// Otherwise append directly\n\u0009\u0009function( target, els ) {\n\u0009\u0009\u0009var j = target.length,\n\u0009\u0009\u0009\u0009i = 0;\n\u0009\u0009\u0009// Can't trust NodeList.length\n\u0009\u0009\u0009while ( (target[j++] = els[i++]) ) {}\n\u0009\u0009\u0009target.length = j - 1;\n\u0009\u0009}\n\u0009};\n}\n\nfunction Sizzle( selector, context, results, seed ) {\n\u0009var match, elem, m, nodeType,\n\u0009\u0009// QSA vars\n\u0009\u0009i, groups, old, nid, newContext, newSelector;\n\n\u0009if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {\n\u0009\u0009setDocument( context );\n\u0009}\n\n\u0009context = context || document;\n\u0009results = results || [];\n\u0009nodeType = context.nodeType;\n\n\u0009if ( typeof selector !== \"string\" || !selector ||\n\u0009\u0009nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {\n\n\u0009\u0009return results;\n\u0009}\n\n\u0009if ( !seed && documentIsHTML ) {\n\n\u0009\u0009// Try to shortcut find operations when possible (e.g., not under DocumentFragment)\n\u0009\u0009if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {\n\u0009\u0009\u0009// Speed-up: Sizzle(\"#ID\")\n\u0009\u0009\u0009if ( (m = match[1]) ) {\n\u0009\u0009\u0009\u0009if ( nodeType === 9 ) {\n\u0009\u0009\u0009\u0009\u0009elem = context.getElementById( m );\n\u0009\u0009\u0009\u0009\u0009// Check parentNode to catch when Blackberry 4.6 returns\n\u0009\u0009\u0009\u0009\u0009// nodes that are no longer in the document (jQuery #6963)\n\u0009\u0009\u0009\u0009\u0009if ( elem && elem.parentNode ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// Handle the case where IE, Opera, and Webkit return items\n\u0009\u0009\u0009\u0009\u0009\u0009// by name instead of ID\n\u0009\u0009\u0009\u0009\u0009\u0009if ( elem.id === m ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009results.push( elem );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return results;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009return results;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009// Context is not a document\n\u0009\u0009\u0009\u0009\u0009if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&\n\u0009\u0009\u0009\u0009\u0009\u0009contains( context, elem ) && elem.id === m ) {\n\u0009\u0009\u0009\u0009\u0009\u0009results.push( elem );\n\u0009\u0009\u0009\u0009\u0009\u0009return results;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Speed-up: Sizzle(\"TAG\")\n\u0009\u0009\u0009} else if ( match[2] ) {\n\u0009\u0009\u0009\u0009push.apply( results, context.getElementsByTagName( selector ) );\n\u0009\u0009\u0009\u0009return results;\n\n\u0009\u0009\u0009// Speed-up: Sizzle(\".CLASS\")\n\u0009\u0009\u0009} else if ( (m = match[3]) && support.getElementsByClassName ) {\n\u0009\u0009\u0009\u0009push.apply( results, context.getElementsByClassName( m ) );\n\u0009\u0009\u0009\u0009return results;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// QSA path\n\u0009\u0009if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {\n\u0009\u0009\u0009nid = old = expando;\n\u0009\u0009\u0009newContext = context;\n\u0009\u0009\u0009newSelector = nodeType !== 1 && selector;\n\n\u0009\u0009\u0009// qSA works strangely on Element-rooted queries\n\u0009\u0009\u0009// We can work around this by specifying an extra ID on the root\n\u0009\u0009\u0009// and working up from there (Thanks to Andrew Dupont for the technique)\n\u0009\u0009\u0009// IE 8 doesn't work on object elements\n\u0009\u0009\u0009if ( nodeType === 1 && context.nodeName.toLowerCase() !== \"object\" ) {\n\u0009\u0009\u0009\u0009groups = tokenize( selector );\n\n\u0009\u0009\u0009\u0009if ( (old = context.getAttribute(\"id\")) ) {\n\u0009\u0009\u0009\u0009\u0009nid = old.replace( rescape, \"\\\\$&\" );\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009context.setAttribute( \"id\", nid );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009nid = \"[id='\" + nid + \"'] \";\n\n\u0009\u0009\u0009\u0009i = groups.length;\n\u0009\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009\u0009groups[i] = nid + toSelector( groups[i] );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;\n\u0009\u0009\u0009\u0009newSelector = groups.join(\",\");\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( newSelector ) {\n\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009push.apply( results,\n\u0009\u0009\u0009\u0009\u0009\u0009newContext.querySelectorAll( newSelector )\n\u0009\u0009\u0009\u0009\u0009);\n\u0009\u0009\u0009\u0009\u0009return results;\n\u0009\u0009\u0009\u0009} catch(qsaError) {\n\u0009\u0009\u0009\u0009} finally {\n\u0009\u0009\u0009\u0009\u0009if ( !old ) {\n\u0009\u0009\u0009\u0009\u0009\u0009context.removeAttribute(\"id\");\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009// All others\n\u0009return select( selector.replace( rtrim, \"$1\" ), context, results, seed );\n}\n\n/**\n * Create key-value caches of limited size\n * @returns {Function(string, Object)} Returns the Object data after storing it on itself with\n *\u0009property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)\n *\u0009deleting the oldest entry\n */\nfunction createCache() {\n\u0009var keys = [];\n\n\u0009function cache( key, value ) {\n\u0009\u0009// Use (key + \" \") to avoid collision with native prototype properties (see Issue #157)\n\u0009\u0009if ( keys.push( key + \" \" ) > Expr.cacheLength ) {\n\u0009\u0009\u0009// Only keep the most recent entries\n\u0009\u0009\u0009delete cache[ keys.shift() ];\n\u0009\u0009}\n\u0009\u0009return (cache[ key + \" \" ] = value);\n\u0009}\n\u0009return cache;\n}\n\n/**\n * Mark a function for special use by Sizzle\n * @param {Function} fn The function to mark\n */\nfunction markFunction( fn ) {\n\u0009fn[ expando ] = true;\n\u0009return fn;\n}\n\n/**\n * Support testing using an element\n * @param {Function} fn Passed the created div and expects a boolean result\n */\nfunction assert( fn ) {\n\u0009var div = document.createElement(\"div\");\n\n\u0009try {\n\u0009\u0009return !!fn( div );\n\u0009} catch (e) {\n\u0009\u0009return false;\n\u0009} finally {\n\u0009\u0009// Remove from its parent by default\n\u0009\u0009if ( div.parentNode ) {\n\u0009\u0009\u0009div.parentNode.removeChild( div );\n\u0009\u0009}\n\u0009\u0009// release memory in IE\n\u0009\u0009div = null;\n\u0009}\n}\n\n/**\n * Adds the same handler for all of the specified attrs\n * @param {String} attrs Pipe-separated list of attributes\n * @param {Function} handler The method that will be applied\n */\nfunction addHandle( attrs, handler ) {\n\u0009var arr = attrs.split(\"|\"),\n\u0009\u0009i = attrs.length;\n\n\u0009while ( i-- ) {\n\u0009\u0009Expr.attrHandle[ arr[i] ] = handler;\n\u0009}\n}\n\n/**\n * Checks document order of two siblings\n * @param {Element} a\n * @param {Element} b\n * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b\n */\nfunction siblingCheck( a, b ) {\n\u0009var cur = b && a,\n\u0009\u0009diff = cur && a.nodeType === 1 && b.nodeType === 1 &&\n\u0009\u0009\u0009( ~b.sourceIndex || MAX_NEGATIVE ) -\n\u0009\u0009\u0009( ~a.sourceIndex || MAX_NEGATIVE );\n\n\u0009// Use IE sourceIndex if available on both nodes\n\u0009if ( diff ) {\n\u0009\u0009return diff;\n\u0009}\n\n\u0009// Check if b follows a\n\u0009if ( cur ) {\n\u0009\u0009while ( (cur = cur.nextSibling) ) {\n\u0009\u0009\u0009if ( cur === b ) {\n\u0009\u0009\u0009\u0009return -1;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009return a ? 1 : -1;\n}\n\n/**\n * Returns a function to use in pseudos for input types\n * @param {String} type\n */\nfunction createInputPseudo( type ) {\n\u0009return function( elem ) {\n\u0009\u0009var name = elem.nodeName.toLowerCase();\n\u0009\u0009return name === \"input\" && elem.type === type;\n\u0009};\n}\n\n/**\n * Returns a function to use in pseudos for buttons\n * @param {String} type\n */\nfunction createButtonPseudo( type ) {\n\u0009return function( elem ) {\n\u0009\u0009var name = elem.nodeName.toLowerCase();\n\u0009\u0009return (name === \"input\" || name === \"button\") && elem.type === type;\n\u0009};\n}\n\n/**\n * Returns a function to use in pseudos for positionals\n * @param {Function} fn\n */\nfunction createPositionalPseudo( fn ) {\n\u0009return markFunction(function( argument ) {\n\u0009\u0009argument = +argument;\n\u0009\u0009return markFunction(function( seed, matches ) {\n\u0009\u0009\u0009var j,\n\u0009\u0009\u0009\u0009matchIndexes = fn( [], seed.length, argument ),\n\u0009\u0009\u0009\u0009i = matchIndexes.length;\n\n\u0009\u0009\u0009// Match elements found at the specified indexes\n\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009if ( seed[ (j = matchIndexes[i]) ] ) {\n\u0009\u0009\u0009\u0009\u0009seed[j] = !(matches[j] = seed[j]);\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009});\n}\n\n/**\n * Checks a node for validity as a Sizzle context\n * @param {Element|Object=} context\n * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value\n */\nfunction testContext( context ) {\n\u0009return context && typeof context.getElementsByTagName !== \"undefined\" && context;\n}\n\n// Expose support vars for convenience\nsupport = Sizzle.support = {};\n\n/**\n * Detects XML nodes\n * @param {Element|Object} elem An element or a document\n * @returns {Boolean} True iff elem is a non-HTML XML node\n */\nisXML = Sizzle.isXML = function( elem ) {\n\u0009// documentElement is verified for cases where it doesn't yet exist\n\u0009// (such as loading iframes in IE - #4833)\n\u0009var documentElement = elem && (elem.ownerDocument || elem).documentElement;\n\u0009return documentElement ? documentElement.nodeName !== \"HTML\" : false;\n};\n\n/**\n * Sets document-related variables once based on the current document\n * @param {Element|Object} [doc] An element or document object to use to set the document\n * @returns {Object} Returns the current document\n */\nsetDocument = Sizzle.setDocument = function( node ) {\n\u0009var hasCompare, parent,\n\u0009\u0009doc = node ? node.ownerDocument || node : preferredDoc;\n\n\u0009// If no document and documentElement is available, return\n\u0009if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {\n\u0009\u0009return document;\n\u0009}\n\n\u0009// Set our document\n\u0009document = doc;\n\u0009docElem = doc.documentElement;\n\u0009parent = doc.defaultView;\n\n\u0009// Support: IE>8\n\u0009// If iframe document is assigned to \"document\" variable and if iframe has been reloaded,\n\u0009// IE will throw \"permission denied\" error when accessing \"document\" variable, see jQuery #13936\n\u0009// IE6-8 do not support the defaultView property so parent will be undefined\n\u0009if ( parent && parent !== parent.top ) {\n\u0009\u0009// IE11 does not have attachEvent, so all must suffer\n\u0009\u0009if ( parent.addEventListener ) {\n\u0009\u0009\u0009parent.addEventListener( \"unload\", unloadHandler, false );\n\u0009\u0009} else if ( parent.attachEvent ) {\n\u0009\u0009\u0009parent.attachEvent( \"onunload\", unloadHandler );\n\u0009\u0009}\n\u0009}\n\n\u0009/* Support tests\n\u0009---------------------------------------------------------------------- */\n\u0009documentIsHTML = !isXML( doc );\n\n\u0009/* Attributes\n\u0009---------------------------------------------------------------------- */\n\n\u0009// Support: IE<8\n\u0009// Verify that getAttribute really returns attributes and not properties\n\u0009// (excepting IE8 booleans)\n\u0009support.attributes = assert(function( div ) {\n\u0009\u0009div.className = \"i\";\n\u0009\u0009return !div.getAttribute(\"className\");\n\u0009});\n\n\u0009/* getElement(s)By*\n\u0009---------------------------------------------------------------------- */\n\n\u0009// Check if getElementsByTagName(\"*\") returns only elements\n\u0009support.getElementsByTagName = assert(function( div ) {\n\u0009\u0009div.appendChild( doc.createComment(\"\") );\n\u0009\u0009return !div.getElementsByTagName(\"*\").length;\n\u0009});\n\n\u0009// Support: IE<9\n\u0009support.getElementsByClassName = rnative.test( doc.getElementsByClassName );\n\n\u0009// Support: IE<10\n\u0009// Check if getElementById returns elements by name\n\u0009// The broken getElementById methods don't pick up programatically-set names,\n\u0009// so use a roundabout getElementsByName test\n\u0009support.getById = assert(function( div ) {\n\u0009\u0009docElem.appendChild( div ).id = expando;\n\u0009\u0009return !doc.getElementsByName || !doc.getElementsByName( expando ).length;\n\u0009});\n\n\u0009// ID find and filter\n\u0009if ( support.getById ) {\n\u0009\u0009Expr.find[\"ID\"] = function( id, context ) {\n\u0009\u0009\u0009if ( typeof context.getElementById !== \"undefined\" && documentIsHTML ) {\n\u0009\u0009\u0009\u0009var m = context.getElementById( id );\n\u0009\u0009\u0009\u0009// Check parentNode to catch when Blackberry 4.6 returns\n\u0009\u0009\u0009\u0009// nodes that are no longer in the document #6963\n\u0009\u0009\u0009\u0009return m && m.parentNode ? [ m ] : [];\n\u0009\u0009\u0009}\n\u0009\u0009};\n\u0009\u0009Expr.filter[\"ID\"] = function( id ) {\n\u0009\u0009\u0009var attrId = id.replace( runescape, funescape );\n\u0009\u0009\u0009return function( elem ) {\n\u0009\u0009\u0009\u0009return elem.getAttribute(\"id\") === attrId;\n\u0009\u0009\u0009};\n\u0009\u0009};\n\u0009} else {\n\u0009\u0009// Support: IE6/7\n\u0009\u0009// getElementById is not reliable as a find shortcut\n\u0009\u0009delete Expr.find[\"ID\"];\n\n\u0009\u0009Expr.filter[\"ID\"] =  function( id ) {\n\u0009\u0009\u0009var attrId = id.replace( runescape, funescape );\n\u0009\u0009\u0009return function( elem ) {\n\u0009\u0009\u0009\u0009var node = typeof elem.getAttributeNode !== \"undefined\" && elem.getAttributeNode(\"id\");\n\u0009\u0009\u0009\u0009return node && node.value === attrId;\n\u0009\u0009\u0009};\n\u0009\u0009};\n\u0009}\n\n\u0009// Tag\n\u0009Expr.find[\"TAG\"] = support.getElementsByTagName ?\n\u0009\u0009function( tag, context ) {\n\u0009\u0009\u0009if ( typeof context.getElementsByTagName !== \"undefined\" ) {\n\u0009\u0009\u0009\u0009return context.getElementsByTagName( tag );\n\n\u0009\u0009\u0009// DocumentFragment nodes don't have gEBTN\n\u0009\u0009\u0009} else if ( support.qsa ) {\n\u0009\u0009\u0009\u0009return context.querySelectorAll( tag );\n\u0009\u0009\u0009}\n\u0009\u0009} :\n\n\u0009\u0009function( tag, context ) {\n\u0009\u0009\u0009var elem,\n\u0009\u0009\u0009\u0009tmp = [],\n\u0009\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009\u0009// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too\n\u0009\u0009\u0009\u0009results = context.getElementsByTagName( tag );\n\n\u0009\u0009\u0009// Filter out possible comments\n\u0009\u0009\u0009if ( tag === \"*\" ) {\n\u0009\u0009\u0009\u0009while ( (elem = results[i++]) ) {\n\u0009\u0009\u0009\u0009\u0009if ( elem.nodeType === 1 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009tmp.push( elem );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009return tmp;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return results;\n\u0009\u0009};\n\n\u0009// Class\n\u0009Expr.find[\"CLASS\"] = support.getElementsByClassName && function( className, context ) {\n\u0009\u0009if ( documentIsHTML ) {\n\u0009\u0009\u0009return context.getElementsByClassName( className );\n\u0009\u0009}\n\u0009};\n\n\u0009/* QSA/matchesSelector\n\u0009---------------------------------------------------------------------- */\n\n\u0009// QSA and matchesSelector support\n\n\u0009// matchesSelector(:active) reports false when true (IE9/Opera 11.5)\n\u0009rbuggyMatches = [];\n\n\u0009// qSa(:focus) reports false when true (Chrome 21)\n\u0009// We allow this because of a bug in IE8/9 that throws an error\n\u0009// whenever `document.activeElement` is accessed on an iframe\n\u0009// So, we allow :focus to pass through QSA all the time to avoid the IE error\n\u0009// See http://bugs.jquery.com/ticket/13378\n\u0009rbuggyQSA = [];\n\n\u0009if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {\n\u0009\u0009// Build QSA regex\n\u0009\u0009// Regex strategy adopted from Diego Perini\n\u0009\u0009assert(function( div ) {\n\u0009\u0009\u0009// Select is set to empty string on purpose\n\u0009\u0009\u0009// This is to test IE's treatment of not explicitly\n\u0009\u0009\u0009// setting a boolean content attribute,\n\u0009\u0009\u0009// since its presence should be enough\n\u0009\u0009\u0009// http://bugs.jquery.com/ticket/12359\n\u0009\u0009\u0009docElem.appendChild( div ).innerHTML = \"<a id='\" + expando + \"'></a>\" +\n\u0009\u0009\u0009\u0009\"<select id='\" + expando + \"-\\f]' msallowcapture=''>\" +\n\u0009\u0009\u0009\u0009\"<option selected=''></option></select>\";\n\n\u0009\u0009\u0009// Support: IE8, Opera 11-12.16\n\u0009\u0009\u0009// Nothing should be selected when empty strings follow ^= or $= or *=\n\u0009\u0009\u0009// The test attribute must be unknown in Opera but \"safe\" for WinRT\n\u0009\u0009\u0009// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section\n\u0009\u0009\u0009if ( div.querySelectorAll(\"[msallowcapture^='']\").length ) {\n\u0009\u0009\u0009\u0009rbuggyQSA.push( \"[*^$]=\" + whitespace + \"*(?:''|\\\"\\\")\" );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Support: IE8\n\u0009\u0009\u0009// Boolean attributes and \"value\" are not treated correctly\n\u0009\u0009\u0009if ( !div.querySelectorAll(\"[selected]\").length ) {\n\u0009\u0009\u0009\u0009rbuggyQSA.push( \"\\\\[\" + whitespace + \"*(?:value|\" + booleans + \")\" );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Support: Chrome<29, Android<4.2+, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.7+\n\u0009\u0009\u0009if ( !div.querySelectorAll( \"[id~=\" + expando + \"-]\" ).length ) {\n\u0009\u0009\u0009\u0009rbuggyQSA.push(\"~=\");\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Webkit/Opera - :checked should return selected option elements\n\u0009\u0009\u0009// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked\n\u0009\u0009\u0009// IE8 throws error here and will not see later tests\n\u0009\u0009\u0009if ( !div.querySelectorAll(\":checked\").length ) {\n\u0009\u0009\u0009\u0009rbuggyQSA.push(\":checked\");\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Support: Safari 8+, iOS 8+\n\u0009\u0009\u0009// https://bugs.webkit.org/show_bug.cgi?id=136851\n\u0009\u0009\u0009// In-page `selector#id sibing-combinator selector` fails\n\u0009\u0009\u0009if ( !div.querySelectorAll( \"a#\" + expando + \"+*\" ).length ) {\n\u0009\u0009\u0009\u0009rbuggyQSA.push(\".#.+[+~]\");\n\u0009\u0009\u0009}\n\u0009\u0009});\n\n\u0009\u0009assert(function( div ) {\n\u0009\u0009\u0009// Support: Windows 8 Native Apps\n\u0009\u0009\u0009// The type and name attributes are restricted during .innerHTML assignment\n\u0009\u0009\u0009var input = doc.createElement(\"input\");\n\u0009\u0009\u0009input.setAttribute( \"type\", \"hidden\" );\n\u0009\u0009\u0009div.appendChild( input ).setAttribute( \"name\", \"D\" );\n\n\u0009\u0009\u0009// Support: IE8\n\u0009\u0009\u0009// Enforce case-sensitivity of name attribute\n\u0009\u0009\u0009if ( div.querySelectorAll(\"[name=d]\").length ) {\n\u0009\u0009\u0009\u0009rbuggyQSA.push( \"name\" + whitespace + \"*[*^$|!~]?=\" );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)\n\u0009\u0009\u0009// IE8 throws error here and will not see later tests\n\u0009\u0009\u0009if ( !div.querySelectorAll(\":enabled\").length ) {\n\u0009\u0009\u0009\u0009rbuggyQSA.push( \":enabled\", \":disabled\" );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Opera 10-11 does not throw on post-comma invalid pseudos\n\u0009\u0009\u0009div.querySelectorAll(\"*,:x\");\n\u0009\u0009\u0009rbuggyQSA.push(\",.*:\");\n\u0009\u0009});\n\u0009}\n\n\u0009if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||\n\u0009\u0009docElem.webkitMatchesSelector ||\n\u0009\u0009docElem.mozMatchesSelector ||\n\u0009\u0009docElem.oMatchesSelector ||\n\u0009\u0009docElem.msMatchesSelector) )) ) {\n\n\u0009\u0009assert(function( div ) {\n\u0009\u0009\u0009// Check to see if it's possible to do matchesSelector\n\u0009\u0009\u0009// on a disconnected node (IE 9)\n\u0009\u0009\u0009support.disconnectedMatch = matches.call( div, \"div\" );\n\n\u0009\u0009\u0009// This should fail with an exception\n\u0009\u0009\u0009// Gecko does not error, returns false instead\n\u0009\u0009\u0009matches.call( div, \"[s!='']:x\" );\n\u0009\u0009\u0009rbuggyMatches.push( \"!=\", pseudos );\n\u0009\u0009});\n\u0009}\n\n\u0009rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join(\"|\") );\n\u0009rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join(\"|\") );\n\n\u0009/* Contains\n\u0009---------------------------------------------------------------------- */\n\u0009hasCompare = rnative.test( docElem.compareDocumentPosition );\n\n\u0009// Element contains another\n\u0009// Purposefully does not implement inclusive descendent\n\u0009// As in, an element does not contain itself\n\u0009contains = hasCompare || rnative.test( docElem.contains ) ?\n\u0009\u0009function( a, b ) {\n\u0009\u0009\u0009var adown = a.nodeType === 9 ? a.documentElement : a,\n\u0009\u0009\u0009\u0009bup = b && b.parentNode;\n\u0009\u0009\u0009return a === bup || !!( bup && bup.nodeType === 1 && (\n\u0009\u0009\u0009\u0009adown.contains ?\n\u0009\u0009\u0009\u0009\u0009adown.contains( bup ) :\n\u0009\u0009\u0009\u0009\u0009a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16\n\u0009\u0009\u0009));\n\u0009\u0009} :\n\u0009\u0009function( a, b ) {\n\u0009\u0009\u0009if ( b ) {\n\u0009\u0009\u0009\u0009while ( (b = b.parentNode) ) {\n\u0009\u0009\u0009\u0009\u0009if ( b === a ) {\n\u0009\u0009\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return false;\n\u0009\u0009};\n\n\u0009/* Sorting\n\u0009---------------------------------------------------------------------- */\n\n\u0009// Document order sorting\n\u0009sortOrder = hasCompare ?\n\u0009function( a, b ) {\n\n\u0009\u0009// Flag for duplicate removal\n\u0009\u0009if ( a === b ) {\n\u0009\u0009\u0009hasDuplicate = true;\n\u0009\u0009\u0009return 0;\n\u0009\u0009}\n\n\u0009\u0009// Sort on method existence if only one input has compareDocumentPosition\n\u0009\u0009var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;\n\u0009\u0009if ( compare ) {\n\u0009\u0009\u0009return compare;\n\u0009\u0009}\n\n\u0009\u0009// Calculate position if both inputs belong to the same document\n\u0009\u0009compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?\n\u0009\u0009\u0009a.compareDocumentPosition( b ) :\n\n\u0009\u0009\u0009// Otherwise we know they are disconnected\n\u0009\u0009\u00091;\n\n\u0009\u0009// Disconnected nodes\n\u0009\u0009if ( compare & 1 ||\n\u0009\u0009\u0009(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {\n\n\u0009\u0009\u0009// Choose the first element that is related to our preferred document\n\u0009\u0009\u0009if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {\n\u0009\u0009\u0009\u0009return -1;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {\n\u0009\u0009\u0009\u0009return 1;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Maintain original order\n\u0009\u0009\u0009return sortInput ?\n\u0009\u0009\u0009\u0009( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :\n\u0009\u0009\u0009\u00090;\n\u0009\u0009}\n\n\u0009\u0009return compare & 4 ? -1 : 1;\n\u0009} :\n\u0009function( a, b ) {\n\u0009\u0009// Exit early if the nodes are identical\n\u0009\u0009if ( a === b ) {\n\u0009\u0009\u0009hasDuplicate = true;\n\u0009\u0009\u0009return 0;\n\u0009\u0009}\n\n\u0009\u0009var cur,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009aup = a.parentNode,\n\u0009\u0009\u0009bup = b.parentNode,\n\u0009\u0009\u0009ap = [ a ],\n\u0009\u0009\u0009bp = [ b ];\n\n\u0009\u0009// Parentless nodes are either documents or disconnected\n\u0009\u0009if ( !aup || !bup ) {\n\u0009\u0009\u0009return a === doc ? -1 :\n\u0009\u0009\u0009\u0009b === doc ? 1 :\n\u0009\u0009\u0009\u0009aup ? -1 :\n\u0009\u0009\u0009\u0009bup ? 1 :\n\u0009\u0009\u0009\u0009sortInput ?\n\u0009\u0009\u0009\u0009( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :\n\u0009\u0009\u0009\u00090;\n\n\u0009\u0009// If the nodes are siblings, we can do a quick check\n\u0009\u0009} else if ( aup === bup ) {\n\u0009\u0009\u0009return siblingCheck( a, b );\n\u0009\u0009}\n\n\u0009\u0009// Otherwise we need full lists of their ancestors for comparison\n\u0009\u0009cur = a;\n\u0009\u0009while ( (cur = cur.parentNode) ) {\n\u0009\u0009\u0009ap.unshift( cur );\n\u0009\u0009}\n\u0009\u0009cur = b;\n\u0009\u0009while ( (cur = cur.parentNode) ) {\n\u0009\u0009\u0009bp.unshift( cur );\n\u0009\u0009}\n\n\u0009\u0009// Walk down the tree looking for a discrepancy\n\u0009\u0009while ( ap[i] === bp[i] ) {\n\u0009\u0009\u0009i++;\n\u0009\u0009}\n\n\u0009\u0009return i ?\n\u0009\u0009\u0009// Do a sibling check if the nodes have a common ancestor\n\u0009\u0009\u0009siblingCheck( ap[i], bp[i] ) :\n\n\u0009\u0009\u0009// Otherwise nodes in our document sort first\n\u0009\u0009\u0009ap[i] === preferredDoc ? -1 :\n\u0009\u0009\u0009bp[i] === preferredDoc ? 1 :\n\u0009\u0009\u00090;\n\u0009};\n\n\u0009return doc;\n};\n\nSizzle.matches = function( expr, elements ) {\n\u0009return Sizzle( expr, null, null, elements );\n};\n\nSizzle.matchesSelector = function( elem, expr ) {\n\u0009// Set document vars if needed\n\u0009if ( ( elem.ownerDocument || elem ) !== document ) {\n\u0009\u0009setDocument( elem );\n\u0009}\n\n\u0009// Make sure that attribute selectors are quoted\n\u0009expr = expr.replace( rattributeQuotes, \"='$1']\" );\n\n\u0009if ( support.matchesSelector && documentIsHTML &&\n\u0009\u0009( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&\n\u0009\u0009( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {\n\n\u0009\u0009try {\n\u0009\u0009\u0009var ret = matches.call( elem, expr );\n\n\u0009\u0009\u0009// IE 9's matchesSelector returns false on disconnected nodes\n\u0009\u0009\u0009if ( ret || support.disconnectedMatch ||\n\u0009\u0009\u0009\u0009\u0009// As well, disconnected nodes are said to be in a document\n\u0009\u0009\u0009\u0009\u0009// fragment in IE 9\n\u0009\u0009\u0009\u0009\u0009elem.document && elem.document.nodeType !== 11 ) {\n\u0009\u0009\u0009\u0009return ret;\n\u0009\u0009\u0009}\n\u0009\u0009} catch (e) {}\n\u0009}\n\n\u0009return Sizzle( expr, document, null, [ elem ] ).length > 0;\n};\n\nSizzle.contains = function( context, elem ) {\n\u0009// Set document vars if needed\n\u0009if ( ( context.ownerDocument || context ) !== document ) {\n\u0009\u0009setDocument( context );\n\u0009}\n\u0009return contains( context, elem );\n};\n\nSizzle.attr = function( elem, name ) {\n\u0009// Set document vars if needed\n\u0009if ( ( elem.ownerDocument || elem ) !== document ) {\n\u0009\u0009setDocument( elem );\n\u0009}\n\n\u0009var fn = Expr.attrHandle[ name.toLowerCase() ],\n\u0009\u0009// Don't get fooled by Object.prototype properties (jQuery #13807)\n\u0009\u0009val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?\n\u0009\u0009\u0009fn( elem, name, !documentIsHTML ) :\n\u0009\u0009\u0009undefined;\n\n\u0009return val !== undefined ?\n\u0009\u0009val :\n\u0009\u0009support.attributes || !documentIsHTML ?\n\u0009\u0009\u0009elem.getAttribute( name ) :\n\u0009\u0009\u0009(val = elem.getAttributeNode(name)) && val.specified ?\n\u0009\u0009\u0009\u0009val.value :\n\u0009\u0009\u0009\u0009null;\n};\n\nSizzle.error = function( msg ) {\n\u0009throw new Error( \"Syntax error, unrecognized expression: \" + msg );\n};\n\n/**\n * Document sorting and removing duplicates\n * @param {ArrayLike} results\n */\nSizzle.uniqueSort = function( results ) {\n\u0009var elem,\n\u0009\u0009duplicates = [],\n\u0009\u0009j = 0,\n\u0009\u0009i = 0;\n\n\u0009// Unless we *know* we can detect duplicates, assume their presence\n\u0009hasDuplicate = !support.detectDuplicates;\n\u0009sortInput = !support.sortStable && results.slice( 0 );\n\u0009results.sort( sortOrder );\n\n\u0009if ( hasDuplicate ) {\n\u0009\u0009while ( (elem = results[i++]) ) {\n\u0009\u0009\u0009if ( elem === results[ i ] ) {\n\u0009\u0009\u0009\u0009j = duplicates.push( i );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009\u0009while ( j-- ) {\n\u0009\u0009\u0009results.splice( duplicates[ j ], 1 );\n\u0009\u0009}\n\u0009}\n\n\u0009// Clear input after sorting to release objects\n\u0009// See https://github.com/jquery/sizzle/pull/225\n\u0009sortInput = null;\n\n\u0009return results;\n};\n\n/**\n * Utility function for retrieving the text value of an array of DOM nodes\n * @param {Array|Element} elem\n */\ngetText = Sizzle.getText = function( elem ) {\n\u0009var node,\n\u0009\u0009ret = \"\",\n\u0009\u0009i = 0,\n\u0009\u0009nodeType = elem.nodeType;\n\n\u0009if ( !nodeType ) {\n\u0009\u0009// If no nodeType, this is expected to be an array\n\u0009\u0009while ( (node = elem[i++]) ) {\n\u0009\u0009\u0009// Do not traverse comment nodes\n\u0009\u0009\u0009ret += getText( node );\n\u0009\u0009}\n\u0009} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {\n\u0009\u0009// Use textContent for elements\n\u0009\u0009// innerText usage removed for consistency of new lines (jQuery #11153)\n\u0009\u0009if ( typeof elem.textContent === \"string\" ) {\n\u0009\u0009\u0009return elem.textContent;\n\u0009\u0009} else {\n\u0009\u0009\u0009// Traverse its children\n\u0009\u0009\u0009for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {\n\u0009\u0009\u0009\u0009ret += getText( elem );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009} else if ( nodeType === 3 || nodeType === 4 ) {\n\u0009\u0009return elem.nodeValue;\n\u0009}\n\u0009// Do not include comment or processing instruction nodes\n\n\u0009return ret;\n};\n\nExpr = Sizzle.selectors = {\n\n\u0009// Can be adjusted by the user\n\u0009cacheLength: 50,\n\n\u0009createPseudo: markFunction,\n\n\u0009match: matchExpr,\n\n\u0009attrHandle: {},\n\n\u0009find: {},\n\n\u0009relative: {\n\u0009\u0009\">\": { dir: \"parentNode\", first: true },\n\u0009\u0009\" \": { dir: \"parentNode\" },\n\u0009\u0009\"+\": { dir: \"previousSibling\", first: true },\n\u0009\u0009\"~\": { dir: \"previousSibling\" }\n\u0009},\n\n\u0009preFilter: {\n\u0009\u0009\"ATTR\": function( match ) {\n\u0009\u0009\u0009match[1] = match[1].replace( runescape, funescape );\n\n\u0009\u0009\u0009// Move the given value to match[3] whether quoted or unquoted\n\u0009\u0009\u0009match[3] = ( match[3] || match[4] || match[5] || \"\" ).replace( runescape, funescape );\n\n\u0009\u0009\u0009if ( match[2] === \"~=\" ) {\n\u0009\u0009\u0009\u0009match[3] = \" \" + match[3] + \" \";\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return match.slice( 0, 4 );\n\u0009\u0009},\n\n\u0009\u0009\"CHILD\": function( match ) {\n\u0009\u0009\u0009/* matches from matchExpr[\"CHILD\"]\n\u0009\u0009\u0009\u00091 type (only|nth|...)\n\u0009\u0009\u0009\u00092 what (child|of-type)\n\u0009\u0009\u0009\u00093 argument (even|odd|\\d*|\\d*n([+-]\\d+)?|...)\n\u0009\u0009\u0009\u00094 xn-component of xn+y argument ([+-]?\\d*n|)\n\u0009\u0009\u0009\u00095 sign of xn-component\n\u0009\u0009\u0009\u00096 x of xn-component\n\u0009\u0009\u0009\u00097 sign of y-component\n\u0009\u0009\u0009\u00098 y of y-component\n\u0009\u0009\u0009*/\n\u0009\u0009\u0009match[1] = match[1].toLowerCase();\n\n\u0009\u0009\u0009if ( match[1].slice( 0, 3 ) === \"nth\" ) {\n\u0009\u0009\u0009\u0009// nth-* requires argument\n\u0009\u0009\u0009\u0009if ( !match[3] ) {\n\u0009\u0009\u0009\u0009\u0009Sizzle.error( match[0] );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// numeric x and y parameters for Expr.filter.CHILD\n\u0009\u0009\u0009\u0009// remember that false/true cast respectively to 0/1\n\u0009\u0009\u0009\u0009match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === \"even\" || match[3] === \"odd\" ) );\n\u0009\u0009\u0009\u0009match[5] = +( ( match[7] + match[8] ) || match[3] === \"odd\" );\n\n\u0009\u0009\u0009// other types prohibit arguments\n\u0009\u0009\u0009} else if ( match[3] ) {\n\u0009\u0009\u0009\u0009Sizzle.error( match[0] );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return match;\n\u0009\u0009},\n\n\u0009\u0009\"PSEUDO\": function( match ) {\n\u0009\u0009\u0009var excess,\n\u0009\u0009\u0009\u0009unquoted = !match[6] && match[2];\n\n\u0009\u0009\u0009if ( matchExpr[\"CHILD\"].test( match[0] ) ) {\n\u0009\u0009\u0009\u0009return null;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Accept quoted arguments as-is\n\u0009\u0009\u0009if ( match[3] ) {\n\u0009\u0009\u0009\u0009match[2] = match[4] || match[5] || \"\";\n\n\u0009\u0009\u0009// Strip excess characters from unquoted arguments\n\u0009\u0009\u0009} else if ( unquoted && rpseudo.test( unquoted ) &&\n\u0009\u0009\u0009\u0009// Get excess from tokenize (recursively)\n\u0009\u0009\u0009\u0009(excess = tokenize( unquoted, true )) &&\n\u0009\u0009\u0009\u0009// advance to the next closing parenthesis\n\u0009\u0009\u0009\u0009(excess = unquoted.indexOf( \")\", unquoted.length - excess ) - unquoted.length) ) {\n\n\u0009\u0009\u0009\u0009// excess is a negative index\n\u0009\u0009\u0009\u0009match[0] = match[0].slice( 0, excess );\n\u0009\u0009\u0009\u0009match[2] = unquoted.slice( 0, excess );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Return only captures needed by the pseudo filter method (type and argument)\n\u0009\u0009\u0009return match.slice( 0, 3 );\n\u0009\u0009}\n\u0009},\n\n\u0009filter: {\n\n\u0009\u0009\"TAG\": function( nodeNameSelector ) {\n\u0009\u0009\u0009var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();\n\u0009\u0009\u0009return nodeNameSelector === \"*\" ?\n\u0009\u0009\u0009\u0009function() { return true; } :\n\u0009\u0009\u0009\u0009function( elem ) {\n\u0009\u0009\u0009\u0009\u0009return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;\n\u0009\u0009\u0009\u0009};\n\u0009\u0009},\n\n\u0009\u0009\"CLASS\": function( className ) {\n\u0009\u0009\u0009var pattern = classCache[ className + \" \" ];\n\n\u0009\u0009\u0009return pattern ||\n\u0009\u0009\u0009\u0009(pattern = new RegExp( \"(^|\" + whitespace + \")\" + className + \"(\" + whitespace + \"|$)\" )) &&\n\u0009\u0009\u0009\u0009classCache( className, function( elem ) {\n\u0009\u0009\u0009\u0009\u0009return pattern.test( typeof elem.className === \"string\" && elem.className || typeof elem.getAttribute !== \"undefined\" && elem.getAttribute(\"class\") || \"\" );\n\u0009\u0009\u0009\u0009});\n\u0009\u0009},\n\n\u0009\u0009\"ATTR\": function( name, operator, check ) {\n\u0009\u0009\u0009return function( elem ) {\n\u0009\u0009\u0009\u0009var result = Sizzle.attr( elem, name );\n\n\u0009\u0009\u0009\u0009if ( result == null ) {\n\u0009\u0009\u0009\u0009\u0009return operator === \"!=\";\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009if ( !operator ) {\n\u0009\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009result += \"\";\n\n\u0009\u0009\u0009\u0009return operator === \"=\" ? result === check :\n\u0009\u0009\u0009\u0009\u0009operator === \"!=\" ? result !== check :\n\u0009\u0009\u0009\u0009\u0009operator === \"^=\" ? check && result.indexOf( check ) === 0 :\n\u0009\u0009\u0009\u0009\u0009operator === \"*=\" ? check && result.indexOf( check ) > -1 :\n\u0009\u0009\u0009\u0009\u0009operator === \"$=\" ? check && result.slice( -check.length ) === check :\n\u0009\u0009\u0009\u0009\u0009operator === \"~=\" ? ( \" \" + result.replace( rwhitespace, \" \" ) + \" \" ).indexOf( check ) > -1 :\n\u0009\u0009\u0009\u0009\u0009operator === \"|=\" ? result === check || result.slice( 0, check.length + 1 ) === check + \"-\" :\n\u0009\u0009\u0009\u0009\u0009false;\n\u0009\u0009\u0009};\n\u0009\u0009},\n\n\u0009\u0009\"CHILD\": function( type, what, argument, first, last ) {\n\u0009\u0009\u0009var simple = type.slice( 0, 3 ) !== \"nth\",\n\u0009\u0009\u0009\u0009forward = type.slice( -4 ) !== \"last\",\n\u0009\u0009\u0009\u0009ofType = what === \"of-type\";\n\n\u0009\u0009\u0009return first === 1 && last === 0 ?\n\n\u0009\u0009\u0009\u0009// Shortcut for :nth-*(n)\n\u0009\u0009\u0009\u0009function( elem ) {\n\u0009\u0009\u0009\u0009\u0009return !!elem.parentNode;\n\u0009\u0009\u0009\u0009} :\n\n\u0009\u0009\u0009\u0009function( elem, context, xml ) {\n\u0009\u0009\u0009\u0009\u0009var cache, outerCache, node, diff, nodeIndex, start,\n\u0009\u0009\u0009\u0009\u0009\u0009dir = simple !== forward ? \"nextSibling\" : \"previousSibling\",\n\u0009\u0009\u0009\u0009\u0009\u0009parent = elem.parentNode,\n\u0009\u0009\u0009\u0009\u0009\u0009name = ofType && elem.nodeName.toLowerCase(),\n\u0009\u0009\u0009\u0009\u0009\u0009useCache = !xml && !ofType;\n\n\u0009\u0009\u0009\u0009\u0009if ( parent ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009// :(first|last|only)-(child|of-type)\n\u0009\u0009\u0009\u0009\u0009\u0009if ( simple ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009while ( dir ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009node = elem;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009while ( (node = node[ dir ]) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Reverse direction for :only-* (if we haven't yet done so)\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009start = dir = type === \"only\" && !start && \"nextSibling\";\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009start = [ forward ? parent.firstChild : parent.lastChild ];\n\n\u0009\u0009\u0009\u0009\u0009\u0009// non-xml :nth-child(...) stores cache data on `parent`\n\u0009\u0009\u0009\u0009\u0009\u0009if ( forward && useCache ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Seek `elem` from a previously-cached index\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009outerCache = parent[ expando ] || (parent[ expando ] = {});\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009cache = outerCache[ type ] || [];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009nodeIndex = cache[0] === dirruns && cache[1];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009diff = cache[0] === dirruns && cache[2];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009node = nodeIndex && parent.childNodes[ nodeIndex ];\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009while ( (node = ++nodeIndex && node && node[ dir ] ||\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Fallback to seeking `elem` from the start\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009(diff = nodeIndex = 0) || start.pop()) ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// When found, cache indexes on `parent` and break\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( node.nodeType === 1 && ++diff && node === elem ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009outerCache[ type ] = [ dirruns, nodeIndex, diff ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Use previously-cached element index if available\n\u0009\u0009\u0009\u0009\u0009\u0009} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009diff = cache[1];\n\n\u0009\u0009\u0009\u0009\u0009\u0009// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)\n\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Use the same loop as above to seek `elem` from the start\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009while ( (node = ++nodeIndex && node && node[ dir ] ||\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009(diff = nodeIndex = 0) || start.pop()) ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Cache the index of each encountered element\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( useCache ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( node === elem ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Incorporate the offset, then check against cycle size\n\u0009\u0009\u0009\u0009\u0009\u0009diff -= last;\n\u0009\u0009\u0009\u0009\u0009\u0009return diff === first || ( diff % first === 0 && diff / first >= 0 );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009};\n\u0009\u0009},\n\n\u0009\u0009\"PSEUDO\": function( pseudo, argument ) {\n\u0009\u0009\u0009// pseudo-class names are case-insensitive\n\u0009\u0009\u0009// http://www.w3.org/TR/selectors/#pseudo-classes\n\u0009\u0009\u0009// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters\n\u0009\u0009\u0009// Remember that setFilters inherits from pseudos\n\u0009\u0009\u0009var args,\n\u0009\u0009\u0009\u0009fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||\n\u0009\u0009\u0009\u0009\u0009Sizzle.error( \"unsupported pseudo: \" + pseudo );\n\n\u0009\u0009\u0009// The user may use createPseudo to indicate that\n\u0009\u0009\u0009// arguments are needed to create the filter function\n\u0009\u0009\u0009// just as Sizzle does\n\u0009\u0009\u0009if ( fn[ expando ] ) {\n\u0009\u0009\u0009\u0009return fn( argument );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// But maintain support for old signatures\n\u0009\u0009\u0009if ( fn.length > 1 ) {\n\u0009\u0009\u0009\u0009args = [ pseudo, pseudo, \"\", argument ];\n\u0009\u0009\u0009\u0009return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?\n\u0009\u0009\u0009\u0009\u0009markFunction(function( seed, matches ) {\n\u0009\u0009\u0009\u0009\u0009\u0009var idx,\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009matched = fn( seed, argument ),\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009i = matched.length;\n\u0009\u0009\u0009\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009idx = indexOf( seed, matched[i] );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009seed[ idx ] = !( matches[ idx ] = matched[i] );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}) :\n\u0009\u0009\u0009\u0009\u0009function( elem ) {\n\u0009\u0009\u0009\u0009\u0009\u0009return fn( elem, 0, args );\n\u0009\u0009\u0009\u0009\u0009};\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return fn;\n\u0009\u0009}\n\u0009},\n\n\u0009pseudos: {\n\u0009\u0009// Potentially complex pseudos\n\u0009\u0009\"not\": markFunction(function( selector ) {\n\u0009\u0009\u0009// Trim the selector passed to compile\n\u0009\u0009\u0009// to avoid treating leading and trailing\n\u0009\u0009\u0009// spaces as combinators\n\u0009\u0009\u0009var input = [],\n\u0009\u0009\u0009\u0009results = [],\n\u0009\u0009\u0009\u0009matcher = compile( selector.replace( rtrim, \"$1\" ) );\n\n\u0009\u0009\u0009return matcher[ expando ] ?\n\u0009\u0009\u0009\u0009markFunction(function( seed, matches, context, xml ) {\n\u0009\u0009\u0009\u0009\u0009var elem,\n\u0009\u0009\u0009\u0009\u0009\u0009unmatched = matcher( seed, null, xml, [] ),\n\u0009\u0009\u0009\u0009\u0009\u0009i = seed.length;\n\n\u0009\u0009\u0009\u0009\u0009// Match elements unmatched by `matcher`\n\u0009\u0009\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( (elem = unmatched[i]) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009seed[i] = !(matches[i] = elem);\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}) :\n\u0009\u0009\u0009\u0009function( elem, context, xml ) {\n\u0009\u0009\u0009\u0009\u0009input[0] = elem;\n\u0009\u0009\u0009\u0009\u0009matcher( input, null, xml, results );\n\u0009\u0009\u0009\u0009\u0009// Don't keep the element (issue #299)\n\u0009\u0009\u0009\u0009\u0009input[0] = null;\n\u0009\u0009\u0009\u0009\u0009return !results.pop();\n\u0009\u0009\u0009\u0009};\n\u0009\u0009}),\n\n\u0009\u0009\"has\": markFunction(function( selector ) {\n\u0009\u0009\u0009return function( elem ) {\n\u0009\u0009\u0009\u0009return Sizzle( selector, elem ).length > 0;\n\u0009\u0009\u0009};\n\u0009\u0009}),\n\n\u0009\u0009\"contains\": markFunction(function( text ) {\n\u0009\u0009\u0009text = text.replace( runescape, funescape );\n\u0009\u0009\u0009return function( elem ) {\n\u0009\u0009\u0009\u0009return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;\n\u0009\u0009\u0009};\n\u0009\u0009}),\n\n\u0009\u0009// \"Whether an element is represented by a :lang() selector\n\u0009\u0009// is based solely on the element's language value\n\u0009\u0009// being equal to the identifier C,\n\u0009\u0009// or beginning with the identifier C immediately followed by \"-\".\n\u0009\u0009// The matching of C against the element's language value is performed case-insensitively.\n\u0009\u0009// The identifier C does not have to be a valid language name.\"\n\u0009\u0009// http://www.w3.org/TR/selectors/#lang-pseudo\n\u0009\u0009\"lang\": markFunction( function( lang ) {\n\u0009\u0009\u0009// lang value must be a valid identifier\n\u0009\u0009\u0009if ( !ridentifier.test(lang || \"\") ) {\n\u0009\u0009\u0009\u0009Sizzle.error( \"unsupported lang: \" + lang );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009lang = lang.replace( runescape, funescape ).toLowerCase();\n\u0009\u0009\u0009return function( elem ) {\n\u0009\u0009\u0009\u0009var elemLang;\n\u0009\u0009\u0009\u0009do {\n\u0009\u0009\u0009\u0009\u0009if ( (elemLang = documentIsHTML ?\n\u0009\u0009\u0009\u0009\u0009\u0009elem.lang :\n\u0009\u0009\u0009\u0009\u0009\u0009elem.getAttribute(\"xml:lang\") || elem.getAttribute(\"lang\")) ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009elemLang = elemLang.toLowerCase();\n\u0009\u0009\u0009\u0009\u0009\u0009return elemLang === lang || elemLang.indexOf( lang + \"-\" ) === 0;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009} while ( (elem = elem.parentNode) && elem.nodeType === 1 );\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009};\n\u0009\u0009}),\n\n\u0009\u0009// Miscellaneous\n\u0009\u0009\"target\": function( elem ) {\n\u0009\u0009\u0009var hash = window.location && window.location.hash;\n\u0009\u0009\u0009return hash && hash.slice( 1 ) === elem.id;\n\u0009\u0009},\n\n\u0009\u0009\"root\": function( elem ) {\n\u0009\u0009\u0009return elem === docElem;\n\u0009\u0009},\n\n\u0009\u0009\"focus\": function( elem ) {\n\u0009\u0009\u0009return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);\n\u0009\u0009},\n\n\u0009\u0009// Boolean properties\n\u0009\u0009\"enabled\": function( elem ) {\n\u0009\u0009\u0009return elem.disabled === false;\n\u0009\u0009},\n\n\u0009\u0009\"disabled\": function( elem ) {\n\u0009\u0009\u0009return elem.disabled === true;\n\u0009\u0009},\n\n\u0009\u0009\"checked\": function( elem ) {\n\u0009\u0009\u0009// In CSS3, :checked should return both checked and selected elements\n\u0009\u0009\u0009// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked\n\u0009\u0009\u0009var nodeName = elem.nodeName.toLowerCase();\n\u0009\u0009\u0009return (nodeName === \"input\" && !!elem.checked) || (nodeName === \"option\" && !!elem.selected);\n\u0009\u0009},\n\n\u0009\u0009\"selected\": function( elem ) {\n\u0009\u0009\u0009// Accessing this property makes selected-by-default\n\u0009\u0009\u0009// options in Safari work properly\n\u0009\u0009\u0009if ( elem.parentNode ) {\n\u0009\u0009\u0009\u0009elem.parentNode.selectedIndex;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return elem.selected === true;\n\u0009\u0009},\n\n\u0009\u0009// Contents\n\u0009\u0009\"empty\": function( elem ) {\n\u0009\u0009\u0009// http://www.w3.org/TR/selectors/#empty-pseudo\n\u0009\u0009\u0009// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),\n\u0009\u0009\u0009//   but not by others (comment: 8; processing instruction: 7; etc.)\n\u0009\u0009\u0009// nodeType < 6 works because attributes (2) do not appear as children\n\u0009\u0009\u0009for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {\n\u0009\u0009\u0009\u0009if ( elem.nodeType < 6 ) {\n\u0009\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return true;\n\u0009\u0009},\n\n\u0009\u0009\"parent\": function( elem ) {\n\u0009\u0009\u0009return !Expr.pseudos[\"empty\"]( elem );\n\u0009\u0009},\n\n\u0009\u0009// Element/input types\n\u0009\u0009\"header\": function( elem ) {\n\u0009\u0009\u0009return rheader.test( elem.nodeName );\n\u0009\u0009},\n\n\u0009\u0009\"input\": function( elem ) {\n\u0009\u0009\u0009return rinputs.test( elem.nodeName );\n\u0009\u0009},\n\n\u0009\u0009\"button\": function( elem ) {\n\u0009\u0009\u0009var name = elem.nodeName.toLowerCase();\n\u0009\u0009\u0009return name === \"input\" && elem.type === \"button\" || name === \"button\";\n\u0009\u0009},\n\n\u0009\u0009\"text\": function( elem ) {\n\u0009\u0009\u0009var attr;\n\u0009\u0009\u0009return elem.nodeName.toLowerCase() === \"input\" &&\n\u0009\u0009\u0009\u0009elem.type === \"text\" &&\n\n\u0009\u0009\u0009\u0009// Support: IE<8\n\u0009\u0009\u0009\u0009// New HTML5 attribute values (e.g., \"search\") appear with elem.type === \"text\"\n\u0009\u0009\u0009\u0009( (attr = elem.getAttribute(\"type\")) == null || attr.toLowerCase() === \"text\" );\n\u0009\u0009},\n\n\u0009\u0009// Position-in-collection\n\u0009\u0009\"first\": createPositionalPseudo(function() {\n\u0009\u0009\u0009return [ 0 ];\n\u0009\u0009}),\n\n\u0009\u0009\"last\": createPositionalPseudo(function( matchIndexes, length ) {\n\u0009\u0009\u0009return [ length - 1 ];\n\u0009\u0009}),\n\n\u0009\u0009\"eq\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\u0009\u0009\u0009return [ argument < 0 ? argument + length : argument ];\n\u0009\u0009}),\n\n\u0009\u0009\"even\": createPositionalPseudo(function( matchIndexes, length ) {\n\u0009\u0009\u0009var i = 0;\n\u0009\u0009\u0009for ( ; i < length; i += 2 ) {\n\u0009\u0009\u0009\u0009matchIndexes.push( i );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return matchIndexes;\n\u0009\u0009}),\n\n\u0009\u0009\"odd\": createPositionalPseudo(function( matchIndexes, length ) {\n\u0009\u0009\u0009var i = 1;\n\u0009\u0009\u0009for ( ; i < length; i += 2 ) {\n\u0009\u0009\u0009\u0009matchIndexes.push( i );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return matchIndexes;\n\u0009\u0009}),\n\n\u0009\u0009\"lt\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\u0009\u0009\u0009var i = argument < 0 ? argument + length : argument;\n\u0009\u0009\u0009for ( ; --i >= 0; ) {\n\u0009\u0009\u0009\u0009matchIndexes.push( i );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return matchIndexes;\n\u0009\u0009}),\n\n\u0009\u0009\"gt\": createPositionalPseudo(function( matchIndexes, length, argument ) {\n\u0009\u0009\u0009var i = argument < 0 ? argument + length : argument;\n\u0009\u0009\u0009for ( ; ++i < length; ) {\n\u0009\u0009\u0009\u0009matchIndexes.push( i );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return matchIndexes;\n\u0009\u0009})\n\u0009}\n};\n\nExpr.pseudos[\"nth\"] = Expr.pseudos[\"eq\"];\n\n// Add button/input type pseudos\nfor ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {\n\u0009Expr.pseudos[ i ] = createInputPseudo( i );\n}\nfor ( i in { submit: true, reset: true } ) {\n\u0009Expr.pseudos[ i ] = createButtonPseudo( i );\n}\n\n// Easy API for creating new setFilters\nfunction setFilters() {}\nsetFilters.prototype = Expr.filters = Expr.pseudos;\nExpr.setFilters = new setFilters();\n\ntokenize = Sizzle.tokenize = function( selector, parseOnly ) {\n\u0009var matched, match, tokens, type,\n\u0009\u0009soFar, groups, preFilters,\n\u0009\u0009cached = tokenCache[ selector + \" \" ];\n\n\u0009if ( cached ) {\n\u0009\u0009return parseOnly ? 0 : cached.slice( 0 );\n\u0009}\n\n\u0009soFar = selector;\n\u0009groups = [];\n\u0009preFilters = Expr.preFilter;\n\n\u0009while ( soFar ) {\n\n\u0009\u0009// Comma and first run\n\u0009\u0009if ( !matched || (match = rcomma.exec( soFar )) ) {\n\u0009\u0009\u0009if ( match ) {\n\u0009\u0009\u0009\u0009// Don't consume trailing commas as valid\n\u0009\u0009\u0009\u0009soFar = soFar.slice( match[0].length ) || soFar;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009groups.push( (tokens = []) );\n\u0009\u0009}\n\n\u0009\u0009matched = false;\n\n\u0009\u0009// Combinators\n\u0009\u0009if ( (match = rcombinators.exec( soFar )) ) {\n\u0009\u0009\u0009matched = match.shift();\n\u0009\u0009\u0009tokens.push({\n\u0009\u0009\u0009\u0009value: matched,\n\u0009\u0009\u0009\u0009// Cast descendant combinators to space\n\u0009\u0009\u0009\u0009type: match[0].replace( rtrim, \" \" )\n\u0009\u0009\u0009});\n\u0009\u0009\u0009soFar = soFar.slice( matched.length );\n\u0009\u0009}\n\n\u0009\u0009// Filters\n\u0009\u0009for ( type in Expr.filter ) {\n\u0009\u0009\u0009if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||\n\u0009\u0009\u0009\u0009(match = preFilters[ type ]( match ))) ) {\n\u0009\u0009\u0009\u0009matched = match.shift();\n\u0009\u0009\u0009\u0009tokens.push({\n\u0009\u0009\u0009\u0009\u0009value: matched,\n\u0009\u0009\u0009\u0009\u0009type: type,\n\u0009\u0009\u0009\u0009\u0009matches: match\n\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009soFar = soFar.slice( matched.length );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009if ( !matched ) {\n\u0009\u0009\u0009break;\n\u0009\u0009}\n\u0009}\n\n\u0009// Return the length of the invalid excess\n\u0009// if we're just parsing\n\u0009// Otherwise, throw an error or return tokens\n\u0009return parseOnly ?\n\u0009\u0009soFar.length :\n\u0009\u0009soFar ?\n\u0009\u0009\u0009Sizzle.error( selector ) :\n\u0009\u0009\u0009// Cache the tokens\n\u0009\u0009\u0009tokenCache( selector, groups ).slice( 0 );\n};\n\nfunction toSelector( tokens ) {\n\u0009var i = 0,\n\u0009\u0009len = tokens.length,\n\u0009\u0009selector = \"\";\n\u0009for ( ; i < len; i++ ) {\n\u0009\u0009selector += tokens[i].value;\n\u0009}\n\u0009return selector;\n}\n\nfunction addCombinator( matcher, combinator, base ) {\n\u0009var dir = combinator.dir,\n\u0009\u0009checkNonElements = base && dir === \"parentNode\",\n\u0009\u0009doneName = done++;\n\n\u0009return combinator.first ?\n\u0009\u0009// Check against closest ancestor/preceding element\n\u0009\u0009function( elem, context, xml ) {\n\u0009\u0009\u0009while ( (elem = elem[ dir ]) ) {\n\u0009\u0009\u0009\u0009if ( elem.nodeType === 1 || checkNonElements ) {\n\u0009\u0009\u0009\u0009\u0009return matcher( elem, context, xml );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009} :\n\n\u0009\u0009// Check against all ancestor/preceding elements\n\u0009\u0009function( elem, context, xml ) {\n\u0009\u0009\u0009var oldCache, outerCache,\n\u0009\u0009\u0009\u0009newCache = [ dirruns, doneName ];\n\n\u0009\u0009\u0009// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching\n\u0009\u0009\u0009if ( xml ) {\n\u0009\u0009\u0009\u0009while ( (elem = elem[ dir ]) ) {\n\u0009\u0009\u0009\u0009\u0009if ( elem.nodeType === 1 || checkNonElements ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( matcher( elem, context, xml ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009while ( (elem = elem[ dir ]) ) {\n\u0009\u0009\u0009\u0009\u0009if ( elem.nodeType === 1 || checkNonElements ) {\n\u0009\u0009\u0009\u0009\u0009\u0009outerCache = elem[ expando ] || (elem[ expando ] = {});\n\u0009\u0009\u0009\u0009\u0009\u0009if ( (oldCache = outerCache[ dir ]) &&\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Assign to newCache so results back-propagate to previous elements\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return (newCache[ 2 ] = oldCache[ 2 ]);\n\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Reuse newcache so results back-propagate to previous elements\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009outerCache[ dir ] = newCache;\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// A match means we're done; a fail means we have to keep checking\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009};\n}\n\nfunction elementMatcher( matchers ) {\n\u0009return matchers.length > 1 ?\n\u0009\u0009function( elem, context, xml ) {\n\u0009\u0009\u0009var i = matchers.length;\n\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009if ( !matchers[i]( elem, context, xml ) ) {\n\u0009\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return true;\n\u0009\u0009} :\n\u0009\u0009matchers[0];\n}\n\nfunction multipleContexts( selector, contexts, results ) {\n\u0009var i = 0,\n\u0009\u0009len = contexts.length;\n\u0009for ( ; i < len; i++ ) {\n\u0009\u0009Sizzle( selector, contexts[i], results );\n\u0009}\n\u0009return results;\n}\n\nfunction condense( unmatched, map, filter, context, xml ) {\n\u0009var elem,\n\u0009\u0009newUnmatched = [],\n\u0009\u0009i = 0,\n\u0009\u0009len = unmatched.length,\n\u0009\u0009mapped = map != null;\n\n\u0009for ( ; i < len; i++ ) {\n\u0009\u0009if ( (elem = unmatched[i]) ) {\n\u0009\u0009\u0009if ( !filter || filter( elem, context, xml ) ) {\n\u0009\u0009\u0009\u0009newUnmatched.push( elem );\n\u0009\u0009\u0009\u0009if ( mapped ) {\n\u0009\u0009\u0009\u0009\u0009map.push( i );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009return newUnmatched;\n}\n\nfunction setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {\n\u0009if ( postFilter && !postFilter[ expando ] ) {\n\u0009\u0009postFilter = setMatcher( postFilter );\n\u0009}\n\u0009if ( postFinder && !postFinder[ expando ] ) {\n\u0009\u0009postFinder = setMatcher( postFinder, postSelector );\n\u0009}\n\u0009return markFunction(function( seed, results, context, xml ) {\n\u0009\u0009var temp, i, elem,\n\u0009\u0009\u0009preMap = [],\n\u0009\u0009\u0009postMap = [],\n\u0009\u0009\u0009preexisting = results.length,\n\n\u0009\u0009\u0009// Get initial elements from seed or context\n\u0009\u0009\u0009elems = seed || multipleContexts( selector || \"*\", context.nodeType ? [ context ] : context, [] ),\n\n\u0009\u0009\u0009// Prefilter to get matcher input, preserving a map for seed-results synchronization\n\u0009\u0009\u0009matcherIn = preFilter && ( seed || !selector ) ?\n\u0009\u0009\u0009\u0009condense( elems, preMap, preFilter, context, xml ) :\n\u0009\u0009\u0009\u0009elems,\n\n\u0009\u0009\u0009matcherOut = matcher ?\n\u0009\u0009\u0009\u0009// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,\n\u0009\u0009\u0009\u0009postFinder || ( seed ? preFilter : preexisting || postFilter ) ?\n\n\u0009\u0009\u0009\u0009\u0009// ...intermediate processing is necessary\n\u0009\u0009\u0009\u0009\u0009[] :\n\n\u0009\u0009\u0009\u0009\u0009// ...otherwise use results directly\n\u0009\u0009\u0009\u0009\u0009results :\n\u0009\u0009\u0009\u0009matcherIn;\n\n\u0009\u0009// Find primary matches\n\u0009\u0009if ( matcher ) {\n\u0009\u0009\u0009matcher( matcherIn, matcherOut, context, xml );\n\u0009\u0009}\n\n\u0009\u0009// Apply postFilter\n\u0009\u0009if ( postFilter ) {\n\u0009\u0009\u0009temp = condense( matcherOut, postMap );\n\u0009\u0009\u0009postFilter( temp, [], context, xml );\n\n\u0009\u0009\u0009// Un-match failing elements by moving them back to matcherIn\n\u0009\u0009\u0009i = temp.length;\n\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009if ( (elem = temp[i]) ) {\n\u0009\u0009\u0009\u0009\u0009matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009if ( seed ) {\n\u0009\u0009\u0009if ( postFinder || preFilter ) {\n\u0009\u0009\u0009\u0009if ( postFinder ) {\n\u0009\u0009\u0009\u0009\u0009// Get the final matcherOut by condensing this intermediate into postFinder contexts\n\u0009\u0009\u0009\u0009\u0009temp = [];\n\u0009\u0009\u0009\u0009\u0009i = matcherOut.length;\n\u0009\u0009\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( (elem = matcherOut[i]) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Restore matcherIn since elem is not yet a final match\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009temp.push( (matcherIn[i] = elem) );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009postFinder( null, (matcherOut = []), temp, xml );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Move matched elements from seed to results to keep them synchronized\n\u0009\u0009\u0009\u0009i = matcherOut.length;\n\u0009\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009\u0009if ( (elem = matcherOut[i]) &&\n\u0009\u0009\u0009\u0009\u0009\u0009(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009seed[temp] = !(results[temp] = elem);\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009// Add elements to results, through postFinder if defined\n\u0009\u0009} else {\n\u0009\u0009\u0009matcherOut = condense(\n\u0009\u0009\u0009\u0009matcherOut === results ?\n\u0009\u0009\u0009\u0009\u0009matcherOut.splice( preexisting, matcherOut.length ) :\n\u0009\u0009\u0009\u0009\u0009matcherOut\n\u0009\u0009\u0009);\n\u0009\u0009\u0009if ( postFinder ) {\n\u0009\u0009\u0009\u0009postFinder( null, results, matcherOut, xml );\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009push.apply( results, matcherOut );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009});\n}\n\nfunction matcherFromTokens( tokens ) {\n\u0009var checkContext, matcher, j,\n\u0009\u0009len = tokens.length,\n\u0009\u0009leadingRelative = Expr.relative[ tokens[0].type ],\n\u0009\u0009implicitRelative = leadingRelative || Expr.relative[\" \"],\n\u0009\u0009i = leadingRelative ? 1 : 0,\n\n\u0009\u0009// The foundational matcher ensures that elements are reachable from top-level context(s)\n\u0009\u0009matchContext = addCombinator( function( elem ) {\n\u0009\u0009\u0009return elem === checkContext;\n\u0009\u0009}, implicitRelative, true ),\n\u0009\u0009matchAnyContext = addCombinator( function( elem ) {\n\u0009\u0009\u0009return indexOf( checkContext, elem ) > -1;\n\u0009\u0009}, implicitRelative, true ),\n\u0009\u0009matchers = [ function( elem, context, xml ) {\n\u0009\u0009\u0009var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (\n\u0009\u0009\u0009\u0009(checkContext = context).nodeType ?\n\u0009\u0009\u0009\u0009\u0009matchContext( elem, context, xml ) :\n\u0009\u0009\u0009\u0009\u0009matchAnyContext( elem, context, xml ) );\n\u0009\u0009\u0009// Avoid hanging onto element (issue #299)\n\u0009\u0009\u0009checkContext = null;\n\u0009\u0009\u0009return ret;\n\u0009\u0009} ];\n\n\u0009for ( ; i < len; i++ ) {\n\u0009\u0009if ( (matcher = Expr.relative[ tokens[i].type ]) ) {\n\u0009\u0009\u0009matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];\n\u0009\u0009} else {\n\u0009\u0009\u0009matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );\n\n\u0009\u0009\u0009// Return special upon seeing a positional matcher\n\u0009\u0009\u0009if ( matcher[ expando ] ) {\n\u0009\u0009\u0009\u0009// Find the next relative operator (if any) for proper handling\n\u0009\u0009\u0009\u0009j = ++i;\n\u0009\u0009\u0009\u0009for ( ; j < len; j++ ) {\n\u0009\u0009\u0009\u0009\u0009if ( Expr.relative[ tokens[j].type ] ) {\n\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return setMatcher(\n\u0009\u0009\u0009\u0009\u0009i > 1 && elementMatcher( matchers ),\n\u0009\u0009\u0009\u0009\u0009i > 1 && toSelector(\n\u0009\u0009\u0009\u0009\u0009\u0009// If the preceding token was a descendant combinator, insert an implicit any-element `*`\n\u0009\u0009\u0009\u0009\u0009\u0009tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === \" \" ? \"*\" : \"\" })\n\u0009\u0009\u0009\u0009\u0009).replace( rtrim, \"$1\" ),\n\u0009\u0009\u0009\u0009\u0009matcher,\n\u0009\u0009\u0009\u0009\u0009i < j && matcherFromTokens( tokens.slice( i, j ) ),\n\u0009\u0009\u0009\u0009\u0009j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),\n\u0009\u0009\u0009\u0009\u0009j < len && toSelector( tokens )\n\u0009\u0009\u0009\u0009);\n\u0009\u0009\u0009}\n\u0009\u0009\u0009matchers.push( matcher );\n\u0009\u0009}\n\u0009}\n\n\u0009return elementMatcher( matchers );\n}\n\nfunction matcherFromGroupMatchers( elementMatchers, setMatchers ) {\n\u0009var bySet = setMatchers.length > 0,\n\u0009\u0009byElement = elementMatchers.length > 0,\n\u0009\u0009superMatcher = function( seed, context, xml, results, outermost ) {\n\u0009\u0009\u0009var elem, j, matcher,\n\u0009\u0009\u0009\u0009matchedCount = 0,\n\u0009\u0009\u0009\u0009i = \"0\",\n\u0009\u0009\u0009\u0009unmatched = seed && [],\n\u0009\u0009\u0009\u0009setMatched = [],\n\u0009\u0009\u0009\u0009contextBackup = outermostContext,\n\u0009\u0009\u0009\u0009// We must always have either seed elements or outermost context\n\u0009\u0009\u0009\u0009elems = seed || byElement && Expr.find[\"TAG\"]( \"*\", outermost ),\n\u0009\u0009\u0009\u0009// Use integer dirruns iff this is the outermost matcher\n\u0009\u0009\u0009\u0009dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),\n\u0009\u0009\u0009\u0009len = elems.length;\n\n\u0009\u0009\u0009if ( outermost ) {\n\u0009\u0009\u0009\u0009outermostContext = context !== document && context;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Add elements passing elementMatchers directly to results\n\u0009\u0009\u0009// Keep `i` a string if there are no elements so `matchedCount` will be \"00\" below\n\u0009\u0009\u0009// Support: IE<9, Safari\n\u0009\u0009\u0009// Tolerate NodeList properties (IE: \"length\"; Safari: <number>) matching elements by id\n\u0009\u0009\u0009for ( ; i !== len && (elem = elems[i]) != null; i++ ) {\n\u0009\u0009\u0009\u0009if ( byElement && elem ) {\n\u0009\u0009\u0009\u0009\u0009j = 0;\n\u0009\u0009\u0009\u0009\u0009while ( (matcher = elementMatchers[j++]) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( matcher( elem, context, xml ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009results.push( elem );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009if ( outermost ) {\n\u0009\u0009\u0009\u0009\u0009\u0009dirruns = dirrunsUnique;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Track unmatched elements for set filters\n\u0009\u0009\u0009\u0009if ( bySet ) {\n\u0009\u0009\u0009\u0009\u0009// They will have gone through all possible matchers\n\u0009\u0009\u0009\u0009\u0009if ( (elem = !matcher && elem) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009matchedCount--;\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Lengthen the array for every element, matched or not\n\u0009\u0009\u0009\u0009\u0009if ( seed ) {\n\u0009\u0009\u0009\u0009\u0009\u0009unmatched.push( elem );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Apply set filters to unmatched elements\n\u0009\u0009\u0009matchedCount += i;\n\u0009\u0009\u0009if ( bySet && i !== matchedCount ) {\n\u0009\u0009\u0009\u0009j = 0;\n\u0009\u0009\u0009\u0009while ( (matcher = setMatchers[j++]) ) {\n\u0009\u0009\u0009\u0009\u0009matcher( unmatched, setMatched, context, xml );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009if ( seed ) {\n\u0009\u0009\u0009\u0009\u0009// Reintegrate element matches to eliminate the need for sorting\n\u0009\u0009\u0009\u0009\u0009if ( matchedCount > 0 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( !(unmatched[i] || setMatched[i]) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009setMatched[i] = pop.call( results );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Discard index placeholder values to get only actual matches\n\u0009\u0009\u0009\u0009\u0009setMatched = condense( setMatched );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Add matches to results\n\u0009\u0009\u0009\u0009push.apply( results, setMatched );\n\n\u0009\u0009\u0009\u0009// Seedless set matches succeeding multiple successful matchers stipulate sorting\n\u0009\u0009\u0009\u0009if ( outermost && !seed && setMatched.length > 0 &&\n\u0009\u0009\u0009\u0009\u0009( matchedCount + setMatchers.length ) > 1 ) {\n\n\u0009\u0009\u0009\u0009\u0009Sizzle.uniqueSort( results );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Override manipulation of globals by nested matchers\n\u0009\u0009\u0009if ( outermost ) {\n\u0009\u0009\u0009\u0009dirruns = dirrunsUnique;\n\u0009\u0009\u0009\u0009outermostContext = contextBackup;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return unmatched;\n\u0009\u0009};\n\n\u0009return bySet ?\n\u0009\u0009markFunction( superMatcher ) :\n\u0009\u0009superMatcher;\n}\n\ncompile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {\n\u0009var i,\n\u0009\u0009setMatchers = [],\n\u0009\u0009elementMatchers = [],\n\u0009\u0009cached = compilerCache[ selector + \" \" ];\n\n\u0009if ( !cached ) {\n\u0009\u0009// Generate a function of recursive functions that can be used to check each element\n\u0009\u0009if ( !match ) {\n\u0009\u0009\u0009match = tokenize( selector );\n\u0009\u0009}\n\u0009\u0009i = match.length;\n\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009cached = matcherFromTokens( match[i] );\n\u0009\u0009\u0009if ( cached[ expando ] ) {\n\u0009\u0009\u0009\u0009setMatchers.push( cached );\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009elementMatchers.push( cached );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Cache the compiled function\n\u0009\u0009cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );\n\n\u0009\u0009// Save selector and tokenization\n\u0009\u0009cached.selector = selector;\n\u0009}\n\u0009return cached;\n};\n\n/**\n * A low-level selection function that works with Sizzle's compiled\n *  selector functions\n * @param {String|Function} selector A selector or a pre-compiled\n *  selector function built with Sizzle.compile\n * @param {Element} context\n * @param {Array} [results]\n * @param {Array} [seed] A set of elements to match against\n */\nselect = Sizzle.select = function( selector, context, results, seed ) {\n\u0009var i, tokens, token, type, find,\n\u0009\u0009compiled = typeof selector === \"function\" && selector,\n\u0009\u0009match = !seed && tokenize( (selector = compiled.selector || selector) );\n\n\u0009results = results || [];\n\n\u0009// Try to minimize operations if there is no seed and only one group\n\u0009if ( match.length === 1 ) {\n\n\u0009\u0009// Take a shortcut and set the context if the root selector is an ID\n\u0009\u0009tokens = match[0] = match[0].slice( 0 );\n\u0009\u0009if ( tokens.length > 2 && (token = tokens[0]).type === \"ID\" &&\n\u0009\u0009\u0009\u0009support.getById && context.nodeType === 9 && documentIsHTML &&\n\u0009\u0009\u0009\u0009Expr.relative[ tokens[1].type ] ) {\n\n\u0009\u0009\u0009context = ( Expr.find[\"ID\"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];\n\u0009\u0009\u0009if ( !context ) {\n\u0009\u0009\u0009\u0009return results;\n\n\u0009\u0009\u0009// Precompiled matchers will still verify ancestry, so step up a level\n\u0009\u0009\u0009} else if ( compiled ) {\n\u0009\u0009\u0009\u0009context = context.parentNode;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009selector = selector.slice( tokens.shift().value.length );\n\u0009\u0009}\n\n\u0009\u0009// Fetch a seed set for right-to-left matching\n\u0009\u0009i = matchExpr[\"needsContext\"].test( selector ) ? 0 : tokens.length;\n\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009token = tokens[i];\n\n\u0009\u0009\u0009// Abort if we hit a combinator\n\u0009\u0009\u0009if ( Expr.relative[ (type = token.type) ] ) {\n\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009if ( (find = Expr.find[ type ]) ) {\n\u0009\u0009\u0009\u0009// Search, expanding context for leading sibling combinators\n\u0009\u0009\u0009\u0009if ( (seed = find(\n\u0009\u0009\u0009\u0009\u0009token.matches[0].replace( runescape, funescape ),\n\u0009\u0009\u0009\u0009\u0009rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context\n\u0009\u0009\u0009\u0009)) ) {\n\n\u0009\u0009\u0009\u0009\u0009// If seed is empty or no tokens remain, we can return early\n\u0009\u0009\u0009\u0009\u0009tokens.splice( i, 1 );\n\u0009\u0009\u0009\u0009\u0009selector = seed.length && toSelector( tokens );\n\u0009\u0009\u0009\u0009\u0009if ( !selector ) {\n\u0009\u0009\u0009\u0009\u0009\u0009push.apply( results, seed );\n\u0009\u0009\u0009\u0009\u0009\u0009return results;\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009// Compile and execute a filtering function if one is not provided\n\u0009// Provide `match` to avoid retokenization if we modified the selector above\n\u0009( compiled || compile( selector, match ) )(\n\u0009\u0009seed,\n\u0009\u0009context,\n\u0009\u0009!documentIsHTML,\n\u0009\u0009results,\n\u0009\u0009rsibling.test( selector ) && testContext( context.parentNode ) || context\n\u0009);\n\u0009return results;\n};\n\n// One-time assignments\n\n// Sort stability\nsupport.sortStable = expando.split(\"\").sort( sortOrder ).join(\"\") === expando;\n\n// Support: Chrome 14-35+\n// Always assume duplicates if they aren't passed to the comparison function\nsupport.detectDuplicates = !!hasDuplicate;\n\n// Initialize against the default document\nsetDocument();\n\n// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)\n// Detached nodes confoundingly follow *each other*\nsupport.sortDetached = assert(function( div1 ) {\n\u0009// Should return 1, but returns 4 (following)\n\u0009return div1.compareDocumentPosition( document.createElement(\"div\") ) & 1;\n});\n\n// Support: IE<8\n// Prevent attribute/property \"interpolation\"\n// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx\nif ( !assert(function( div ) {\n\u0009div.innerHTML = \"<a href='#'></a>\";\n\u0009return div.firstChild.getAttribute(\"href\") === \"#\" ;\n}) ) {\n\u0009addHandle( \"type|href|height|width\", function( elem, name, isXML ) {\n\u0009\u0009if ( !isXML ) {\n\u0009\u0009\u0009return elem.getAttribute( name, name.toLowerCase() === \"type\" ? 1 : 2 );\n\u0009\u0009}\n\u0009});\n}\n\n// Support: IE<9\n// Use defaultValue in place of getAttribute(\"value\")\nif ( !support.attributes || !assert(function( div ) {\n\u0009div.innerHTML = \"<input/>\";\n\u0009div.firstChild.setAttribute( \"value\", \"\" );\n\u0009return div.firstChild.getAttribute( \"value\" ) === \"\";\n}) ) {\n\u0009addHandle( \"value\", function( elem, name, isXML ) {\n\u0009\u0009if ( !isXML && elem.nodeName.toLowerCase() === \"input\" ) {\n\u0009\u0009\u0009return elem.defaultValue;\n\u0009\u0009}\n\u0009});\n}\n\n// Support: IE<9\n// Use getAttributeNode to fetch booleans when getAttribute lies\nif ( !assert(function( div ) {\n\u0009return div.getAttribute(\"disabled\") == null;\n}) ) {\n\u0009addHandle( booleans, function( elem, name, isXML ) {\n\u0009\u0009var val;\n\u0009\u0009if ( !isXML ) {\n\u0009\u0009\u0009return elem[ name ] === true ? name.toLowerCase() :\n\u0009\u0009\u0009\u0009\u0009(val = elem.getAttributeNode( name )) && val.specified ?\n\u0009\u0009\u0009\u0009\u0009val.value :\n\u0009\u0009\u0009\u0009null;\n\u0009\u0009}\n\u0009});\n}\n\nreturn Sizzle;\n\n})( window );\n\n\n\njQuery.find = Sizzle;\njQuery.expr = Sizzle.selectors;\njQuery.expr[\":\"] = jQuery.expr.pseudos;\njQuery.unique = Sizzle.uniqueSort;\njQuery.text = Sizzle.getText;\njQuery.isXMLDoc = Sizzle.isXML;\njQuery.contains = Sizzle.contains;\n\n\n\nvar rneedsContext = jQuery.expr.match.needsContext;\n\nvar rsingleTag = (/^<(\\w+)\\s*\\/?>(?:<\\/\\1>|)$/);\n\n\n\nvar risSimple = /^.[^:#\\[\\.,]*$/;\n\n// Implement the identical functionality for filter and not\nfunction winnow( elements, qualifier, not ) {\n\u0009if ( jQuery.isFunction( qualifier ) ) {\n\u0009\u0009return jQuery.grep( elements, function( elem, i ) {\n\u0009\u0009\u0009/* jshint -W018 */\n\u0009\u0009\u0009return !!qualifier.call( elem, i, elem ) !== not;\n\u0009\u0009});\n\n\u0009}\n\n\u0009if ( qualifier.nodeType ) {\n\u0009\u0009return jQuery.grep( elements, function( elem ) {\n\u0009\u0009\u0009return ( elem === qualifier ) !== not;\n\u0009\u0009});\n\n\u0009}\n\n\u0009if ( typeof qualifier === \"string\" ) {\n\u0009\u0009if ( risSimple.test( qualifier ) ) {\n\u0009\u0009\u0009return jQuery.filter( qualifier, elements, not );\n\u0009\u0009}\n\n\u0009\u0009qualifier = jQuery.filter( qualifier, elements );\n\u0009}\n\n\u0009return jQuery.grep( elements, function( elem ) {\n\u0009\u0009return ( jQuery.inArray( elem, qualifier ) >= 0 ) !== not;\n\u0009});\n}\n\njQuery.filter = function( expr, elems, not ) {\n\u0009var elem = elems[ 0 ];\n\n\u0009if ( not ) {\n\u0009\u0009expr = \":not(\" + expr + \")\";\n\u0009}\n\n\u0009return elems.length === 1 && elem.nodeType === 1 ?\n\u0009\u0009jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :\n\u0009\u0009jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {\n\u0009\u0009\u0009return elem.nodeType === 1;\n\u0009\u0009}));\n};\n\njQuery.fn.extend({\n\u0009find: function( selector ) {\n\u0009\u0009var i,\n\u0009\u0009\u0009ret = [],\n\u0009\u0009\u0009self = this,\n\u0009\u0009\u0009len = self.length;\n\n\u0009\u0009if ( typeof selector !== \"string\" ) {\n\u0009\u0009\u0009return this.pushStack( jQuery( selector ).filter(function() {\n\u0009\u0009\u0009\u0009for ( i = 0; i < len; i++ ) {\n\u0009\u0009\u0009\u0009\u0009if ( jQuery.contains( self[ i ], this ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}) );\n\u0009\u0009}\n\n\u0009\u0009for ( i = 0; i < len; i++ ) {\n\u0009\u0009\u0009jQuery.find( selector, self[ i ], ret );\n\u0009\u0009}\n\n\u0009\u0009// Needed because $( selector, context ) becomes $( context ).find( selector )\n\u0009\u0009ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );\n\u0009\u0009ret.selector = this.selector ? this.selector + \" \" + selector : selector;\n\u0009\u0009return ret;\n\u0009},\n\u0009filter: function( selector ) {\n\u0009\u0009return this.pushStack( winnow(this, selector || [], false) );\n\u0009},\n\u0009not: function( selector ) {\n\u0009\u0009return this.pushStack( winnow(this, selector || [], true) );\n\u0009},\n\u0009is: function( selector ) {\n\u0009\u0009return !!winnow(\n\u0009\u0009\u0009this,\n\n\u0009\u0009\u0009// If this is a positional/relative selector, check membership in the returned set\n\u0009\u0009\u0009// so $(\"p:first\").is(\"p:last\") won't return true for a doc with two \"p\".\n\u0009\u0009\u0009typeof selector === \"string\" && rneedsContext.test( selector ) ?\n\u0009\u0009\u0009\u0009jQuery( selector ) :\n\u0009\u0009\u0009\u0009selector || [],\n\u0009\u0009\u0009false\n\u0009\u0009).length;\n\u0009}\n});\n\n\n// Initialize a jQuery object\n\n\n// A central reference to the root jQuery(document)\nvar rootjQuery,\n\n\u0009// Use the correct document accordingly with window argument (sandbox)\n\u0009document = window.document,\n\n\u0009// A simple way to check for HTML strings\n\u0009// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)\n\u0009// Strict HTML recognition (#11290: must start with <)\n\u0009rquickExpr = /^(?:\\s*(<[\\w\\W]+>)[^>]*|#([\\w-]*))$/,\n\n\u0009init = jQuery.fn.init = function( selector, context ) {\n\u0009\u0009var match, elem;\n\n\u0009\u0009// HANDLE: $(\"\"), $(null), $(undefined), $(false)\n\u0009\u0009if ( !selector ) {\n\u0009\u0009\u0009return this;\n\u0009\u0009}\n\n\u0009\u0009// Handle HTML strings\n\u0009\u0009if ( typeof selector === \"string\" ) {\n\u0009\u0009\u0009if ( selector.charAt(0) === \"<\" && selector.charAt( selector.length - 1 ) === \">\" && selector.length >= 3 ) {\n\u0009\u0009\u0009\u0009// Assume that strings that start and end with <> are HTML and skip the regex check\n\u0009\u0009\u0009\u0009match = [ null, selector, null ];\n\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009match = rquickExpr.exec( selector );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Match html or make sure no context is specified for #id\n\u0009\u0009\u0009if ( match && (match[1] || !context) ) {\n\n\u0009\u0009\u0009\u0009// HANDLE: $(html) -> $(array)\n\u0009\u0009\u0009\u0009if ( match[1] ) {\n\u0009\u0009\u0009\u0009\u0009context = context instanceof jQuery ? context[0] : context;\n\n\u0009\u0009\u0009\u0009\u0009// scripts is true for back-compat\n\u0009\u0009\u0009\u0009\u0009// Intentionally let the error be thrown if parseHTML is not present\n\u0009\u0009\u0009\u0009\u0009jQuery.merge( this, jQuery.parseHTML(\n\u0009\u0009\u0009\u0009\u0009\u0009match[1],\n\u0009\u0009\u0009\u0009\u0009\u0009context && context.nodeType ? context.ownerDocument || context : document,\n\u0009\u0009\u0009\u0009\u0009\u0009true\n\u0009\u0009\u0009\u0009\u0009) );\n\n\u0009\u0009\u0009\u0009\u0009// HANDLE: $(html, props)\n\u0009\u0009\u0009\u0009\u0009if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009for ( match in context ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Properties of context are called as methods if possible\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( jQuery.isFunction( this[ match ] ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009this[ match ]( context[ match ] );\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// ...and otherwise set as attributes\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009this.attr( match, context[ match ] );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009return this;\n\n\u0009\u0009\u0009\u0009// HANDLE: $(#id)\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009elem = document.getElementById( match[2] );\n\n\u0009\u0009\u0009\u0009\u0009// Check parentNode to catch when Blackberry 4.6 returns\n\u0009\u0009\u0009\u0009\u0009// nodes that are no longer in the document #6963\n\u0009\u0009\u0009\u0009\u0009if ( elem && elem.parentNode ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// Handle the case where IE and Opera return items\n\u0009\u0009\u0009\u0009\u0009\u0009// by name instead of ID\n\u0009\u0009\u0009\u0009\u0009\u0009if ( elem.id !== match[2] ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return rootjQuery.find( selector );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Otherwise, we inject the element directly into the jQuery object\n\u0009\u0009\u0009\u0009\u0009\u0009this.length = 1;\n\u0009\u0009\u0009\u0009\u0009\u0009this[0] = elem;\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009this.context = document;\n\u0009\u0009\u0009\u0009\u0009this.selector = selector;\n\u0009\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// HANDLE: $(expr, $(...))\n\u0009\u0009\u0009} else if ( !context || context.jquery ) {\n\u0009\u0009\u0009\u0009return ( context || rootjQuery ).find( selector );\n\n\u0009\u0009\u0009// HANDLE: $(expr, context)\n\u0009\u0009\u0009// (which is just equivalent to: $(context).find(expr)\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009return this.constructor( context ).find( selector );\n\u0009\u0009\u0009}\n\n\u0009\u0009// HANDLE: $(DOMElement)\n\u0009\u0009} else if ( selector.nodeType ) {\n\u0009\u0009\u0009this.context = this[0] = selector;\n\u0009\u0009\u0009this.length = 1;\n\u0009\u0009\u0009return this;\n\n\u0009\u0009// HANDLE: $(function)\n\u0009\u0009// Shortcut for document ready\n\u0009\u0009} else if ( jQuery.isFunction( selector ) ) {\n\u0009\u0009\u0009return typeof rootjQuery.ready !== \"undefined\" ?\n\u0009\u0009\u0009\u0009rootjQuery.ready( selector ) :\n\u0009\u0009\u0009\u0009// Execute immediately if ready is not present\n\u0009\u0009\u0009\u0009selector( jQuery );\n\u0009\u0009}\n\n\u0009\u0009if ( selector.selector !== undefined ) {\n\u0009\u0009\u0009this.selector = selector.selector;\n\u0009\u0009\u0009this.context = selector.context;\n\u0009\u0009}\n\n\u0009\u0009return jQuery.makeArray( selector, this );\n\u0009};\n\n// Give the init function the jQuery prototype for later instantiation\ninit.prototype = jQuery.fn;\n\n// Initialize central reference\nrootjQuery = jQuery( document );\n\n\nvar rparentsprev = /^(?:parents|prev(?:Until|All))/,\n\u0009// methods guaranteed to produce a unique set when starting from a unique set\n\u0009guaranteedUnique = {\n\u0009\u0009children: true,\n\u0009\u0009contents: true,\n\u0009\u0009next: true,\n\u0009\u0009prev: true\n\u0009};\n\njQuery.extend({\n\u0009dir: function( elem, dir, until ) {\n\u0009\u0009var matched = [],\n\u0009\u0009\u0009cur = elem[ dir ];\n\n\u0009\u0009while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {\n\u0009\u0009\u0009if ( cur.nodeType === 1 ) {\n\u0009\u0009\u0009\u0009matched.push( cur );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009cur = cur[dir];\n\u0009\u0009}\n\u0009\u0009return matched;\n\u0009},\n\n\u0009sibling: function( n, elem ) {\n\u0009\u0009var r = [];\n\n\u0009\u0009for ( ; n; n = n.nextSibling ) {\n\u0009\u0009\u0009if ( n.nodeType === 1 && n !== elem ) {\n\u0009\u0009\u0009\u0009r.push( n );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return r;\n\u0009}\n});\n\njQuery.fn.extend({\n\u0009has: function( target ) {\n\u0009\u0009var i,\n\u0009\u0009\u0009targets = jQuery( target, this ),\n\u0009\u0009\u0009len = targets.length;\n\n\u0009\u0009return this.filter(function() {\n\u0009\u0009\u0009for ( i = 0; i < len; i++ ) {\n\u0009\u0009\u0009\u0009if ( jQuery.contains( this, targets[i] ) ) {\n\u0009\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\n\u0009closest: function( selectors, context ) {\n\u0009\u0009var cur,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009l = this.length,\n\u0009\u0009\u0009matched = [],\n\u0009\u0009\u0009pos = rneedsContext.test( selectors ) || typeof selectors !== \"string\" ?\n\u0009\u0009\u0009\u0009jQuery( selectors, context || this.context ) :\n\u0009\u0009\u0009\u00090;\n\n\u0009\u0009for ( ; i < l; i++ ) {\n\u0009\u0009\u0009for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {\n\u0009\u0009\u0009\u0009// Always skip document fragments\n\u0009\u0009\u0009\u0009if ( cur.nodeType < 11 && (pos ?\n\u0009\u0009\u0009\u0009\u0009pos.index(cur) > -1 :\n\n\u0009\u0009\u0009\u0009\u0009// Don't pass non-elements to Sizzle\n\u0009\u0009\u0009\u0009\u0009cur.nodeType === 1 &&\n\u0009\u0009\u0009\u0009\u0009\u0009jQuery.find.matchesSelector(cur, selectors)) ) {\n\n\u0009\u0009\u0009\u0009\u0009matched.push( cur );\n\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );\n\u0009},\n\n\u0009// Determine the position of an element within\n\u0009// the matched set of elements\n\u0009index: function( elem ) {\n\n\u0009\u0009// No argument, return index in parent\n\u0009\u0009if ( !elem ) {\n\u0009\u0009\u0009return ( this[0] && this[0].parentNode ) ? this.first().prevAll().length : -1;\n\u0009\u0009}\n\n\u0009\u0009// index in selector\n\u0009\u0009if ( typeof elem === \"string\" ) {\n\u0009\u0009\u0009return jQuery.inArray( this[0], jQuery( elem ) );\n\u0009\u0009}\n\n\u0009\u0009// Locate the position of the desired element\n\u0009\u0009return jQuery.inArray(\n\u0009\u0009\u0009// If it receives a jQuery object, the first element is used\n\u0009\u0009\u0009elem.jquery ? elem[0] : elem, this );\n\u0009},\n\n\u0009add: function( selector, context ) {\n\u0009\u0009return this.pushStack(\n\u0009\u0009\u0009jQuery.unique(\n\u0009\u0009\u0009\u0009jQuery.merge( this.get(), jQuery( selector, context ) )\n\u0009\u0009\u0009)\n\u0009\u0009);\n\u0009},\n\n\u0009addBack: function( selector ) {\n\u0009\u0009return this.add( selector == null ?\n\u0009\u0009\u0009this.prevObject : this.prevObject.filter(selector)\n\u0009\u0009);\n\u0009}\n});\n\nfunction sibling( cur, dir ) {\n\u0009do {\n\u0009\u0009cur = cur[ dir ];\n\u0009} while ( cur && cur.nodeType !== 1 );\n\n\u0009return cur;\n}\n\njQuery.each({\n\u0009parent: function( elem ) {\n\u0009\u0009var parent = elem.parentNode;\n\u0009\u0009return parent && parent.nodeType !== 11 ? parent : null;\n\u0009},\n\u0009parents: function( elem ) {\n\u0009\u0009return jQuery.dir( elem, \"parentNode\" );\n\u0009},\n\u0009parentsUntil: function( elem, i, until ) {\n\u0009\u0009return jQuery.dir( elem, \"parentNode\", until );\n\u0009},\n\u0009next: function( elem ) {\n\u0009\u0009return sibling( elem, \"nextSibling\" );\n\u0009},\n\u0009prev: function( elem ) {\n\u0009\u0009return sibling( elem, \"previousSibling\" );\n\u0009},\n\u0009nextAll: function( elem ) {\n\u0009\u0009return jQuery.dir( elem, \"nextSibling\" );\n\u0009},\n\u0009prevAll: function( elem ) {\n\u0009\u0009return jQuery.dir( elem, \"previousSibling\" );\n\u0009},\n\u0009nextUntil: function( elem, i, until ) {\n\u0009\u0009return jQuery.dir( elem, \"nextSibling\", until );\n\u0009},\n\u0009prevUntil: function( elem, i, until ) {\n\u0009\u0009return jQuery.dir( elem, \"previousSibling\", until );\n\u0009},\n\u0009siblings: function( elem ) {\n\u0009\u0009return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );\n\u0009},\n\u0009children: function( elem ) {\n\u0009\u0009return jQuery.sibling( elem.firstChild );\n\u0009},\n\u0009contents: function( elem ) {\n\u0009\u0009return jQuery.nodeName( elem, \"iframe\" ) ?\n\u0009\u0009\u0009elem.contentDocument || elem.contentWindow.document :\n\u0009\u0009\u0009jQuery.merge( [], elem.childNodes );\n\u0009}\n}, function( name, fn ) {\n\u0009jQuery.fn[ name ] = function( until, selector ) {\n\u0009\u0009var ret = jQuery.map( this, fn, until );\n\n\u0009\u0009if ( name.slice( -5 ) !== \"Until\" ) {\n\u0009\u0009\u0009selector = until;\n\u0009\u0009}\n\n\u0009\u0009if ( selector && typeof selector === \"string\" ) {\n\u0009\u0009\u0009ret = jQuery.filter( selector, ret );\n\u0009\u0009}\n\n\u0009\u0009if ( this.length > 1 ) {\n\u0009\u0009\u0009// Remove duplicates\n\u0009\u0009\u0009if ( !guaranteedUnique[ name ] ) {\n\u0009\u0009\u0009\u0009ret = jQuery.unique( ret );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Reverse order for parents* and prev-derivatives\n\u0009\u0009\u0009if ( rparentsprev.test( name ) ) {\n\u0009\u0009\u0009\u0009ret = ret.reverse();\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return this.pushStack( ret );\n\u0009};\n});\nvar rnotwhite = (/\\S+/g);\n\n\n\n// String to Object options format cache\nvar optionsCache = {};\n\n// Convert String-formatted options into Object-formatted ones and store in cache\nfunction createOptions( options ) {\n\u0009var object = optionsCache[ options ] = {};\n\u0009jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {\n\u0009\u0009object[ flag ] = true;\n\u0009});\n\u0009return object;\n}\n\n/*\n * Create a callback list using the following parameters:\n *\n *\u0009options: an optional list of space-separated options that will change how\n *\u0009\u0009\u0009the callback list behaves or a more traditional option object\n *\n * By default a callback list will act like an event callback list and can be\n * \"fired\" multiple times.\n *\n * Possible options:\n *\n *\u0009once:\u0009\u0009\u0009will ensure the callback list can only be fired once (like a Deferred)\n *\n *\u0009memory:\u0009\u0009\u0009will keep track of previous values and will call any callback added\n *\u0009\u0009\u0009\u0009\u0009after the list has been fired right away with the latest \"memorized\"\n *\u0009\u0009\u0009\u0009\u0009values (like a Deferred)\n *\n *\u0009unique:\u0009\u0009\u0009will ensure a callback can only be added once (no duplicate in the list)\n *\n *\u0009stopOnFalse:\u0009interrupt callings when a callback returns false\n *\n */\njQuery.Callbacks = function( options ) {\n\n\u0009// Convert options from String-formatted to Object-formatted if needed\n\u0009// (we check in cache first)\n\u0009options = typeof options === \"string\" ?\n\u0009\u0009( optionsCache[ options ] || createOptions( options ) ) :\n\u0009\u0009jQuery.extend( {}, options );\n\n\u0009var // Flag to know if list is currently firing\n\u0009\u0009firing,\n\u0009\u0009// Last fire value (for non-forgettable lists)\n\u0009\u0009memory,\n\u0009\u0009// Flag to know if list was already fired\n\u0009\u0009fired,\n\u0009\u0009// End of the loop when firing\n\u0009\u0009firingLength,\n\u0009\u0009// Index of currently firing callback (modified by remove if needed)\n\u0009\u0009firingIndex,\n\u0009\u0009// First callback to fire (used internally by add and fireWith)\n\u0009\u0009firingStart,\n\u0009\u0009// Actual callback list\n\u0009\u0009list = [],\n\u0009\u0009// Stack of fire calls for repeatable lists\n\u0009\u0009stack = !options.once && [],\n\u0009\u0009// Fire callbacks\n\u0009\u0009fire = function( data ) {\n\u0009\u0009\u0009memory = options.memory && data;\n\u0009\u0009\u0009fired = true;\n\u0009\u0009\u0009firingIndex = firingStart || 0;\n\u0009\u0009\u0009firingStart = 0;\n\u0009\u0009\u0009firingLength = list.length;\n\u0009\u0009\u0009firing = true;\n\u0009\u0009\u0009for ( ; list && firingIndex < firingLength; firingIndex++ ) {\n\u0009\u0009\u0009\u0009if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {\n\u0009\u0009\u0009\u0009\u0009memory = false; // To prevent further calls using add\n\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009\u0009firing = false;\n\u0009\u0009\u0009if ( list ) {\n\u0009\u0009\u0009\u0009if ( stack ) {\n\u0009\u0009\u0009\u0009\u0009if ( stack.length ) {\n\u0009\u0009\u0009\u0009\u0009\u0009fire( stack.shift() );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009} else if ( memory ) {\n\u0009\u0009\u0009\u0009\u0009list = [];\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009self.disable();\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009},\n\u0009\u0009// Actual Callbacks object\n\u0009\u0009self = {\n\u0009\u0009\u0009// Add a callback or a collection of callbacks to the list\n\u0009\u0009\u0009add: function() {\n\u0009\u0009\u0009\u0009if ( list ) {\n\u0009\u0009\u0009\u0009\u0009// First, we save the current length\n\u0009\u0009\u0009\u0009\u0009var start = list.length;\n\u0009\u0009\u0009\u0009\u0009(function add( args ) {\n\u0009\u0009\u0009\u0009\u0009\u0009jQuery.each( args, function( _, arg ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009var type = jQuery.type( arg );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( type === \"function\" ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( !options.unique || !self.has( arg ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009list.push( arg );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else if ( arg && arg.length && type !== \"string\" ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Inspect recursively\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009add( arg );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009\u0009})( arguments );\n\u0009\u0009\u0009\u0009\u0009// Do we need to add the callbacks to the\n\u0009\u0009\u0009\u0009\u0009// current firing batch?\n\u0009\u0009\u0009\u0009\u0009if ( firing ) {\n\u0009\u0009\u0009\u0009\u0009\u0009firingLength = list.length;\n\u0009\u0009\u0009\u0009\u0009// With memory, if we're not firing then\n\u0009\u0009\u0009\u0009\u0009// we should call right away\n\u0009\u0009\u0009\u0009\u0009} else if ( memory ) {\n\u0009\u0009\u0009\u0009\u0009\u0009firingStart = start;\n\u0009\u0009\u0009\u0009\u0009\u0009fire( memory );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Remove a callback from the list\n\u0009\u0009\u0009remove: function() {\n\u0009\u0009\u0009\u0009if ( list ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.each( arguments, function( _, arg ) {\n\u0009\u0009\u0009\u0009\u0009\u0009var index;\n\u0009\u0009\u0009\u0009\u0009\u0009while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009list.splice( index, 1 );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Handle firing indexes\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( firing ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( index <= firingLength ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009firingLength--;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( index <= firingIndex ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009firingIndex--;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Check if a given callback is in the list.\n\u0009\u0009\u0009// If no argument is given, return whether or not list has callbacks attached.\n\u0009\u0009\u0009has: function( fn ) {\n\u0009\u0009\u0009\u0009return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Remove all callbacks from the list\n\u0009\u0009\u0009empty: function() {\n\u0009\u0009\u0009\u0009list = [];\n\u0009\u0009\u0009\u0009firingLength = 0;\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Have the list do nothing anymore\n\u0009\u0009\u0009disable: function() {\n\u0009\u0009\u0009\u0009list = stack = memory = undefined;\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Is it disabled?\n\u0009\u0009\u0009disabled: function() {\n\u0009\u0009\u0009\u0009return !list;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Lock the list in its current state\n\u0009\u0009\u0009lock: function() {\n\u0009\u0009\u0009\u0009stack = undefined;\n\u0009\u0009\u0009\u0009if ( !memory ) {\n\u0009\u0009\u0009\u0009\u0009self.disable();\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Is it locked?\n\u0009\u0009\u0009locked: function() {\n\u0009\u0009\u0009\u0009return !stack;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Call all callbacks with the given context and arguments\n\u0009\u0009\u0009fireWith: function( context, args ) {\n\u0009\u0009\u0009\u0009if ( list && ( !fired || stack ) ) {\n\u0009\u0009\u0009\u0009\u0009args = args || [];\n\u0009\u0009\u0009\u0009\u0009args = [ context, args.slice ? args.slice() : args ];\n\u0009\u0009\u0009\u0009\u0009if ( firing ) {\n\u0009\u0009\u0009\u0009\u0009\u0009stack.push( args );\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009fire( args );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// Call all the callbacks with the given arguments\n\u0009\u0009\u0009fire: function() {\n\u0009\u0009\u0009\u0009self.fireWith( this, arguments );\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009// To know if the callbacks have already been called at least once\n\u0009\u0009\u0009fired: function() {\n\u0009\u0009\u0009\u0009return !!fired;\n\u0009\u0009\u0009}\n\u0009\u0009};\n\n\u0009return self;\n};\n\n\njQuery.extend({\n\n\u0009Deferred: function( func ) {\n\u0009\u0009var tuples = [\n\u0009\u0009\u0009\u0009// action, add listener, listener list, final state\n\u0009\u0009\u0009\u0009[ \"resolve\", \"done\", jQuery.Callbacks(\"once memory\"), \"resolved\" ],\n\u0009\u0009\u0009\u0009[ \"reject\", \"fail\", jQuery.Callbacks(\"once memory\"), \"rejected\" ],\n\u0009\u0009\u0009\u0009[ \"notify\", \"progress\", jQuery.Callbacks(\"memory\") ]\n\u0009\u0009\u0009],\n\u0009\u0009\u0009state = \"pending\",\n\u0009\u0009\u0009promise = {\n\u0009\u0009\u0009\u0009state: function() {\n\u0009\u0009\u0009\u0009\u0009return state;\n\u0009\u0009\u0009\u0009},\n\u0009\u0009\u0009\u0009always: function() {\n\u0009\u0009\u0009\u0009\u0009deferred.done( arguments ).fail( arguments );\n\u0009\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009\u0009},\n\u0009\u0009\u0009\u0009then: function( /* fnDone, fnFail, fnProgress */ ) {\n\u0009\u0009\u0009\u0009\u0009var fns = arguments;\n\u0009\u0009\u0009\u0009\u0009return jQuery.Deferred(function( newDefer ) {\n\u0009\u0009\u0009\u0009\u0009\u0009jQuery.each( tuples, function( i, tuple ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// deferred[ done | fail | progress ] for forwarding actions to newDefer\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009deferred[ tuple[1] ](function() {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009var returned = fn && fn.apply( this, arguments );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( returned && jQuery.isFunction( returned.promise ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009returned.promise()\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009.done( newDefer.resolve )\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009.fail( newDefer.reject )\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009.progress( newDefer.notify );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009newDefer[ tuple[ 0 ] + \"With\" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009\u0009\u0009fns = null;\n\u0009\u0009\u0009\u0009\u0009}).promise();\n\u0009\u0009\u0009\u0009},\n\u0009\u0009\u0009\u0009// Get a promise for this deferred\n\u0009\u0009\u0009\u0009// If obj is provided, the promise aspect is added to the object\n\u0009\u0009\u0009\u0009promise: function( obj ) {\n\u0009\u0009\u0009\u0009\u0009return obj != null ? jQuery.extend( obj, promise ) : promise;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009},\n\u0009\u0009\u0009deferred = {};\n\n\u0009\u0009// Keep pipe for back-compat\n\u0009\u0009promise.pipe = promise.then;\n\n\u0009\u0009// Add list-specific methods\n\u0009\u0009jQuery.each( tuples, function( i, tuple ) {\n\u0009\u0009\u0009var list = tuple[ 2 ],\n\u0009\u0009\u0009\u0009stateString = tuple[ 3 ];\n\n\u0009\u0009\u0009// promise[ done | fail | progress ] = list.add\n\u0009\u0009\u0009promise[ tuple[1] ] = list.add;\n\n\u0009\u0009\u0009// Handle state\n\u0009\u0009\u0009if ( stateString ) {\n\u0009\u0009\u0009\u0009list.add(function() {\n\u0009\u0009\u0009\u0009\u0009// state = [ resolved | rejected ]\n\u0009\u0009\u0009\u0009\u0009state = stateString;\n\n\u0009\u0009\u0009\u0009// [ reject_list | resolve_list ].disable; progress_list.lock\n\u0009\u0009\u0009\u0009}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// deferred[ resolve | reject | notify ]\n\u0009\u0009\u0009deferred[ tuple[0] ] = function() {\n\u0009\u0009\u0009\u0009deferred[ tuple[0] + \"With\" ]( this === deferred ? promise : this, arguments );\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009};\n\u0009\u0009\u0009deferred[ tuple[0] + \"With\" ] = list.fireWith;\n\u0009\u0009});\n\n\u0009\u0009// Make the deferred a promise\n\u0009\u0009promise.promise( deferred );\n\n\u0009\u0009// Call given func if any\n\u0009\u0009if ( func ) {\n\u0009\u0009\u0009func.call( deferred, deferred );\n\u0009\u0009}\n\n\u0009\u0009// All done!\n\u0009\u0009return deferred;\n\u0009},\n\n\u0009// Deferred helper\n\u0009when: function( subordinate /* , ..., subordinateN */ ) {\n\u0009\u0009var i = 0,\n\u0009\u0009\u0009resolveValues = slice.call( arguments ),\n\u0009\u0009\u0009length = resolveValues.length,\n\n\u0009\u0009\u0009// the count of uncompleted subordinates\n\u0009\u0009\u0009remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,\n\n\u0009\u0009\u0009// the master Deferred. If resolveValues consist of only a single Deferred, just use that.\n\u0009\u0009\u0009deferred = remaining === 1 ? subordinate : jQuery.Deferred(),\n\n\u0009\u0009\u0009// Update function for both resolve and progress values\n\u0009\u0009\u0009updateFunc = function( i, contexts, values ) {\n\u0009\u0009\u0009\u0009return function( value ) {\n\u0009\u0009\u0009\u0009\u0009contexts[ i ] = this;\n\u0009\u0009\u0009\u0009\u0009values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;\n\u0009\u0009\u0009\u0009\u0009if ( values === progressValues ) {\n\u0009\u0009\u0009\u0009\u0009\u0009deferred.notifyWith( contexts, values );\n\n\u0009\u0009\u0009\u0009\u0009} else if ( !(--remaining) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009deferred.resolveWith( contexts, values );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009};\n\u0009\u0009\u0009},\n\n\u0009\u0009\u0009progressValues, progressContexts, resolveContexts;\n\n\u0009\u0009// add listeners to Deferred subordinates; treat others as resolved\n\u0009\u0009if ( length > 1 ) {\n\u0009\u0009\u0009progressValues = new Array( length );\n\u0009\u0009\u0009progressContexts = new Array( length );\n\u0009\u0009\u0009resolveContexts = new Array( length );\n\u0009\u0009\u0009for ( ; i < length; i++ ) {\n\u0009\u0009\u0009\u0009if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {\n\u0009\u0009\u0009\u0009\u0009resolveValues[ i ].promise()\n\u0009\u0009\u0009\u0009\u0009\u0009.done( updateFunc( i, resolveContexts, resolveValues ) )\n\u0009\u0009\u0009\u0009\u0009\u0009.fail( deferred.reject )\n\u0009\u0009\u0009\u0009\u0009\u0009.progress( updateFunc( i, progressContexts, progressValues ) );\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009--remaining;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// if we're not waiting on anything, resolve the master\n\u0009\u0009if ( !remaining ) {\n\u0009\u0009\u0009deferred.resolveWith( resolveContexts, resolveValues );\n\u0009\u0009}\n\n\u0009\u0009return deferred.promise();\n\u0009}\n});\n\n\n// The deferred used on DOM ready\nvar readyList;\n\njQuery.fn.ready = function( fn ) {\n\u0009// Add the callback\n\u0009jQuery.ready.promise().done( fn );\n\n\u0009return this;\n};\n\njQuery.extend({\n\u0009// Is the DOM ready to be used? Set to true once it occurs.\n\u0009isReady: false,\n\n\u0009// A counter to track how many items to wait for before\n\u0009// the ready event fires. See #6781\n\u0009readyWait: 1,\n\n\u0009// Hold (or release) the ready event\n\u0009holdReady: function( hold ) {\n\u0009\u0009if ( hold ) {\n\u0009\u0009\u0009jQuery.readyWait++;\n\u0009\u0009} else {\n\u0009\u0009\u0009jQuery.ready( true );\n\u0009\u0009}\n\u0009},\n\n\u0009// Handle when the DOM is ready\n\u0009ready: function( wait ) {\n\n\u0009\u0009// Abort if there are pending holds or we're already ready\n\u0009\u0009if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).\n\u0009\u0009if ( !document.body ) {\n\u0009\u0009\u0009return setTimeout( jQuery.ready );\n\u0009\u0009}\n\n\u0009\u0009// Remember that the DOM is ready\n\u0009\u0009jQuery.isReady = true;\n\n\u0009\u0009// If a normal DOM Ready event fired, decrement, and wait if need be\n\u0009\u0009if ( wait !== true && --jQuery.readyWait > 0 ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// If there are functions bound, to execute\n\u0009\u0009readyList.resolveWith( document, [ jQuery ] );\n\n\u0009\u0009// Trigger any bound ready events\n\u0009\u0009if ( jQuery.fn.triggerHandler ) {\n\u0009\u0009\u0009jQuery( document ).triggerHandler( \"ready\" );\n\u0009\u0009\u0009jQuery( document ).off( \"ready\" );\n\u0009\u0009}\n\u0009}\n});\n\n/**\n * Clean-up method for dom ready events\n */\nfunction detach() {\n\u0009if ( document.addEventListener ) {\n\u0009\u0009document.removeEventListener( \"DOMContentLoaded\", completed, false );\n\u0009\u0009window.removeEventListener( \"load\", completed, false );\n\n\u0009} else {\n\u0009\u0009document.detachEvent( \"onreadystatechange\", completed );\n\u0009\u0009window.detachEvent( \"onload\", completed );\n\u0009}\n}\n\n/**\n * The ready event handler and self cleanup method\n */\nfunction completed() {\n\u0009// readyState === \"complete\" is good enough for us to call the dom ready in oldIE\n\u0009if ( document.addEventListener || event.type === \"load\" || document.readyState === \"complete\" ) {\n\u0009\u0009detach();\n\u0009\u0009jQuery.ready();\n\u0009}\n}\n\njQuery.ready.promise = function( obj ) {\n\u0009if ( !readyList ) {\n\n\u0009\u0009readyList = jQuery.Deferred();\n\n\u0009\u0009// Catch cases where $(document).ready() is called after the browser event has already occurred.\n\u0009\u0009// we once tried to use readyState \"interactive\" here, but it caused issues like the one\n\u0009\u0009// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15\n\u0009\u0009if ( document.readyState === \"complete\" ) {\n\u0009\u0009\u0009// Handle it asynchronously to allow scripts the opportunity to delay ready\n\u0009\u0009\u0009setTimeout( jQuery.ready );\n\n\u0009\u0009// Standards-based browsers support DOMContentLoaded\n\u0009\u0009} else if ( document.addEventListener ) {\n\u0009\u0009\u0009// Use the handy event callback\n\u0009\u0009\u0009document.addEventListener( \"DOMContentLoaded\", completed, false );\n\n\u0009\u0009\u0009// A fallback to window.onload, that will always work\n\u0009\u0009\u0009window.addEventListener( \"load\", completed, false );\n\n\u0009\u0009// If IE event model is used\n\u0009\u0009} else {\n\u0009\u0009\u0009// Ensure firing before onload, maybe late but safe also for iframes\n\u0009\u0009\u0009document.attachEvent( \"onreadystatechange\", completed );\n\n\u0009\u0009\u0009// A fallback to window.onload, that will always work\n\u0009\u0009\u0009window.attachEvent( \"onload\", completed );\n\n\u0009\u0009\u0009// If IE and not a frame\n\u0009\u0009\u0009// continually check to see if the document is ready\n\u0009\u0009\u0009var top = false;\n\n\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009top = window.frameElement == null && document.documentElement;\n\u0009\u0009\u0009} catch(e) {}\n\n\u0009\u0009\u0009if ( top && top.doScroll ) {\n\u0009\u0009\u0009\u0009(function doScrollCheck() {\n\u0009\u0009\u0009\u0009\u0009if ( !jQuery.isReady ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Use the trick by Diego Perini\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// http://javascript.nwbox.com/IEContentLoaded/\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009top.doScroll(\"left\");\n\u0009\u0009\u0009\u0009\u0009\u0009} catch(e) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return setTimeout( doScrollCheck, 50 );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009// detach all dom ready events\n\u0009\u0009\u0009\u0009\u0009\u0009detach();\n\n\u0009\u0009\u0009\u0009\u0009\u0009// and execute any waiting functions\n\u0009\u0009\u0009\u0009\u0009\u0009jQuery.ready();\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009})();\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\u0009return readyList.promise( obj );\n};\n\n\nvar strundefined = typeof undefined;\n\n\n\n// Support: IE<9\n// Iteration over object's inherited properties before its own\nvar i;\nfor ( i in jQuery( support ) ) {\n\u0009break;\n}\nsupport.ownLast = i !== \"0\";\n\n// Note: most support tests are defined in their respective modules.\n// false until the test is run\nsupport.inlineBlockNeedsLayout = false;\n\n// Execute ASAP in case we need to set body.style.zoom\njQuery(function() {\n\u0009// Minified: var a,b,c,d\n\u0009var val, div, body, container;\n\n\u0009body = document.getElementsByTagName( \"body\" )[ 0 ];\n\u0009if ( !body || !body.style ) {\n\u0009\u0009// Return for frameset docs that don't have a body\n\u0009\u0009return;\n\u0009}\n\n\u0009// Setup\n\u0009div = document.createElement( \"div\" );\n\u0009container = document.createElement( \"div\" );\n\u0009container.style.cssText = \"position:absolute;border:0;width:0;height:0;top:0;left:-9999px\";\n\u0009body.appendChild( container ).appendChild( div );\n\n\u0009if ( typeof div.style.zoom !== strundefined ) {\n\u0009\u0009// Support: IE<8\n\u0009\u0009// Check if natively block-level elements act like inline-block\n\u0009\u0009// elements when setting their display to 'inline' and giving\n\u0009\u0009// them layout\n\u0009\u0009div.style.cssText = \"display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1\";\n\n\u0009\u0009support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;\n\u0009\u0009if ( val ) {\n\u0009\u0009\u0009// Prevent IE 6 from affecting layout for positioned elements #11048\n\u0009\u0009\u0009// Prevent IE from shrinking the body in IE 7 mode #12869\n\u0009\u0009\u0009// Support: IE<8\n\u0009\u0009\u0009body.style.zoom = 1;\n\u0009\u0009}\n\u0009}\n\n\u0009body.removeChild( container );\n});\n\n\n\n\n(function() {\n\u0009var div = document.createElement( \"div\" );\n\n\u0009// Execute the test only if not already executed in another module.\n\u0009if (support.deleteExpando == null) {\n\u0009\u0009// Support: IE<9\n\u0009\u0009support.deleteExpando = true;\n\u0009\u0009try {\n\u0009\u0009\u0009delete div.test;\n\u0009\u0009} catch( e ) {\n\u0009\u0009\u0009support.deleteExpando = false;\n\u0009\u0009}\n\u0009}\n\n\u0009// Null elements to avoid leaks in IE.\n\u0009div = null;\n})();\n\n\n/**\n * Determines whether an object can have data\n */\njQuery.acceptData = function( elem ) {\n\u0009var noData = jQuery.noData[ (elem.nodeName + \" \").toLowerCase() ],\n\u0009\u0009nodeType = +elem.nodeType || 1;\n\n\u0009// Do not set data on non-element DOM nodes because it will not be cleared (#8335).\n\u0009return nodeType !== 1 && nodeType !== 9 ?\n\u0009\u0009false :\n\n\u0009\u0009// Nodes accept data unless otherwise specified; rejection can be conditional\n\u0009\u0009!noData || noData !== true && elem.getAttribute(\"classid\") === noData;\n};\n\n\nvar rbrace = /^(?:\\{[\\w\\W]*\\}|\\[[\\w\\W]*\\])$/,\n\u0009rmultiDash = /([A-Z])/g;\n\nfunction dataAttr( elem, key, data ) {\n\u0009// If nothing was found internally, try to fetch any\n\u0009// data from the HTML5 data-* attribute\n\u0009if ( data === undefined && elem.nodeType === 1 ) {\n\n\u0009\u0009var name = \"data-\" + key.replace( rmultiDash, \"-$1\" ).toLowerCase();\n\n\u0009\u0009data = elem.getAttribute( name );\n\n\u0009\u0009if ( typeof data === \"string\" ) {\n\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009data = data === \"true\" ? true :\n\u0009\u0009\u0009\u0009\u0009data === \"false\" ? false :\n\u0009\u0009\u0009\u0009\u0009data === \"null\" ? null :\n\u0009\u0009\u0009\u0009\u0009// Only convert to a number if it doesn't change the string\n\u0009\u0009\u0009\u0009\u0009+data + \"\" === data ? +data :\n\u0009\u0009\u0009\u0009\u0009rbrace.test( data ) ? jQuery.parseJSON( data ) :\n\u0009\u0009\u0009\u0009\u0009data;\n\u0009\u0009\u0009} catch( e ) {}\n\n\u0009\u0009\u0009// Make sure we set the data so it isn't changed later\n\u0009\u0009\u0009jQuery.data( elem, key, data );\n\n\u0009\u0009} else {\n\u0009\u0009\u0009data = undefined;\n\u0009\u0009}\n\u0009}\n\n\u0009return data;\n}\n\n// checks a cache object for emptiness\nfunction isEmptyDataObject( obj ) {\n\u0009var name;\n\u0009for ( name in obj ) {\n\n\u0009\u0009// if the public data object is empty, the private is still empty\n\u0009\u0009if ( name === \"data\" && jQuery.isEmptyObject( obj[name] ) ) {\n\u0009\u0009\u0009continue;\n\u0009\u0009}\n\u0009\u0009if ( name !== \"toJSON\" ) {\n\u0009\u0009\u0009return false;\n\u0009\u0009}\n\u0009}\n\n\u0009return true;\n}\n\nfunction internalData( elem, name, data, pvt /* Internal Use Only */ ) {\n\u0009if ( !jQuery.acceptData( elem ) ) {\n\u0009\u0009return;\n\u0009}\n\n\u0009var ret, thisCache,\n\u0009\u0009internalKey = jQuery.expando,\n\n\u0009\u0009// We have to handle DOM nodes and JS objects differently because IE6-7\n\u0009\u0009// can't GC object references properly across the DOM-JS boundary\n\u0009\u0009isNode = elem.nodeType,\n\n\u0009\u0009// Only DOM nodes need the global jQuery cache; JS object data is\n\u0009\u0009// attached directly to the object so GC can occur automatically\n\u0009\u0009cache = isNode ? jQuery.cache : elem,\n\n\u0009\u0009// Only defining an ID for JS objects if its cache already exists allows\n\u0009\u0009// the code to shortcut on the same path as a DOM node with no cache\n\u0009\u0009id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;\n\n\u0009// Avoid doing any more work than we need to when trying to get data on an\n\u0009// object that has no data at all\n\u0009if ( (!id || !cache[id] || (!pvt && !cache[id].data)) && data === undefined && typeof name === \"string\" ) {\n\u0009\u0009return;\n\u0009}\n\n\u0009if ( !id ) {\n\u0009\u0009// Only DOM nodes need a new unique ID for each element since their data\n\u0009\u0009// ends up in the global cache\n\u0009\u0009if ( isNode ) {\n\u0009\u0009\u0009id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;\n\u0009\u0009} else {\n\u0009\u0009\u0009id = internalKey;\n\u0009\u0009}\n\u0009}\n\n\u0009if ( !cache[ id ] ) {\n\u0009\u0009// Avoid exposing jQuery metadata on plain JS objects when the object\n\u0009\u0009// is serialized using JSON.stringify\n\u0009\u0009cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };\n\u0009}\n\n\u0009// An object can be passed to jQuery.data instead of a key/value pair; this gets\n\u0009// shallow copied over onto the existing cache\n\u0009if ( typeof name === \"object\" || typeof name === \"function\" ) {\n\u0009\u0009if ( pvt ) {\n\u0009\u0009\u0009cache[ id ] = jQuery.extend( cache[ id ], name );\n\u0009\u0009} else {\n\u0009\u0009\u0009cache[ id ].data = jQuery.extend( cache[ id ].data, name );\n\u0009\u0009}\n\u0009}\n\n\u0009thisCache = cache[ id ];\n\n\u0009// jQuery data() is stored in a separate object inside the object's internal data\n\u0009// cache in order to avoid key collisions between internal data and user-defined\n\u0009// data.\n\u0009if ( !pvt ) {\n\u0009\u0009if ( !thisCache.data ) {\n\u0009\u0009\u0009thisCache.data = {};\n\u0009\u0009}\n\n\u0009\u0009thisCache = thisCache.data;\n\u0009}\n\n\u0009if ( data !== undefined ) {\n\u0009\u0009thisCache[ jQuery.camelCase( name ) ] = data;\n\u0009}\n\n\u0009// Check for both converted-to-camel and non-converted data property names\n\u0009// If a data property was specified\n\u0009if ( typeof name === \"string\" ) {\n\n\u0009\u0009// First Try to find as-is property data\n\u0009\u0009ret = thisCache[ name ];\n\n\u0009\u0009// Test for null|undefined property data\n\u0009\u0009if ( ret == null ) {\n\n\u0009\u0009\u0009// Try to find the camelCased property\n\u0009\u0009\u0009ret = thisCache[ jQuery.camelCase( name ) ];\n\u0009\u0009}\n\u0009} else {\n\u0009\u0009ret = thisCache;\n\u0009}\n\n\u0009return ret;\n}\n\nfunction internalRemoveData( elem, name, pvt ) {\n\u0009if ( !jQuery.acceptData( elem ) ) {\n\u0009\u0009return;\n\u0009}\n\n\u0009var thisCache, i,\n\u0009\u0009isNode = elem.nodeType,\n\n\u0009\u0009// See jQuery.data for more information\n\u0009\u0009cache = isNode ? jQuery.cache : elem,\n\u0009\u0009id = isNode ? elem[ jQuery.expando ] : jQuery.expando;\n\n\u0009// If there is already no cache entry for this object, there is no\n\u0009// purpose in continuing\n\u0009if ( !cache[ id ] ) {\n\u0009\u0009return;\n\u0009}\n\n\u0009if ( name ) {\n\n\u0009\u0009thisCache = pvt ? cache[ id ] : cache[ id ].data;\n\n\u0009\u0009if ( thisCache ) {\n\n\u0009\u0009\u0009// Support array or space separated string names for data keys\n\u0009\u0009\u0009if ( !jQuery.isArray( name ) ) {\n\n\u0009\u0009\u0009\u0009// try the string as a key before any manipulation\n\u0009\u0009\u0009\u0009if ( name in thisCache ) {\n\u0009\u0009\u0009\u0009\u0009name = [ name ];\n\u0009\u0009\u0009\u0009} else {\n\n\u0009\u0009\u0009\u0009\u0009// split the camel cased version by spaces unless a key with the spaces exists\n\u0009\u0009\u0009\u0009\u0009name = jQuery.camelCase( name );\n\u0009\u0009\u0009\u0009\u0009if ( name in thisCache ) {\n\u0009\u0009\u0009\u0009\u0009\u0009name = [ name ];\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009name = name.split(\" \");\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009// If \"name\" is an array of keys...\n\u0009\u0009\u0009\u0009// When data is initially created, via (\"key\", \"val\") signature,\n\u0009\u0009\u0009\u0009// keys will be converted to camelCase.\n\u0009\u0009\u0009\u0009// Since there is no way to tell _how_ a key was added, remove\n\u0009\u0009\u0009\u0009// both plain key and camelCase key. #12786\n\u0009\u0009\u0009\u0009// This will only penalize the array argument path.\n\u0009\u0009\u0009\u0009name = name.concat( jQuery.map( name, jQuery.camelCase ) );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009i = name.length;\n\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009delete thisCache[ name[i] ];\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// If there is no data left in the cache, we want to continue\n\u0009\u0009\u0009// and let the cache object itself get destroyed\n\u0009\u0009\u0009if ( pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache) ) {\n\u0009\u0009\u0009\u0009return;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009// See jQuery.data for more information\n\u0009if ( !pvt ) {\n\u0009\u0009delete cache[ id ].data;\n\n\u0009\u0009// Don't destroy the parent cache unless the internal data object\n\u0009\u0009// had been the only thing left in it\n\u0009\u0009if ( !isEmptyDataObject( cache[ id ] ) ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\u0009}\n\n\u0009// Destroy the cache\n\u0009if ( isNode ) {\n\u0009\u0009jQuery.cleanData( [ elem ], true );\n\n\u0009// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)\n\u0009/* jshint eqeqeq: false */\n\u0009} else if ( support.deleteExpando || cache != cache.window ) {\n\u0009\u0009/* jshint eqeqeq: true */\n\u0009\u0009delete cache[ id ];\n\n\u0009// When all else fails, null\n\u0009} else {\n\u0009\u0009cache[ id ] = null;\n\u0009}\n}\n\njQuery.extend({\n\u0009cache: {},\n\n\u0009// The following elements (space-suffixed to avoid Object.prototype collisions)\n\u0009// throw uncatchable exceptions if you attempt to set expando properties\n\u0009noData: {\n\u0009\u0009\"applet \": true,\n\u0009\u0009\"embed \": true,\n\u0009\u0009// ...but Flash objects (which have this classid) *can* handle expandos\n\u0009\u0009\"object \": \"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000\"\n\u0009},\n\n\u0009hasData: function( elem ) {\n\u0009\u0009elem = elem.nodeType ? jQuery.cache[ elem[jQuery.expando] ] : elem[ jQuery.expando ];\n\u0009\u0009return !!elem && !isEmptyDataObject( elem );\n\u0009},\n\n\u0009data: function( elem, name, data ) {\n\u0009\u0009return internalData( elem, name, data );\n\u0009},\n\n\u0009removeData: function( elem, name ) {\n\u0009\u0009return internalRemoveData( elem, name );\n\u0009},\n\n\u0009// For internal use only.\n\u0009_data: function( elem, name, data ) {\n\u0009\u0009return internalData( elem, name, data, true );\n\u0009},\n\n\u0009_removeData: function( elem, name ) {\n\u0009\u0009return internalRemoveData( elem, name, true );\n\u0009}\n});\n\njQuery.fn.extend({\n\u0009data: function( key, value ) {\n\u0009\u0009var i, name, data,\n\u0009\u0009\u0009elem = this[0],\n\u0009\u0009\u0009attrs = elem && elem.attributes;\n\n\u0009\u0009// Special expections of .data basically thwart jQuery.access,\n\u0009\u0009// so implement the relevant behavior ourselves\n\n\u0009\u0009// Gets all values\n\u0009\u0009if ( key === undefined ) {\n\u0009\u0009\u0009if ( this.length ) {\n\u0009\u0009\u0009\u0009data = jQuery.data( elem );\n\n\u0009\u0009\u0009\u0009if ( elem.nodeType === 1 && !jQuery._data( elem, \"parsedAttrs\" ) ) {\n\u0009\u0009\u0009\u0009\u0009i = attrs.length;\n\u0009\u0009\u0009\u0009\u0009while ( i-- ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Support: IE11+\n\u0009\u0009\u0009\u0009\u0009\u0009// The attrs elements can be null (#14894)\n\u0009\u0009\u0009\u0009\u0009\u0009if ( attrs[ i ] ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009name = attrs[ i ].name;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( name.indexOf( \"data-\" ) === 0 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009name = jQuery.camelCase( name.slice(5) );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009dataAttr( elem, name, data[ name ] );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009jQuery._data( elem, \"parsedAttrs\", true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return data;\n\u0009\u0009}\n\n\u0009\u0009// Sets multiple values\n\u0009\u0009if ( typeof key === \"object\" ) {\n\u0009\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009\u0009jQuery.data( this, key );\n\u0009\u0009\u0009});\n\u0009\u0009}\n\n\u0009\u0009return arguments.length > 1 ?\n\n\u0009\u0009\u0009// Sets one value\n\u0009\u0009\u0009this.each(function() {\n\u0009\u0009\u0009\u0009jQuery.data( this, key, value );\n\u0009\u0009\u0009}) :\n\n\u0009\u0009\u0009// Gets one value\n\u0009\u0009\u0009// Try to fetch any internally stored data first\n\u0009\u0009\u0009elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;\n\u0009},\n\n\u0009removeData: function( key ) {\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009jQuery.removeData( this, key );\n\u0009\u0009});\n\u0009}\n});\n\n\njQuery.extend({\n\u0009queue: function( elem, type, data ) {\n\u0009\u0009var queue;\n\n\u0009\u0009if ( elem ) {\n\u0009\u0009\u0009type = ( type || \"fx\" ) + \"queue\";\n\u0009\u0009\u0009queue = jQuery._data( elem, type );\n\n\u0009\u0009\u0009// Speed up dequeue by getting out quickly if this is just a lookup\n\u0009\u0009\u0009if ( data ) {\n\u0009\u0009\u0009\u0009if ( !queue || jQuery.isArray(data) ) {\n\u0009\u0009\u0009\u0009\u0009queue = jQuery._data( elem, type, jQuery.makeArray(data) );\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009queue.push( data );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return queue || [];\n\u0009\u0009}\n\u0009},\n\n\u0009dequeue: function( elem, type ) {\n\u0009\u0009type = type || \"fx\";\n\n\u0009\u0009var queue = jQuery.queue( elem, type ),\n\u0009\u0009\u0009startLength = queue.length,\n\u0009\u0009\u0009fn = queue.shift(),\n\u0009\u0009\u0009hooks = jQuery._queueHooks( elem, type ),\n\u0009\u0009\u0009next = function() {\n\u0009\u0009\u0009\u0009jQuery.dequeue( elem, type );\n\u0009\u0009\u0009};\n\n\u0009\u0009// If the fx queue is dequeued, always remove the progress sentinel\n\u0009\u0009if ( fn === \"inprogress\" ) {\n\u0009\u0009\u0009fn = queue.shift();\n\u0009\u0009\u0009startLength--;\n\u0009\u0009}\n\n\u0009\u0009if ( fn ) {\n\n\u0009\u0009\u0009// Add a progress sentinel to prevent the fx queue from being\n\u0009\u0009\u0009// automatically dequeued\n\u0009\u0009\u0009if ( type === \"fx\" ) {\n\u0009\u0009\u0009\u0009queue.unshift( \"inprogress\" );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// clear up the last queue stop function\n\u0009\u0009\u0009delete hooks.stop;\n\u0009\u0009\u0009fn.call( elem, next, hooks );\n\u0009\u0009}\n\n\u0009\u0009if ( !startLength && hooks ) {\n\u0009\u0009\u0009hooks.empty.fire();\n\u0009\u0009}\n\u0009},\n\n\u0009// not intended for public consumption - generates a queueHooks object, or returns the current one\n\u0009_queueHooks: function( elem, type ) {\n\u0009\u0009var key = type + \"queueHooks\";\n\u0009\u0009return jQuery._data( elem, key ) || jQuery._data( elem, key, {\n\u0009\u0009\u0009empty: jQuery.Callbacks(\"once memory\").add(function() {\n\u0009\u0009\u0009\u0009jQuery._removeData( elem, type + \"queue\" );\n\u0009\u0009\u0009\u0009jQuery._removeData( elem, key );\n\u0009\u0009\u0009})\n\u0009\u0009});\n\u0009}\n});\n\njQuery.fn.extend({\n\u0009queue: function( type, data ) {\n\u0009\u0009var setter = 2;\n\n\u0009\u0009if ( typeof type !== \"string\" ) {\n\u0009\u0009\u0009data = type;\n\u0009\u0009\u0009type = \"fx\";\n\u0009\u0009\u0009setter--;\n\u0009\u0009}\n\n\u0009\u0009if ( arguments.length < setter ) {\n\u0009\u0009\u0009return jQuery.queue( this[0], type );\n\u0009\u0009}\n\n\u0009\u0009return data === undefined ?\n\u0009\u0009\u0009this :\n\u0009\u0009\u0009this.each(function() {\n\u0009\u0009\u0009\u0009var queue = jQuery.queue( this, type, data );\n\n\u0009\u0009\u0009\u0009// ensure a hooks for this queue\n\u0009\u0009\u0009\u0009jQuery._queueHooks( this, type );\n\n\u0009\u0009\u0009\u0009if ( type === \"fx\" && queue[0] !== \"inprogress\" ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.dequeue( this, type );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009});\n\u0009},\n\u0009dequeue: function( type ) {\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009jQuery.dequeue( this, type );\n\u0009\u0009});\n\u0009},\n\u0009clearQueue: function( type ) {\n\u0009\u0009return this.queue( type || \"fx\", [] );\n\u0009},\n\u0009// Get a promise resolved when queues of a certain type\n\u0009// are emptied (fx is the type by default)\n\u0009promise: function( type, obj ) {\n\u0009\u0009var tmp,\n\u0009\u0009\u0009count = 1,\n\u0009\u0009\u0009defer = jQuery.Deferred(),\n\u0009\u0009\u0009elements = this,\n\u0009\u0009\u0009i = this.length,\n\u0009\u0009\u0009resolve = function() {\n\u0009\u0009\u0009\u0009if ( !( --count ) ) {\n\u0009\u0009\u0009\u0009\u0009defer.resolveWith( elements, [ elements ] );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009};\n\n\u0009\u0009if ( typeof type !== \"string\" ) {\n\u0009\u0009\u0009obj = type;\n\u0009\u0009\u0009type = undefined;\n\u0009\u0009}\n\u0009\u0009type = type || \"fx\";\n\n\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009tmp = jQuery._data( elements[ i ], type + \"queueHooks\" );\n\u0009\u0009\u0009if ( tmp && tmp.empty ) {\n\u0009\u0009\u0009\u0009count++;\n\u0009\u0009\u0009\u0009tmp.empty.add( resolve );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009\u0009resolve();\n\u0009\u0009return defer.promise( obj );\n\u0009}\n});\nvar pnum = (/[+-]?(?:\\d*\\.|)\\d+(?:[eE][+-]?\\d+|)/).source;\n\nvar cssExpand = [ \"Top\", \"Right\", \"Bottom\", \"Left\" ];\n\nvar isHidden = function( elem, el ) {\n\u0009\u0009// isHidden might be called from jQuery#filter function;\n\u0009\u0009// in that case, element will be second argument\n\u0009\u0009elem = el || elem;\n\u0009\u0009return jQuery.css( elem, \"display\" ) === \"none\" || !jQuery.contains( elem.ownerDocument, elem );\n\u0009};\n\n\n\n// Multifunctional method to get and set values of a collection\n// The value/s can optionally be executed if it's a function\nvar access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {\n\u0009var i = 0,\n\u0009\u0009length = elems.length,\n\u0009\u0009bulk = key == null;\n\n\u0009// Sets many values\n\u0009if ( jQuery.type( key ) === \"object\" ) {\n\u0009\u0009chainable = true;\n\u0009\u0009for ( i in key ) {\n\u0009\u0009\u0009jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );\n\u0009\u0009}\n\n\u0009// Sets one value\n\u0009} else if ( value !== undefined ) {\n\u0009\u0009chainable = true;\n\n\u0009\u0009if ( !jQuery.isFunction( value ) ) {\n\u0009\u0009\u0009raw = true;\n\u0009\u0009}\n\n\u0009\u0009if ( bulk ) {\n\u0009\u0009\u0009// Bulk operations run against the entire set\n\u0009\u0009\u0009if ( raw ) {\n\u0009\u0009\u0009\u0009fn.call( elems, value );\n\u0009\u0009\u0009\u0009fn = null;\n\n\u0009\u0009\u0009// ...except when executing function values\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009bulk = fn;\n\u0009\u0009\u0009\u0009fn = function( elem, key, value ) {\n\u0009\u0009\u0009\u0009\u0009return bulk.call( jQuery( elem ), value );\n\u0009\u0009\u0009\u0009};\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009if ( fn ) {\n\u0009\u0009\u0009for ( ; i < length; i++ ) {\n\u0009\u0009\u0009\u0009fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009return chainable ?\n\u0009\u0009elems :\n\n\u0009\u0009// Gets\n\u0009\u0009bulk ?\n\u0009\u0009\u0009fn.call( elems ) :\n\u0009\u0009\u0009length ? fn( elems[0], key ) : emptyGet;\n};\nvar rcheckableType = (/^(?:checkbox|radio)$/i);\n\n\n\n(function() {\n\u0009// Minified: var a,b,c\n\u0009var input = document.createElement( \"input\" ),\n\u0009\u0009div = document.createElement( \"div\" ),\n\u0009\u0009fragment = document.createDocumentFragment();\n\n\u0009// Setup\n\u0009div.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\n\u0009// IE strips leading whitespace when .innerHTML is used\n\u0009support.leadingWhitespace = div.firstChild.nodeType === 3;\n\n\u0009// Make sure that tbody elements aren't automatically inserted\n\u0009// IE will insert them into empty tables\n\u0009support.tbody = !div.getElementsByTagName( \"tbody\" ).length;\n\n\u0009// Make sure that link elements get serialized correctly by innerHTML\n\u0009// This requires a wrapper element in IE\n\u0009support.htmlSerialize = !!div.getElementsByTagName( \"link\" ).length;\n\n\u0009// Makes sure cloning an html5 element does not cause problems\n\u0009// Where outerHTML is undefined, this still works\n\u0009support.html5Clone =\n\u0009\u0009document.createElement( \"nav\" ).cloneNode( true ).outerHTML !== \"<:nav></:nav>\";\n\n\u0009// Check if a disconnected checkbox will retain its checked\n\u0009// value of true after appended to the DOM (IE6/7)\n\u0009input.type = \"checkbox\";\n\u0009input.checked = true;\n\u0009fragment.appendChild( input );\n\u0009support.appendChecked = input.checked;\n\n\u0009// Make sure textarea (and checkbox) defaultValue is properly cloned\n\u0009// Support: IE6-IE11+\n\u0009div.innerHTML = \"<textarea>x</textarea>\";\n\u0009support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;\n\n\u0009// #11217 - WebKit loses check when the name is after the checked attribute\n\u0009fragment.appendChild( div );\n\u0009div.innerHTML = \"<input type='radio' checked='checked' name='t'/>\";\n\n\u0009// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3\n\u0009// old WebKit doesn't clone checked state correctly in fragments\n\u0009support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;\n\n\u0009// Support: IE<9\n\u0009// Opera does not clone events (and typeof div.attachEvent === undefined).\n\u0009// IE9-10 clones events bound via attachEvent, but they don't trigger with .click()\n\u0009support.noCloneEvent = true;\n\u0009if ( div.attachEvent ) {\n\u0009\u0009div.attachEvent( \"onclick\", function() {\n\u0009\u0009\u0009support.noCloneEvent = false;\n\u0009\u0009});\n\n\u0009\u0009div.cloneNode( true ).click();\n\u0009}\n\n\u0009// Execute the test only if not already executed in another module.\n\u0009if (support.deleteExpando == null) {\n\u0009\u0009// Support: IE<9\n\u0009\u0009support.deleteExpando = true;\n\u0009\u0009try {\n\u0009\u0009\u0009delete div.test;\n\u0009\u0009} catch( e ) {\n\u0009\u0009\u0009support.deleteExpando = false;\n\u0009\u0009}\n\u0009}\n})();\n\n\n(function() {\n\u0009var i, eventName,\n\u0009\u0009div = document.createElement( \"div\" );\n\n\u0009// Support: IE<9 (lack submit/change bubble), Firefox 23+ (lack focusin event)\n\u0009for ( i in { submit: true, change: true, focusin: true }) {\n\u0009\u0009eventName = \"on\" + i;\n\n\u0009\u0009if ( !(support[ i + \"Bubbles\" ] = eventName in window) ) {\n\u0009\u0009\u0009// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)\n\u0009\u0009\u0009div.setAttribute( eventName, \"t\" );\n\u0009\u0009\u0009support[ i + \"Bubbles\" ] = div.attributes[ eventName ].expando === false;\n\u0009\u0009}\n\u0009}\n\n\u0009// Null elements to avoid leaks in IE.\n\u0009div = null;\n})();\n\n\nvar rformElems = /^(?:input|select|textarea)$/i,\n\u0009rkeyEvent = /^key/,\n\u0009rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,\n\u0009rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,\n\u0009rtypenamespace = /^([^.]*)(?:\\.(.+)|)$/;\n\nfunction returnTrue() {\n\u0009return true;\n}\n\nfunction returnFalse() {\n\u0009return false;\n}\n\nfunction safeActiveElement() {\n\u0009try {\n\u0009\u0009return document.activeElement;\n\u0009} catch ( err ) { }\n}\n\n/*\n * Helper functions for managing events -- not part of the public interface.\n * Props to Dean Edwards' addEvent library for many of the ideas.\n */\njQuery.event = {\n\n\u0009global: {},\n\n\u0009add: function( elem, types, handler, data, selector ) {\n\u0009\u0009var tmp, events, t, handleObjIn,\n\u0009\u0009\u0009special, eventHandle, handleObj,\n\u0009\u0009\u0009handlers, type, namespaces, origType,\n\u0009\u0009\u0009elemData = jQuery._data( elem );\n\n\u0009\u0009// Don't attach events to noData or text/comment nodes (but allow plain objects)\n\u0009\u0009if ( !elemData ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Caller can pass in an object of custom data in lieu of the handler\n\u0009\u0009if ( handler.handler ) {\n\u0009\u0009\u0009handleObjIn = handler;\n\u0009\u0009\u0009handler = handleObjIn.handler;\n\u0009\u0009\u0009selector = handleObjIn.selector;\n\u0009\u0009}\n\n\u0009\u0009// Make sure that the handler has a unique ID, used to find/remove it later\n\u0009\u0009if ( !handler.guid ) {\n\u0009\u0009\u0009handler.guid = jQuery.guid++;\n\u0009\u0009}\n\n\u0009\u0009// Init the element's event structure and main handler, if this is the first\n\u0009\u0009if ( !(events = elemData.events) ) {\n\u0009\u0009\u0009events = elemData.events = {};\n\u0009\u0009}\n\u0009\u0009if ( !(eventHandle = elemData.handle) ) {\n\u0009\u0009\u0009eventHandle = elemData.handle = function( e ) {\n\u0009\u0009\u0009\u0009// Discard the second event of a jQuery.event.trigger() and\n\u0009\u0009\u0009\u0009// when an event is called after a page has unloaded\n\u0009\u0009\u0009\u0009return typeof jQuery !== strundefined && (!e || jQuery.event.triggered !== e.type) ?\n\u0009\u0009\u0009\u0009\u0009jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :\n\u0009\u0009\u0009\u0009\u0009undefined;\n\u0009\u0009\u0009};\n\u0009\u0009\u0009// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events\n\u0009\u0009\u0009eventHandle.elem = elem;\n\u0009\u0009}\n\n\u0009\u0009// Handle multiple events separated by a space\n\u0009\u0009types = ( types || \"\" ).match( rnotwhite ) || [ \"\" ];\n\u0009\u0009t = types.length;\n\u0009\u0009while ( t-- ) {\n\u0009\u0009\u0009tmp = rtypenamespace.exec( types[t] ) || [];\n\u0009\u0009\u0009type = origType = tmp[1];\n\u0009\u0009\u0009namespaces = ( tmp[2] || \"\" ).split( \".\" ).sort();\n\n\u0009\u0009\u0009// There *must* be a type, no attaching namespace-only handlers\n\u0009\u0009\u0009if ( !type ) {\n\u0009\u0009\u0009\u0009continue;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// If event changes its type, use the special event handlers for the changed type\n\u0009\u0009\u0009special = jQuery.event.special[ type ] || {};\n\n\u0009\u0009\u0009// If selector defined, determine special event api type, otherwise given type\n\u0009\u0009\u0009type = ( selector ? special.delegateType : special.bindType ) || type;\n\n\u0009\u0009\u0009// Update special based on newly reset type\n\u0009\u0009\u0009special = jQuery.event.special[ type ] || {};\n\n\u0009\u0009\u0009// handleObj is passed to all event handlers\n\u0009\u0009\u0009handleObj = jQuery.extend({\n\u0009\u0009\u0009\u0009type: type,\n\u0009\u0009\u0009\u0009origType: origType,\n\u0009\u0009\u0009\u0009data: data,\n\u0009\u0009\u0009\u0009handler: handler,\n\u0009\u0009\u0009\u0009guid: handler.guid,\n\u0009\u0009\u0009\u0009selector: selector,\n\u0009\u0009\u0009\u0009needsContext: selector && jQuery.expr.match.needsContext.test( selector ),\n\u0009\u0009\u0009\u0009namespace: namespaces.join(\".\")\n\u0009\u0009\u0009}, handleObjIn );\n\n\u0009\u0009\u0009// Init the event handler queue if we're the first\n\u0009\u0009\u0009if ( !(handlers = events[ type ]) ) {\n\u0009\u0009\u0009\u0009handlers = events[ type ] = [];\n\u0009\u0009\u0009\u0009handlers.delegateCount = 0;\n\n\u0009\u0009\u0009\u0009// Only use addEventListener/attachEvent if the special events handler returns false\n\u0009\u0009\u0009\u0009if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {\n\u0009\u0009\u0009\u0009\u0009// Bind the global event handler to the element\n\u0009\u0009\u0009\u0009\u0009if ( elem.addEventListener ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem.addEventListener( type, eventHandle, false );\n\n\u0009\u0009\u0009\u0009\u0009} else if ( elem.attachEvent ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem.attachEvent( \"on\" + type, eventHandle );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( special.add ) {\n\u0009\u0009\u0009\u0009special.add.call( elem, handleObj );\n\n\u0009\u0009\u0009\u0009if ( !handleObj.handler.guid ) {\n\u0009\u0009\u0009\u0009\u0009handleObj.handler.guid = handler.guid;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Add to the element's handler list, delegates in front\n\u0009\u0009\u0009if ( selector ) {\n\u0009\u0009\u0009\u0009handlers.splice( handlers.delegateCount++, 0, handleObj );\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009handlers.push( handleObj );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Keep track of which events have ever been used, for event optimization\n\u0009\u0009\u0009jQuery.event.global[ type ] = true;\n\u0009\u0009}\n\n\u0009\u0009// Nullify elem to prevent memory leaks in IE\n\u0009\u0009elem = null;\n\u0009},\n\n\u0009// Detach an event or set of events from an element\n\u0009remove: function( elem, types, handler, selector, mappedTypes ) {\n\u0009\u0009var j, handleObj, tmp,\n\u0009\u0009\u0009origCount, t, events,\n\u0009\u0009\u0009special, handlers, type,\n\u0009\u0009\u0009namespaces, origType,\n\u0009\u0009\u0009elemData = jQuery.hasData( elem ) && jQuery._data( elem );\n\n\u0009\u0009if ( !elemData || !(events = elemData.events) ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Once for each type.namespace in types; type may be omitted\n\u0009\u0009types = ( types || \"\" ).match( rnotwhite ) || [ \"\" ];\n\u0009\u0009t = types.length;\n\u0009\u0009while ( t-- ) {\n\u0009\u0009\u0009tmp = rtypenamespace.exec( types[t] ) || [];\n\u0009\u0009\u0009type = origType = tmp[1];\n\u0009\u0009\u0009namespaces = ( tmp[2] || \"\" ).split( \".\" ).sort();\n\n\u0009\u0009\u0009// Unbind all events (on this namespace, if provided) for the element\n\u0009\u0009\u0009if ( !type ) {\n\u0009\u0009\u0009\u0009for ( type in events ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.event.remove( elem, type + types[ t ], handler, selector, true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009continue;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009special = jQuery.event.special[ type ] || {};\n\u0009\u0009\u0009type = ( selector ? special.delegateType : special.bindType ) || type;\n\u0009\u0009\u0009handlers = events[ type ] || [];\n\u0009\u0009\u0009tmp = tmp[2] && new RegExp( \"(^|\\\\.)\" + namespaces.join(\"\\\\.(?:.*\\\\.|)\") + \"(\\\\.|$)\" );\n\n\u0009\u0009\u0009// Remove matching events\n\u0009\u0009\u0009origCount = j = handlers.length;\n\u0009\u0009\u0009while ( j-- ) {\n\u0009\u0009\u0009\u0009handleObj = handlers[ j ];\n\n\u0009\u0009\u0009\u0009if ( ( mappedTypes || origType === handleObj.origType ) &&\n\u0009\u0009\u0009\u0009\u0009( !handler || handler.guid === handleObj.guid ) &&\n\u0009\u0009\u0009\u0009\u0009( !tmp || tmp.test( handleObj.namespace ) ) &&\n\u0009\u0009\u0009\u0009\u0009( !selector || selector === handleObj.selector || selector === \"**\" && handleObj.selector ) ) {\n\u0009\u0009\u0009\u0009\u0009handlers.splice( j, 1 );\n\n\u0009\u0009\u0009\u0009\u0009if ( handleObj.selector ) {\n\u0009\u0009\u0009\u0009\u0009\u0009handlers.delegateCount--;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009if ( special.remove ) {\n\u0009\u0009\u0009\u0009\u0009\u0009special.remove.call( elem, handleObj );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Remove generic event handler if we removed something and no more handlers exist\n\u0009\u0009\u0009// (avoids potential for endless recursion during removal of special event handlers)\n\u0009\u0009\u0009if ( origCount && !handlers.length ) {\n\u0009\u0009\u0009\u0009if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.removeEvent( elem, type, elemData.handle );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009delete events[ type ];\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Remove the expando if it's no longer used\n\u0009\u0009if ( jQuery.isEmptyObject( events ) ) {\n\u0009\u0009\u0009delete elemData.handle;\n\n\u0009\u0009\u0009// removeData also checks for emptiness and clears the expando if empty\n\u0009\u0009\u0009// so use it instead of delete\n\u0009\u0009\u0009jQuery._removeData( elem, \"events\" );\n\u0009\u0009}\n\u0009},\n\n\u0009trigger: function( event, data, elem, onlyHandlers ) {\n\u0009\u0009var handle, ontype, cur,\n\u0009\u0009\u0009bubbleType, special, tmp, i,\n\u0009\u0009\u0009eventPath = [ elem || document ],\n\u0009\u0009\u0009type = hasOwn.call( event, \"type\" ) ? event.type : event,\n\u0009\u0009\u0009namespaces = hasOwn.call( event, \"namespace\" ) ? event.namespace.split(\".\") : [];\n\n\u0009\u0009cur = tmp = elem = elem || document;\n\n\u0009\u0009// Don't do events on text and comment nodes\n\u0009\u0009if ( elem.nodeType === 3 || elem.nodeType === 8 ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// focus/blur morphs to focusin/out; ensure we're not firing them right now\n\u0009\u0009if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009if ( type.indexOf(\".\") >= 0 ) {\n\u0009\u0009\u0009// Namespaced trigger; create a regexp to match event type in handle()\n\u0009\u0009\u0009namespaces = type.split(\".\");\n\u0009\u0009\u0009type = namespaces.shift();\n\u0009\u0009\u0009namespaces.sort();\n\u0009\u0009}\n\u0009\u0009ontype = type.indexOf(\":\") < 0 && \"on\" + type;\n\n\u0009\u0009// Caller can pass in a jQuery.Event object, Object, or just an event type string\n\u0009\u0009event = event[ jQuery.expando ] ?\n\u0009\u0009\u0009event :\n\u0009\u0009\u0009new jQuery.Event( type, typeof event === \"object\" && event );\n\n\u0009\u0009// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)\n\u0009\u0009event.isTrigger = onlyHandlers ? 2 : 3;\n\u0009\u0009event.namespace = namespaces.join(\".\");\n\u0009\u0009event.namespace_re = event.namespace ?\n\u0009\u0009\u0009new RegExp( \"(^|\\\\.)\" + namespaces.join(\"\\\\.(?:.*\\\\.|)\") + \"(\\\\.|$)\" ) :\n\u0009\u0009\u0009null;\n\n\u0009\u0009// Clean up the event in case it is being reused\n\u0009\u0009event.result = undefined;\n\u0009\u0009if ( !event.target ) {\n\u0009\u0009\u0009event.target = elem;\n\u0009\u0009}\n\n\u0009\u0009// Clone any incoming data and prepend the event, creating the handler arg list\n\u0009\u0009data = data == null ?\n\u0009\u0009\u0009[ event ] :\n\u0009\u0009\u0009jQuery.makeArray( data, [ event ] );\n\n\u0009\u0009// Allow special events to draw outside the lines\n\u0009\u0009special = jQuery.event.special[ type ] || {};\n\u0009\u0009if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Determine event propagation path in advance, per W3C events spec (#9951)\n\u0009\u0009// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)\n\u0009\u0009if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {\n\n\u0009\u0009\u0009bubbleType = special.delegateType || type;\n\u0009\u0009\u0009if ( !rfocusMorph.test( bubbleType + type ) ) {\n\u0009\u0009\u0009\u0009cur = cur.parentNode;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009for ( ; cur; cur = cur.parentNode ) {\n\u0009\u0009\u0009\u0009eventPath.push( cur );\n\u0009\u0009\u0009\u0009tmp = cur;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Only add window if we got to document (e.g., not plain obj or detached DOM)\n\u0009\u0009\u0009if ( tmp === (elem.ownerDocument || document) ) {\n\u0009\u0009\u0009\u0009eventPath.push( tmp.defaultView || tmp.parentWindow || window );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Fire handlers on the event path\n\u0009\u0009i = 0;\n\u0009\u0009while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {\n\n\u0009\u0009\u0009event.type = i > 1 ?\n\u0009\u0009\u0009\u0009bubbleType :\n\u0009\u0009\u0009\u0009special.bindType || type;\n\n\u0009\u0009\u0009// jQuery handler\n\u0009\u0009\u0009handle = ( jQuery._data( cur, \"events\" ) || {} )[ event.type ] && jQuery._data( cur, \"handle\" );\n\u0009\u0009\u0009if ( handle ) {\n\u0009\u0009\u0009\u0009handle.apply( cur, data );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Native handler\n\u0009\u0009\u0009handle = ontype && cur[ ontype ];\n\u0009\u0009\u0009if ( handle && handle.apply && jQuery.acceptData( cur ) ) {\n\u0009\u0009\u0009\u0009event.result = handle.apply( cur, data );\n\u0009\u0009\u0009\u0009if ( event.result === false ) {\n\u0009\u0009\u0009\u0009\u0009event.preventDefault();\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009\u0009event.type = type;\n\n\u0009\u0009// If nobody prevented the default action, do it now\n\u0009\u0009if ( !onlyHandlers && !event.isDefaultPrevented() ) {\n\n\u0009\u0009\u0009if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&\n\u0009\u0009\u0009\u0009jQuery.acceptData( elem ) ) {\n\n\u0009\u0009\u0009\u0009// Call a native DOM method on the target with the same name name as the event.\n\u0009\u0009\u0009\u0009// Can't use an .isFunction() check here because IE6/7 fails that test.\n\u0009\u0009\u0009\u0009// Don't do default actions on window, that's where global variables be (#6170)\n\u0009\u0009\u0009\u0009if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {\n\n\u0009\u0009\u0009\u0009\u0009// Don't re-trigger an onFOO event when we call its FOO() method\n\u0009\u0009\u0009\u0009\u0009tmp = elem[ ontype ];\n\n\u0009\u0009\u0009\u0009\u0009if ( tmp ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem[ ontype ] = null;\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Prevent re-triggering of the same event, since we already bubbled it above\n\u0009\u0009\u0009\u0009\u0009jQuery.event.triggered = type;\n\u0009\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009\u0009elem[ type ]();\n\u0009\u0009\u0009\u0009\u0009} catch ( e ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// IE<9 dies on focus/blur to hidden element (#1486,#12518)\n\u0009\u0009\u0009\u0009\u0009\u0009// only reproducible on winXP IE8 native, not IE9 in IE8 mode\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009jQuery.event.triggered = undefined;\n\n\u0009\u0009\u0009\u0009\u0009if ( tmp ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem[ ontype ] = tmp;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return event.result;\n\u0009},\n\n\u0009dispatch: function( event ) {\n\n\u0009\u0009// Make a writable jQuery.Event from the native event object\n\u0009\u0009event = jQuery.event.fix( event );\n\n\u0009\u0009var i, ret, handleObj, matched, j,\n\u0009\u0009\u0009handlerQueue = [],\n\u0009\u0009\u0009args = slice.call( arguments ),\n\u0009\u0009\u0009handlers = ( jQuery._data( this, \"events\" ) || {} )[ event.type ] || [],\n\u0009\u0009\u0009special = jQuery.event.special[ event.type ] || {};\n\n\u0009\u0009// Use the fix-ed jQuery.Event rather than the (read-only) native event\n\u0009\u0009args[0] = event;\n\u0009\u0009event.delegateTarget = this;\n\n\u0009\u0009// Call the preDispatch hook for the mapped type, and let it bail if desired\n\u0009\u0009if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Determine handlers\n\u0009\u0009handlerQueue = jQuery.event.handlers.call( this, event, handlers );\n\n\u0009\u0009// Run delegates first; they may want to stop propagation beneath us\n\u0009\u0009i = 0;\n\u0009\u0009while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {\n\u0009\u0009\u0009event.currentTarget = matched.elem;\n\n\u0009\u0009\u0009j = 0;\n\u0009\u0009\u0009while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {\n\n\u0009\u0009\u0009\u0009// Triggered event must either 1) have no namespace, or\n\u0009\u0009\u0009\u0009// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).\n\u0009\u0009\u0009\u0009if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {\n\n\u0009\u0009\u0009\u0009\u0009event.handleObj = handleObj;\n\u0009\u0009\u0009\u0009\u0009event.data = handleObj.data;\n\n\u0009\u0009\u0009\u0009\u0009ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009.apply( matched.elem, args );\n\n\u0009\u0009\u0009\u0009\u0009if ( ret !== undefined ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( (event.result = ret) === false ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009event.preventDefault();\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009event.stopPropagation();\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Call the postDispatch hook for the mapped type\n\u0009\u0009if ( special.postDispatch ) {\n\u0009\u0009\u0009special.postDispatch.call( this, event );\n\u0009\u0009}\n\n\u0009\u0009return event.result;\n\u0009},\n\n\u0009handlers: function( event, handlers ) {\n\u0009\u0009var sel, handleObj, matches, i,\n\u0009\u0009\u0009handlerQueue = [],\n\u0009\u0009\u0009delegateCount = handlers.delegateCount,\n\u0009\u0009\u0009cur = event.target;\n\n\u0009\u0009// Find delegate handlers\n\u0009\u0009// Black-hole SVG <use> instance trees (#13180)\n\u0009\u0009// Avoid non-left-click bubbling in Firefox (#3861)\n\u0009\u0009if ( delegateCount && cur.nodeType && (!event.button || event.type !== \"click\") ) {\n\n\u0009\u0009\u0009/* jshint eqeqeq: false */\n\u0009\u0009\u0009for ( ; cur != this; cur = cur.parentNode || this ) {\n\u0009\u0009\u0009\u0009/* jshint eqeqeq: true */\n\n\u0009\u0009\u0009\u0009// Don't check non-elements (#13208)\n\u0009\u0009\u0009\u0009// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)\n\u0009\u0009\u0009\u0009if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== \"click\") ) {\n\u0009\u0009\u0009\u0009\u0009matches = [];\n\u0009\u0009\u0009\u0009\u0009for ( i = 0; i < delegateCount; i++ ) {\n\u0009\u0009\u0009\u0009\u0009\u0009handleObj = handlers[ i ];\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Don't conflict with Object.prototype properties (#13203)\n\u0009\u0009\u0009\u0009\u0009\u0009sel = handleObj.selector + \" \";\n\n\u0009\u0009\u0009\u0009\u0009\u0009if ( matches[ sel ] === undefined ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009matches[ sel ] = handleObj.needsContext ?\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery( sel, this ).index( cur ) >= 0 :\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery.find( sel, this, null, [ cur ] ).length;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009if ( matches[ sel ] ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009matches.push( handleObj );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009if ( matches.length ) {\n\u0009\u0009\u0009\u0009\u0009\u0009handlerQueue.push({ elem: cur, handlers: matches });\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Add the remaining (directly-bound) handlers\n\u0009\u0009if ( delegateCount < handlers.length ) {\n\u0009\u0009\u0009handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });\n\u0009\u0009}\n\n\u0009\u0009return handlerQueue;\n\u0009},\n\n\u0009fix: function( event ) {\n\u0009\u0009if ( event[ jQuery.expando ] ) {\n\u0009\u0009\u0009return event;\n\u0009\u0009}\n\n\u0009\u0009// Create a writable copy of the event object and normalize some properties\n\u0009\u0009var i, prop, copy,\n\u0009\u0009\u0009type = event.type,\n\u0009\u0009\u0009originalEvent = event,\n\u0009\u0009\u0009fixHook = this.fixHooks[ type ];\n\n\u0009\u0009if ( !fixHook ) {\n\u0009\u0009\u0009this.fixHooks[ type ] = fixHook =\n\u0009\u0009\u0009\u0009rmouseEvent.test( type ) ? this.mouseHooks :\n\u0009\u0009\u0009\u0009rkeyEvent.test( type ) ? this.keyHooks :\n\u0009\u0009\u0009\u0009{};\n\u0009\u0009}\n\u0009\u0009copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;\n\n\u0009\u0009event = new jQuery.Event( originalEvent );\n\n\u0009\u0009i = copy.length;\n\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009prop = copy[ i ];\n\u0009\u0009\u0009event[ prop ] = originalEvent[ prop ];\n\u0009\u0009}\n\n\u0009\u0009// Support: IE<9\n\u0009\u0009// Fix target property (#1925)\n\u0009\u0009if ( !event.target ) {\n\u0009\u0009\u0009event.target = originalEvent.srcElement || document;\n\u0009\u0009}\n\n\u0009\u0009// Support: Chrome 23+, Safari?\n\u0009\u0009// Target should not be a text node (#504, #13143)\n\u0009\u0009if ( event.target.nodeType === 3 ) {\n\u0009\u0009\u0009event.target = event.target.parentNode;\n\u0009\u0009}\n\n\u0009\u0009// Support: IE<9\n\u0009\u0009// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)\n\u0009\u0009event.metaKey = !!event.metaKey;\n\n\u0009\u0009return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;\n\u0009},\n\n\u0009// Includes some event props shared by KeyEvent and MouseEvent\n\u0009props: \"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which\".split(\" \"),\n\n\u0009fixHooks: {},\n\n\u0009keyHooks: {\n\u0009\u0009props: \"char charCode key keyCode\".split(\" \"),\n\u0009\u0009filter: function( event, original ) {\n\n\u0009\u0009\u0009// Add which for key events\n\u0009\u0009\u0009if ( event.which == null ) {\n\u0009\u0009\u0009\u0009event.which = original.charCode != null ? original.charCode : original.keyCode;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return event;\n\u0009\u0009}\n\u0009},\n\n\u0009mouseHooks: {\n\u0009\u0009props: \"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement\".split(\" \"),\n\u0009\u0009filter: function( event, original ) {\n\u0009\u0009\u0009var body, eventDoc, doc,\n\u0009\u0009\u0009\u0009button = original.button,\n\u0009\u0009\u0009\u0009fromElement = original.fromElement;\n\n\u0009\u0009\u0009// Calculate pageX/Y if missing and clientX/Y available\n\u0009\u0009\u0009if ( event.pageX == null && original.clientX != null ) {\n\u0009\u0009\u0009\u0009eventDoc = event.target.ownerDocument || document;\n\u0009\u0009\u0009\u0009doc = eventDoc.documentElement;\n\u0009\u0009\u0009\u0009body = eventDoc.body;\n\n\u0009\u0009\u0009\u0009event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );\n\u0009\u0009\u0009\u0009event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Add relatedTarget, if necessary\n\u0009\u0009\u0009if ( !event.relatedTarget && fromElement ) {\n\u0009\u0009\u0009\u0009event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Add which for click: 1 === left; 2 === middle; 3 === right\n\u0009\u0009\u0009// Note: button is not normalized, so don't use it\n\u0009\u0009\u0009if ( !event.which && button !== undefined ) {\n\u0009\u0009\u0009\u0009event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return event;\n\u0009\u0009}\n\u0009},\n\n\u0009special: {\n\u0009\u0009load: {\n\u0009\u0009\u0009// Prevent triggered image.load events from bubbling to window.load\n\u0009\u0009\u0009noBubble: true\n\u0009\u0009},\n\u0009\u0009focus: {\n\u0009\u0009\u0009// Fire native event if possible so blur/focus sequence is correct\n\u0009\u0009\u0009trigger: function() {\n\u0009\u0009\u0009\u0009if ( this !== safeActiveElement() && this.focus ) {\n\u0009\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009\u0009this.focus();\n\u0009\u0009\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009\u0009\u0009} catch ( e ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// Support: IE<9\n\u0009\u0009\u0009\u0009\u0009\u0009// If we error on focus to hidden element (#1486, #12518),\n\u0009\u0009\u0009\u0009\u0009\u0009// let .trigger() run the handlers\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009},\n\u0009\u0009\u0009delegateType: \"focusin\"\n\u0009\u0009},\n\u0009\u0009blur: {\n\u0009\u0009\u0009trigger: function() {\n\u0009\u0009\u0009\u0009if ( this === safeActiveElement() && this.blur ) {\n\u0009\u0009\u0009\u0009\u0009this.blur();\n\u0009\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009},\n\u0009\u0009\u0009delegateType: \"focusout\"\n\u0009\u0009},\n\u0009\u0009click: {\n\u0009\u0009\u0009// For checkbox, fire native event so checked state will be right\n\u0009\u0009\u0009trigger: function() {\n\u0009\u0009\u0009\u0009if ( jQuery.nodeName( this, \"input\" ) && this.type === \"checkbox\" && this.click ) {\n\u0009\u0009\u0009\u0009\u0009this.click();\n\u0009\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009},\n\n\u0009\u0009\u0009// For cross-browser consistency, don't fire native .click() on links\n\u0009\u0009\u0009_default: function( event ) {\n\u0009\u0009\u0009\u0009return jQuery.nodeName( event.target, \"a\" );\n\u0009\u0009\u0009}\n\u0009\u0009},\n\n\u0009\u0009beforeunload: {\n\u0009\u0009\u0009postDispatch: function( event ) {\n\n\u0009\u0009\u0009\u0009// Support: Firefox 20+\n\u0009\u0009\u0009\u0009// Firefox doesn't alert if the returnValue field is not set.\n\u0009\u0009\u0009\u0009if ( event.result !== undefined && event.originalEvent ) {\n\u0009\u0009\u0009\u0009\u0009event.originalEvent.returnValue = event.result;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009},\n\n\u0009simulate: function( type, elem, event, bubble ) {\n\u0009\u0009// Piggyback on a donor event to simulate a different one.\n\u0009\u0009// Fake originalEvent to avoid donor's stopPropagation, but if the\n\u0009\u0009// simulated event prevents default then we do the same on the donor.\n\u0009\u0009var e = jQuery.extend(\n\u0009\u0009\u0009new jQuery.Event(),\n\u0009\u0009\u0009event,\n\u0009\u0009\u0009{\n\u0009\u0009\u0009\u0009type: type,\n\u0009\u0009\u0009\u0009isSimulated: true,\n\u0009\u0009\u0009\u0009originalEvent: {}\n\u0009\u0009\u0009}\n\u0009\u0009);\n\u0009\u0009if ( bubble ) {\n\u0009\u0009\u0009jQuery.event.trigger( e, null, elem );\n\u0009\u0009} else {\n\u0009\u0009\u0009jQuery.event.dispatch.call( elem, e );\n\u0009\u0009}\n\u0009\u0009if ( e.isDefaultPrevented() ) {\n\u0009\u0009\u0009event.preventDefault();\n\u0009\u0009}\n\u0009}\n};\n\njQuery.removeEvent = document.removeEventListener ?\n\u0009function( elem, type, handle ) {\n\u0009\u0009if ( elem.removeEventListener ) {\n\u0009\u0009\u0009elem.removeEventListener( type, handle, false );\n\u0009\u0009}\n\u0009} :\n\u0009function( elem, type, handle ) {\n\u0009\u0009var name = \"on\" + type;\n\n\u0009\u0009if ( elem.detachEvent ) {\n\n\u0009\u0009\u0009// #8545, #7054, preventing memory leaks for custom events in IE6-8\n\u0009\u0009\u0009// detachEvent needed property on element, by name of that event, to properly expose it to GC\n\u0009\u0009\u0009if ( typeof elem[ name ] === strundefined ) {\n\u0009\u0009\u0009\u0009elem[ name ] = null;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009elem.detachEvent( name, handle );\n\u0009\u0009}\n\u0009};\n\njQuery.Event = function( src, props ) {\n\u0009// Allow instantiation without the 'new' keyword\n\u0009if ( !(this instanceof jQuery.Event) ) {\n\u0009\u0009return new jQuery.Event( src, props );\n\u0009}\n\n\u0009// Event object\n\u0009if ( src && src.type ) {\n\u0009\u0009this.originalEvent = src;\n\u0009\u0009this.type = src.type;\n\n\u0009\u0009// Events bubbling up the document may have been marked as prevented\n\u0009\u0009// by a handler lower down the tree; reflect the correct value.\n\u0009\u0009this.isDefaultPrevented = src.defaultPrevented ||\n\u0009\u0009\u0009\u0009src.defaultPrevented === undefined &&\n\u0009\u0009\u0009\u0009// Support: IE < 9, Android < 4.0\n\u0009\u0009\u0009\u0009src.returnValue === false ?\n\u0009\u0009\u0009returnTrue :\n\u0009\u0009\u0009returnFalse;\n\n\u0009// Event type\n\u0009} else {\n\u0009\u0009this.type = src;\n\u0009}\n\n\u0009// Put explicitly provided properties onto the event object\n\u0009if ( props ) {\n\u0009\u0009jQuery.extend( this, props );\n\u0009}\n\n\u0009// Create a timestamp if incoming event doesn't have one\n\u0009this.timeStamp = src && src.timeStamp || jQuery.now();\n\n\u0009// Mark it as fixed\n\u0009this[ jQuery.expando ] = true;\n};\n\n// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding\n// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html\njQuery.Event.prototype = {\n\u0009isDefaultPrevented: returnFalse,\n\u0009isPropagationStopped: returnFalse,\n\u0009isImmediatePropagationStopped: returnFalse,\n\n\u0009preventDefault: function() {\n\u0009\u0009var e = this.originalEvent;\n\n\u0009\u0009this.isDefaultPrevented = returnTrue;\n\u0009\u0009if ( !e ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// If preventDefault exists, run it on the original event\n\u0009\u0009if ( e.preventDefault ) {\n\u0009\u0009\u0009e.preventDefault();\n\n\u0009\u0009// Support: IE\n\u0009\u0009// Otherwise set the returnValue property of the original event to false\n\u0009\u0009} else {\n\u0009\u0009\u0009e.returnValue = false;\n\u0009\u0009}\n\u0009},\n\u0009stopPropagation: function() {\n\u0009\u0009var e = this.originalEvent;\n\n\u0009\u0009this.isPropagationStopped = returnTrue;\n\u0009\u0009if ( !e ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\u0009\u0009// If stopPropagation exists, run it on the original event\n\u0009\u0009if ( e.stopPropagation ) {\n\u0009\u0009\u0009e.stopPropagation();\n\u0009\u0009}\n\n\u0009\u0009// Support: IE\n\u0009\u0009// Set the cancelBubble property of the original event to true\n\u0009\u0009e.cancelBubble = true;\n\u0009},\n\u0009stopImmediatePropagation: function() {\n\u0009\u0009var e = this.originalEvent;\n\n\u0009\u0009this.isImmediatePropagationStopped = returnTrue;\n\n\u0009\u0009if ( e && e.stopImmediatePropagation ) {\n\u0009\u0009\u0009e.stopImmediatePropagation();\n\u0009\u0009}\n\n\u0009\u0009this.stopPropagation();\n\u0009}\n};\n\n// Create mouseenter/leave events using mouseover/out and event-time checks\njQuery.each({\n\u0009mouseenter: \"mouseover\",\n\u0009mouseleave: \"mouseout\",\n\u0009pointerenter: \"pointerover\",\n\u0009pointerleave: \"pointerout\"\n}, function( orig, fix ) {\n\u0009jQuery.event.special[ orig ] = {\n\u0009\u0009delegateType: fix,\n\u0009\u0009bindType: fix,\n\n\u0009\u0009handle: function( event ) {\n\u0009\u0009\u0009var ret,\n\u0009\u0009\u0009\u0009target = this,\n\u0009\u0009\u0009\u0009related = event.relatedTarget,\n\u0009\u0009\u0009\u0009handleObj = event.handleObj;\n\n\u0009\u0009\u0009// For mousenter/leave call the handler if related is outside the target.\n\u0009\u0009\u0009// NB: No relatedTarget if the mouse left/entered the browser window\n\u0009\u0009\u0009if ( !related || (related !== target && !jQuery.contains( target, related )) ) {\n\u0009\u0009\u0009\u0009event.type = handleObj.origType;\n\u0009\u0009\u0009\u0009ret = handleObj.handler.apply( this, arguments );\n\u0009\u0009\u0009\u0009event.type = fix;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return ret;\n\u0009\u0009}\n\u0009};\n});\n\n// IE submit delegation\nif ( !support.submitBubbles ) {\n\n\u0009jQuery.event.special.submit = {\n\u0009\u0009setup: function() {\n\u0009\u0009\u0009// Only need this for delegated form submit events\n\u0009\u0009\u0009if ( jQuery.nodeName( this, \"form\" ) ) {\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Lazy-add a submit handler when a descendant form may potentially be submitted\n\u0009\u0009\u0009jQuery.event.add( this, \"click._submit keypress._submit\", function( e ) {\n\u0009\u0009\u0009\u0009// Node name check avoids a VML-related crash in IE (#9807)\n\u0009\u0009\u0009\u0009var elem = e.target,\n\u0009\u0009\u0009\u0009\u0009form = jQuery.nodeName( elem, \"input\" ) || jQuery.nodeName( elem, \"button\" ) ? elem.form : undefined;\n\u0009\u0009\u0009\u0009if ( form && !jQuery._data( form, \"submitBubbles\" ) ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.event.add( form, \"submit._submit\", function( event ) {\n\u0009\u0009\u0009\u0009\u0009\u0009event._submit_bubble = true;\n\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009\u0009jQuery._data( form, \"submitBubbles\", true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009});\n\u0009\u0009\u0009// return undefined since we don't need an event listener\n\u0009\u0009},\n\n\u0009\u0009postDispatch: function( event ) {\n\u0009\u0009\u0009// If form was submitted by the user, bubble the event up the tree\n\u0009\u0009\u0009if ( event._submit_bubble ) {\n\u0009\u0009\u0009\u0009delete event._submit_bubble;\n\u0009\u0009\u0009\u0009if ( this.parentNode && !event.isTrigger ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.event.simulate( \"submit\", this.parentNode, event, true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009},\n\n\u0009\u0009teardown: function() {\n\u0009\u0009\u0009// Only need this for delegated form submit events\n\u0009\u0009\u0009if ( jQuery.nodeName( this, \"form\" ) ) {\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Remove delegated handlers; cleanData eventually reaps submit handlers attached above\n\u0009\u0009\u0009jQuery.event.remove( this, \"._submit\" );\n\u0009\u0009}\n\u0009};\n}\n\n// IE change delegation and checkbox/radio fix\nif ( !support.changeBubbles ) {\n\n\u0009jQuery.event.special.change = {\n\n\u0009\u0009setup: function() {\n\n\u0009\u0009\u0009if ( rformElems.test( this.nodeName ) ) {\n\u0009\u0009\u0009\u0009// IE doesn't fire change on a check/radio until blur; trigger it on click\n\u0009\u0009\u0009\u0009// after a propertychange. Eat the blur-change in special.change.handle.\n\u0009\u0009\u0009\u0009// This still fires onchange a second time for check/radio after blur.\n\u0009\u0009\u0009\u0009if ( this.type === \"checkbox\" || this.type === \"radio\" ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.event.add( this, \"propertychange._change\", function( event ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( event.originalEvent.propertyName === \"checked\" ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009this._just_changed = true;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009\u0009jQuery.event.add( this, \"click._change\", function( event ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( this._just_changed && !event.isTrigger ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009this._just_changed = false;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009// Allow triggered, simulated change events (#11500)\n\u0009\u0009\u0009\u0009\u0009\u0009jQuery.event.simulate( \"change\", this, event, true );\n\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009// Delegated event; lazy-add a change handler on descendant inputs\n\u0009\u0009\u0009jQuery.event.add( this, \"beforeactivate._change\", function( e ) {\n\u0009\u0009\u0009\u0009var elem = e.target;\n\n\u0009\u0009\u0009\u0009if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, \"changeBubbles\" ) ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.event.add( elem, \"change._change\", function( event ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery.event.simulate( \"change\", this.parentNode, event, true );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009\u0009\u0009jQuery._data( elem, \"changeBubbles\", true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009});\n\u0009\u0009},\n\n\u0009\u0009handle: function( event ) {\n\u0009\u0009\u0009var elem = event.target;\n\n\u0009\u0009\u0009// Swallow native change events from checkbox/radio, we already triggered them above\n\u0009\u0009\u0009if ( this !== elem || event.isSimulated || event.isTrigger || (elem.type !== \"radio\" && elem.type !== \"checkbox\") ) {\n\u0009\u0009\u0009\u0009return event.handleObj.handler.apply( this, arguments );\n\u0009\u0009\u0009}\n\u0009\u0009},\n\n\u0009\u0009teardown: function() {\n\u0009\u0009\u0009jQuery.event.remove( this, \"._change\" );\n\n\u0009\u0009\u0009return !rformElems.test( this.nodeName );\n\u0009\u0009}\n\u0009};\n}\n\n// Create \"bubbling\" focus and blur events\nif ( !support.focusinBubbles ) {\n\u0009jQuery.each({ focus: \"focusin\", blur: \"focusout\" }, function( orig, fix ) {\n\n\u0009\u0009// Attach a single capturing handler on the document while someone wants focusin/focusout\n\u0009\u0009var handler = function( event ) {\n\u0009\u0009\u0009\u0009jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );\n\u0009\u0009\u0009};\n\n\u0009\u0009jQuery.event.special[ fix ] = {\n\u0009\u0009\u0009setup: function() {\n\u0009\u0009\u0009\u0009var doc = this.ownerDocument || this,\n\u0009\u0009\u0009\u0009\u0009attaches = jQuery._data( doc, fix );\n\n\u0009\u0009\u0009\u0009if ( !attaches ) {\n\u0009\u0009\u0009\u0009\u0009doc.addEventListener( orig, handler, true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009jQuery._data( doc, fix, ( attaches || 0 ) + 1 );\n\u0009\u0009\u0009},\n\u0009\u0009\u0009teardown: function() {\n\u0009\u0009\u0009\u0009var doc = this.ownerDocument || this,\n\u0009\u0009\u0009\u0009\u0009attaches = jQuery._data( doc, fix ) - 1;\n\n\u0009\u0009\u0009\u0009if ( !attaches ) {\n\u0009\u0009\u0009\u0009\u0009doc.removeEventListener( orig, handler, true );\n\u0009\u0009\u0009\u0009\u0009jQuery._removeData( doc, fix );\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009jQuery._data( doc, fix, attaches );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009};\n\u0009});\n}\n\njQuery.fn.extend({\n\n\u0009on: function( types, selector, data, fn, /*INTERNAL*/ one ) {\n\u0009\u0009var type, origFn;\n\n\u0009\u0009// Types can be a map of types/handlers\n\u0009\u0009if ( typeof types === \"object\" ) {\n\u0009\u0009\u0009// ( types-Object, selector, data )\n\u0009\u0009\u0009if ( typeof selector !== \"string\" ) {\n\u0009\u0009\u0009\u0009// ( types-Object, data )\n\u0009\u0009\u0009\u0009data = data || selector;\n\u0009\u0009\u0009\u0009selector = undefined;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009for ( type in types ) {\n\u0009\u0009\u0009\u0009this.on( type, selector, data, types[ type ], one );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return this;\n\u0009\u0009}\n\n\u0009\u0009if ( data == null && fn == null ) {\n\u0009\u0009\u0009// ( types, fn )\n\u0009\u0009\u0009fn = selector;\n\u0009\u0009\u0009data = selector = undefined;\n\u0009\u0009} else if ( fn == null ) {\n\u0009\u0009\u0009if ( typeof selector === \"string\" ) {\n\u0009\u0009\u0009\u0009// ( types, selector, fn )\n\u0009\u0009\u0009\u0009fn = data;\n\u0009\u0009\u0009\u0009data = undefined;\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009// ( types, data, fn )\n\u0009\u0009\u0009\u0009fn = data;\n\u0009\u0009\u0009\u0009data = selector;\n\u0009\u0009\u0009\u0009selector = undefined;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009\u0009if ( fn === false ) {\n\u0009\u0009\u0009fn = returnFalse;\n\u0009\u0009} else if ( !fn ) {\n\u0009\u0009\u0009return this;\n\u0009\u0009}\n\n\u0009\u0009if ( one === 1 ) {\n\u0009\u0009\u0009origFn = fn;\n\u0009\u0009\u0009fn = function( event ) {\n\u0009\u0009\u0009\u0009// Can use an empty set, since event contains the info\n\u0009\u0009\u0009\u0009jQuery().off( event );\n\u0009\u0009\u0009\u0009return origFn.apply( this, arguments );\n\u0009\u0009\u0009};\n\u0009\u0009\u0009// Use same guid so caller can remove using origFn\n\u0009\u0009\u0009fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );\n\u0009\u0009}\n\u0009\u0009return this.each( function() {\n\u0009\u0009\u0009jQuery.event.add( this, types, fn, data, selector );\n\u0009\u0009});\n\u0009},\n\u0009one: function( types, selector, data, fn ) {\n\u0009\u0009return this.on( types, selector, data, fn, 1 );\n\u0009},\n\u0009off: function( types, selector, fn ) {\n\u0009\u0009var handleObj, type;\n\u0009\u0009if ( types && types.preventDefault && types.handleObj ) {\n\u0009\u0009\u0009// ( event )  dispatched jQuery.Event\n\u0009\u0009\u0009handleObj = types.handleObj;\n\u0009\u0009\u0009jQuery( types.delegateTarget ).off(\n\u0009\u0009\u0009\u0009handleObj.namespace ? handleObj.origType + \".\" + handleObj.namespace : handleObj.origType,\n\u0009\u0009\u0009\u0009handleObj.selector,\n\u0009\u0009\u0009\u0009handleObj.handler\n\u0009\u0009\u0009);\n\u0009\u0009\u0009return this;\n\u0009\u0009}\n\u0009\u0009if ( typeof types === \"object\" ) {\n\u0009\u0009\u0009// ( types-object [, selector] )\n\u0009\u0009\u0009for ( type in types ) {\n\u0009\u0009\u0009\u0009this.off( type, selector, types[ type ] );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return this;\n\u0009\u0009}\n\u0009\u0009if ( selector === false || typeof selector === \"function\" ) {\n\u0009\u0009\u0009// ( types [, fn] )\n\u0009\u0009\u0009fn = selector;\n\u0009\u0009\u0009selector = undefined;\n\u0009\u0009}\n\u0009\u0009if ( fn === false ) {\n\u0009\u0009\u0009fn = returnFalse;\n\u0009\u0009}\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009jQuery.event.remove( this, types, fn, selector );\n\u0009\u0009});\n\u0009},\n\n\u0009trigger: function( type, data ) {\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009jQuery.event.trigger( type, data, this );\n\u0009\u0009});\n\u0009},\n\u0009triggerHandler: function( type, data ) {\n\u0009\u0009var elem = this[0];\n\u0009\u0009if ( elem ) {\n\u0009\u0009\u0009return jQuery.event.trigger( type, data, elem, true );\n\u0009\u0009}\n\u0009}\n});\n\n\nfunction createSafeFragment( document ) {\n\u0009var list = nodeNames.split( \"|\" ),\n\u0009\u0009safeFrag = document.createDocumentFragment();\n\n\u0009if ( safeFrag.createElement ) {\n\u0009\u0009while ( list.length ) {\n\u0009\u0009\u0009safeFrag.createElement(\n\u0009\u0009\u0009\u0009list.pop()\n\u0009\u0009\u0009);\n\u0009\u0009}\n\u0009}\n\u0009return safeFrag;\n}\n\nvar nodeNames = \"abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|\" +\n\u0009\u0009\"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video\",\n\u0009rinlinejQuery = / jQuery\\d+=\"(?:null|\\d+)\"/g,\n\u0009rnoshimcache = new RegExp(\"<(?:\" + nodeNames + \")[\\\\s/>]\", \"i\"),\n\u0009rleadingWhitespace = /^\\s+/,\n\u0009rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\\w:]+)[^>]*)\\/>/gi,\n\u0009rtagName = /<([\\w:]+)/,\n\u0009rtbody = /<tbody/i,\n\u0009rhtml = /<|&#?\\w+;/,\n\u0009rnoInnerhtml = /<(?:script|style|link)/i,\n\u0009// checked=\"checked\" or checked\n\u0009rchecked = /checked\\s*(?:[^=]|=\\s*.checked.)/i,\n\u0009rscriptType = /^$|\\/(?:java|ecma)script/i,\n\u0009rscriptTypeMasked = /^true\\/(.*)/,\n\u0009rcleanScript = /^\\s*<!(?:\\[CDATA\\[|--)|(?:\\]\\]|--)>\\s*$/g,\n\n\u0009// We have to close these tags to support XHTML (#13200)\n\u0009wrapMap = {\n\u0009\u0009option: [ 1, \"<select multiple='multiple'>\", \"</select>\" ],\n\u0009\u0009legend: [ 1, \"<fieldset>\", \"</fieldset>\" ],\n\u0009\u0009area: [ 1, \"<map>\", \"</map>\" ],\n\u0009\u0009param: [ 1, \"<object>\", \"</object>\" ],\n\u0009\u0009thead: [ 1, \"<table>\", \"</table>\" ],\n\u0009\u0009tr: [ 2, \"<table><tbody>\", \"</tbody></table>\" ],\n\u0009\u0009col: [ 2, \"<table><tbody></tbody><colgroup>\", \"</colgroup></table>\" ],\n\u0009\u0009td: [ 3, \"<table><tbody><tr>\", \"</tr></tbody></table>\" ],\n\n\u0009\u0009// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,\n\u0009\u0009// unless wrapped in a div with non-breaking characters in front of it.\n\u0009\u0009_default: support.htmlSerialize ? [ 0, \"\", \"\" ] : [ 1, \"X<div>\", \"</div>\"  ]\n\u0009},\n\u0009safeFragment = createSafeFragment( document ),\n\u0009fragmentDiv = safeFragment.appendChild( document.createElement(\"div\") );\n\nwrapMap.optgroup = wrapMap.option;\nwrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;\nwrapMap.th = wrapMap.td;\n\nfunction getAll( context, tag ) {\n\u0009var elems, elem,\n\u0009\u0009i = 0,\n\u0009\u0009found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName( tag || \"*\" ) :\n\u0009\u0009\u0009typeof context.querySelectorAll !== strundefined ? context.querySelectorAll( tag || \"*\" ) :\n\u0009\u0009\u0009undefined;\n\n\u0009if ( !found ) {\n\u0009\u0009for ( found = [], elems = context.childNodes || context; (elem = elems[i]) != null; i++ ) {\n\u0009\u0009\u0009if ( !tag || jQuery.nodeName( elem, tag ) ) {\n\u0009\u0009\u0009\u0009found.push( elem );\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009jQuery.merge( found, getAll( elem, tag ) );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009return tag === undefined || tag && jQuery.nodeName( context, tag ) ?\n\u0009\u0009jQuery.merge( [ context ], found ) :\n\u0009\u0009found;\n}\n\n// Used in buildFragment, fixes the defaultChecked property\nfunction fixDefaultChecked( elem ) {\n\u0009if ( rcheckableType.test( elem.type ) ) {\n\u0009\u0009elem.defaultChecked = elem.checked;\n\u0009}\n}\n\n// Support: IE<8\n// Manipulating tables requires a tbody\nfunction manipulationTarget( elem, content ) {\n\u0009return jQuery.nodeName( elem, \"table\" ) &&\n\u0009\u0009jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, \"tr\" ) ?\n\n\u0009\u0009elem.getElementsByTagName(\"tbody\")[0] ||\n\u0009\u0009\u0009elem.appendChild( elem.ownerDocument.createElement(\"tbody\") ) :\n\u0009\u0009elem;\n}\n\n// Replace/restore the type attribute of script elements for safe DOM manipulation\nfunction disableScript( elem ) {\n\u0009elem.type = (jQuery.find.attr( elem, \"type\" ) !== null) + \"/\" + elem.type;\n\u0009return elem;\n}\nfunction restoreScript( elem ) {\n\u0009var match = rscriptTypeMasked.exec( elem.type );\n\u0009if ( match ) {\n\u0009\u0009elem.type = match[1];\n\u0009} else {\n\u0009\u0009elem.removeAttribute(\"type\");\n\u0009}\n\u0009return elem;\n}\n\n// Mark scripts as having already been evaluated\nfunction setGlobalEval( elems, refElements ) {\n\u0009var elem,\n\u0009\u0009i = 0;\n\u0009for ( ; (elem = elems[i]) != null; i++ ) {\n\u0009\u0009jQuery._data( elem, \"globalEval\", !refElements || jQuery._data( refElements[i], \"globalEval\" ) );\n\u0009}\n}\n\nfunction cloneCopyEvent( src, dest ) {\n\n\u0009if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {\n\u0009\u0009return;\n\u0009}\n\n\u0009var type, i, l,\n\u0009\u0009oldData = jQuery._data( src ),\n\u0009\u0009curData = jQuery._data( dest, oldData ),\n\u0009\u0009events = oldData.events;\n\n\u0009if ( events ) {\n\u0009\u0009delete curData.handle;\n\u0009\u0009curData.events = {};\n\n\u0009\u0009for ( type in events ) {\n\u0009\u0009\u0009for ( i = 0, l = events[ type ].length; i < l; i++ ) {\n\u0009\u0009\u0009\u0009jQuery.event.add( dest, type, events[ type ][ i ] );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009// make the cloned public data object a copy from the original\n\u0009if ( curData.data ) {\n\u0009\u0009curData.data = jQuery.extend( {}, curData.data );\n\u0009}\n}\n\nfunction fixCloneNodeIssues( src, dest ) {\n\u0009var nodeName, e, data;\n\n\u0009// We do not need to do anything for non-Elements\n\u0009if ( dest.nodeType !== 1 ) {\n\u0009\u0009return;\n\u0009}\n\n\u0009nodeName = dest.nodeName.toLowerCase();\n\n\u0009// IE6-8 copies events bound via attachEvent when using cloneNode.\n\u0009if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {\n\u0009\u0009data = jQuery._data( dest );\n\n\u0009\u0009for ( e in data.events ) {\n\u0009\u0009\u0009jQuery.removeEvent( dest, e, data.handle );\n\u0009\u0009}\n\n\u0009\u0009// Event data gets referenced instead of copied if the expando gets copied too\n\u0009\u0009dest.removeAttribute( jQuery.expando );\n\u0009}\n\n\u0009// IE blanks contents when cloning scripts, and tries to evaluate newly-set text\n\u0009if ( nodeName === \"script\" && dest.text !== src.text ) {\n\u0009\u0009disableScript( dest ).text = src.text;\n\u0009\u0009restoreScript( dest );\n\n\u0009// IE6-10 improperly clones children of object elements using classid.\n\u0009// IE10 throws NoModificationAllowedError if parent is null, #12132.\n\u0009} else if ( nodeName === \"object\" ) {\n\u0009\u0009if ( dest.parentNode ) {\n\u0009\u0009\u0009dest.outerHTML = src.outerHTML;\n\u0009\u0009}\n\n\u0009\u0009// This path appears unavoidable for IE9. When cloning an object\n\u0009\u0009// element in IE9, the outerHTML strategy above is not sufficient.\n\u0009\u0009// If the src has innerHTML and the destination does not,\n\u0009\u0009// copy the src.innerHTML into the dest.innerHTML. #10324\n\u0009\u0009if ( support.html5Clone && ( src.innerHTML && !jQuery.trim(dest.innerHTML) ) ) {\n\u0009\u0009\u0009dest.innerHTML = src.innerHTML;\n\u0009\u0009}\n\n\u0009} else if ( nodeName === \"input\" && rcheckableType.test( src.type ) ) {\n\u0009\u0009// IE6-8 fails to persist the checked state of a cloned checkbox\n\u0009\u0009// or radio button. Worse, IE6-7 fail to give the cloned element\n\u0009\u0009// a checked appearance if the defaultChecked value isn't also set\n\n\u0009\u0009dest.defaultChecked = dest.checked = src.checked;\n\n\u0009\u0009// IE6-7 get confused and end up setting the value of a cloned\n\u0009\u0009// checkbox/radio button to an empty string instead of \"on\"\n\u0009\u0009if ( dest.value !== src.value ) {\n\u0009\u0009\u0009dest.value = src.value;\n\u0009\u0009}\n\n\u0009// IE6-8 fails to return the selected option to the default selected\n\u0009// state when cloning options\n\u0009} else if ( nodeName === \"option\" ) {\n\u0009\u0009dest.defaultSelected = dest.selected = src.defaultSelected;\n\n\u0009// IE6-8 fails to set the defaultValue to the correct value when\n\u0009// cloning other types of input fields\n\u0009} else if ( nodeName === \"input\" || nodeName === \"textarea\" ) {\n\u0009\u0009dest.defaultValue = src.defaultValue;\n\u0009}\n}\n\njQuery.extend({\n\u0009clone: function( elem, dataAndEvents, deepDataAndEvents ) {\n\u0009\u0009var destElements, node, clone, i, srcElements,\n\u0009\u0009\u0009inPage = jQuery.contains( elem.ownerDocument, elem );\n\n\u0009\u0009if ( support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test( \"<\" + elem.nodeName + \">\" ) ) {\n\u0009\u0009\u0009clone = elem.cloneNode( true );\n\n\u0009\u0009// IE<=8 does not properly clone detached, unknown element nodes\n\u0009\u0009} else {\n\u0009\u0009\u0009fragmentDiv.innerHTML = elem.outerHTML;\n\u0009\u0009\u0009fragmentDiv.removeChild( clone = fragmentDiv.firstChild );\n\u0009\u0009}\n\n\u0009\u0009if ( (!support.noCloneEvent || !support.noCloneChecked) &&\n\u0009\u0009\u0009\u0009(elem.nodeType === 1 || elem.nodeType === 11) && !jQuery.isXMLDoc(elem) ) {\n\n\u0009\u0009\u0009// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2\n\u0009\u0009\u0009destElements = getAll( clone );\n\u0009\u0009\u0009srcElements = getAll( elem );\n\n\u0009\u0009\u0009// Fix all IE cloning issues\n\u0009\u0009\u0009for ( i = 0; (node = srcElements[i]) != null; ++i ) {\n\u0009\u0009\u0009\u0009// Ensure that the destination node is not null; Fixes #9587\n\u0009\u0009\u0009\u0009if ( destElements[i] ) {\n\u0009\u0009\u0009\u0009\u0009fixCloneNodeIssues( node, destElements[i] );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Copy the events from the original to the clone\n\u0009\u0009if ( dataAndEvents ) {\n\u0009\u0009\u0009if ( deepDataAndEvents ) {\n\u0009\u0009\u0009\u0009srcElements = srcElements || getAll( elem );\n\u0009\u0009\u0009\u0009destElements = destElements || getAll( clone );\n\n\u0009\u0009\u0009\u0009for ( i = 0; (node = srcElements[i]) != null; i++ ) {\n\u0009\u0009\u0009\u0009\u0009cloneCopyEvent( node, destElements[i] );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009cloneCopyEvent( elem, clone );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Preserve script evaluation history\n\u0009\u0009destElements = getAll( clone, \"script\" );\n\u0009\u0009if ( destElements.length > 0 ) {\n\u0009\u0009\u0009setGlobalEval( destElements, !inPage && getAll( elem, \"script\" ) );\n\u0009\u0009}\n\n\u0009\u0009destElements = srcElements = node = null;\n\n\u0009\u0009// Return the cloned set\n\u0009\u0009return clone;\n\u0009},\n\n\u0009buildFragment: function( elems, context, scripts, selection ) {\n\u0009\u0009var j, elem, contains,\n\u0009\u0009\u0009tmp, tag, tbody, wrap,\n\u0009\u0009\u0009l = elems.length,\n\n\u0009\u0009\u0009// Ensure a safe fragment\n\u0009\u0009\u0009safe = createSafeFragment( context ),\n\n\u0009\u0009\u0009nodes = [],\n\u0009\u0009\u0009i = 0;\n\n\u0009\u0009for ( ; i < l; i++ ) {\n\u0009\u0009\u0009elem = elems[ i ];\n\n\u0009\u0009\u0009if ( elem || elem === 0 ) {\n\n\u0009\u0009\u0009\u0009// Add nodes directly\n\u0009\u0009\u0009\u0009if ( jQuery.type( elem ) === \"object\" ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );\n\n\u0009\u0009\u0009\u0009// Convert non-html into a text node\n\u0009\u0009\u0009\u0009} else if ( !rhtml.test( elem ) ) {\n\u0009\u0009\u0009\u0009\u0009nodes.push( context.createTextNode( elem ) );\n\n\u0009\u0009\u0009\u0009// Convert html into DOM nodes\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009tmp = tmp || safe.appendChild( context.createElement(\"div\") );\n\n\u0009\u0009\u0009\u0009\u0009// Deserialize a standard representation\n\u0009\u0009\u0009\u0009\u0009tag = (rtagName.exec( elem ) || [ \"\", \"\" ])[ 1 ].toLowerCase();\n\u0009\u0009\u0009\u0009\u0009wrap = wrapMap[ tag ] || wrapMap._default;\n\n\u0009\u0009\u0009\u0009\u0009tmp.innerHTML = wrap[1] + elem.replace( rxhtmlTag, \"<$1></$2>\" ) + wrap[2];\n\n\u0009\u0009\u0009\u0009\u0009// Descend through wrappers to the right content\n\u0009\u0009\u0009\u0009\u0009j = wrap[0];\n\u0009\u0009\u0009\u0009\u0009while ( j-- ) {\n\u0009\u0009\u0009\u0009\u0009\u0009tmp = tmp.lastChild;\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Manually add leading whitespace removed by IE\n\u0009\u0009\u0009\u0009\u0009if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[0] ) );\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Remove IE's autoinserted <tbody> from table fragments\n\u0009\u0009\u0009\u0009\u0009if ( !support.tbody ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009// String was a <table>, *may* have spurious <tbody>\n\u0009\u0009\u0009\u0009\u0009\u0009elem = tag === \"table\" && !rtbody.test( elem ) ?\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009tmp.firstChild :\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// String was a bare <thead> or <tfoot>\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009wrap[1] === \"<table>\" && !rtbody.test( elem ) ?\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009tmp :\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u00090;\n\n\u0009\u0009\u0009\u0009\u0009\u0009j = elem && elem.childNodes.length;\n\u0009\u0009\u0009\u0009\u0009\u0009while ( j-- ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( jQuery.nodeName( (tbody = elem.childNodes[j]), \"tbody\" ) && !tbody.childNodes.length ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009elem.removeChild( tbody );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009jQuery.merge( nodes, tmp.childNodes );\n\n\u0009\u0009\u0009\u0009\u0009// Fix #12392 for WebKit and IE > 9\n\u0009\u0009\u0009\u0009\u0009tmp.textContent = \"\";\n\n\u0009\u0009\u0009\u0009\u0009// Fix #12392 for oldIE\n\u0009\u0009\u0009\u0009\u0009while ( tmp.firstChild ) {\n\u0009\u0009\u0009\u0009\u0009\u0009tmp.removeChild( tmp.firstChild );\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Remember the top-level container for proper cleanup\n\u0009\u0009\u0009\u0009\u0009tmp = safe.lastChild;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Fix #11356: Clear elements from fragment\n\u0009\u0009if ( tmp ) {\n\u0009\u0009\u0009safe.removeChild( tmp );\n\u0009\u0009}\n\n\u0009\u0009// Reset defaultChecked for any radios and checkboxes\n\u0009\u0009// about to be appended to the DOM in IE 6/7 (#8060)\n\u0009\u0009if ( !support.appendChecked ) {\n\u0009\u0009\u0009jQuery.grep( getAll( nodes, \"input\" ), fixDefaultChecked );\n\u0009\u0009}\n\n\u0009\u0009i = 0;\n\u0009\u0009while ( (elem = nodes[ i++ ]) ) {\n\n\u0009\u0009\u0009// #4087 - If origin and destination elements are the same, and this is\n\u0009\u0009\u0009// that element, do not do anything\n\u0009\u0009\u0009if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {\n\u0009\u0009\u0009\u0009continue;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009contains = jQuery.contains( elem.ownerDocument, elem );\n\n\u0009\u0009\u0009// Append to fragment\n\u0009\u0009\u0009tmp = getAll( safe.appendChild( elem ), \"script\" );\n\n\u0009\u0009\u0009// Preserve script evaluation history\n\u0009\u0009\u0009if ( contains ) {\n\u0009\u0009\u0009\u0009setGlobalEval( tmp );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Capture executables\n\u0009\u0009\u0009if ( scripts ) {\n\u0009\u0009\u0009\u0009j = 0;\n\u0009\u0009\u0009\u0009while ( (elem = tmp[ j++ ]) ) {\n\u0009\u0009\u0009\u0009\u0009if ( rscriptType.test( elem.type || \"\" ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009scripts.push( elem );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009tmp = null;\n\n\u0009\u0009return safe;\n\u0009},\n\n\u0009cleanData: function( elems, /* internal */ acceptData ) {\n\u0009\u0009var elem, type, id, data,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009internalKey = jQuery.expando,\n\u0009\u0009\u0009cache = jQuery.cache,\n\u0009\u0009\u0009deleteExpando = support.deleteExpando,\n\u0009\u0009\u0009special = jQuery.event.special;\n\n\u0009\u0009for ( ; (elem = elems[i]) != null; i++ ) {\n\u0009\u0009\u0009if ( acceptData || jQuery.acceptData( elem ) ) {\n\n\u0009\u0009\u0009\u0009id = elem[ internalKey ];\n\u0009\u0009\u0009\u0009data = id && cache[ id ];\n\n\u0009\u0009\u0009\u0009if ( data ) {\n\u0009\u0009\u0009\u0009\u0009if ( data.events ) {\n\u0009\u0009\u0009\u0009\u0009\u0009for ( type in data.events ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( special[ type ] ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery.event.remove( elem, type );\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// This is a shortcut to avoid jQuery.event.remove's overhead\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery.removeEvent( elem, type, data.handle );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Remove cache only if it was not already removed by jQuery.event.remove\n\u0009\u0009\u0009\u0009\u0009if ( cache[ id ] ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009delete cache[ id ];\n\n\u0009\u0009\u0009\u0009\u0009\u0009// IE does not allow us to delete expando properties from nodes,\n\u0009\u0009\u0009\u0009\u0009\u0009// nor does it have a removeAttribute function on Document nodes;\n\u0009\u0009\u0009\u0009\u0009\u0009// we must handle all of these cases\n\u0009\u0009\u0009\u0009\u0009\u0009if ( deleteExpando ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009delete elem[ internalKey ];\n\n\u0009\u0009\u0009\u0009\u0009\u0009} else if ( typeof elem.removeAttribute !== strundefined ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009elem.removeAttribute( internalKey );\n\n\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009elem[ internalKey ] = null;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009deletedIds.push( id );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n});\n\njQuery.fn.extend({\n\u0009text: function( value ) {\n\u0009\u0009return access( this, function( value ) {\n\u0009\u0009\u0009return value === undefined ?\n\u0009\u0009\u0009\u0009jQuery.text( this ) :\n\u0009\u0009\u0009\u0009this.empty().append( ( this[0] && this[0].ownerDocument || document ).createTextNode( value ) );\n\u0009\u0009}, null, value, arguments.length );\n\u0009},\n\n\u0009append: function() {\n\u0009\u0009return this.domManip( arguments, function( elem ) {\n\u0009\u0009\u0009if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {\n\u0009\u0009\u0009\u0009var target = manipulationTarget( this, elem );\n\u0009\u0009\u0009\u0009target.appendChild( elem );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\n\u0009prepend: function() {\n\u0009\u0009return this.domManip( arguments, function( elem ) {\n\u0009\u0009\u0009if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {\n\u0009\u0009\u0009\u0009var target = manipulationTarget( this, elem );\n\u0009\u0009\u0009\u0009target.insertBefore( elem, target.firstChild );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\n\u0009before: function() {\n\u0009\u0009return this.domManip( arguments, function( elem ) {\n\u0009\u0009\u0009if ( this.parentNode ) {\n\u0009\u0009\u0009\u0009this.parentNode.insertBefore( elem, this );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\n\u0009after: function() {\n\u0009\u0009return this.domManip( arguments, function( elem ) {\n\u0009\u0009\u0009if ( this.parentNode ) {\n\u0009\u0009\u0009\u0009this.parentNode.insertBefore( elem, this.nextSibling );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\n\u0009remove: function( selector, keepData /* Internal Use Only */ ) {\n\u0009\u0009var elem,\n\u0009\u0009\u0009elems = selector ? jQuery.filter( selector, this ) : this,\n\u0009\u0009\u0009i = 0;\n\n\u0009\u0009for ( ; (elem = elems[i]) != null; i++ ) {\n\n\u0009\u0009\u0009if ( !keepData && elem.nodeType === 1 ) {\n\u0009\u0009\u0009\u0009jQuery.cleanData( getAll( elem ) );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( elem.parentNode ) {\n\u0009\u0009\u0009\u0009if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {\n\u0009\u0009\u0009\u0009\u0009setGlobalEval( getAll( elem, \"script\" ) );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009elem.parentNode.removeChild( elem );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return this;\n\u0009},\n\n\u0009empty: function() {\n\u0009\u0009var elem,\n\u0009\u0009\u0009i = 0;\n\n\u0009\u0009for ( ; (elem = this[i]) != null; i++ ) {\n\u0009\u0009\u0009// Remove element nodes and prevent memory leaks\n\u0009\u0009\u0009if ( elem.nodeType === 1 ) {\n\u0009\u0009\u0009\u0009jQuery.cleanData( getAll( elem, false ) );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Remove any remaining nodes\n\u0009\u0009\u0009while ( elem.firstChild ) {\n\u0009\u0009\u0009\u0009elem.removeChild( elem.firstChild );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// If this is a select, ensure that it displays empty (#12336)\n\u0009\u0009\u0009// Support: IE<9\n\u0009\u0009\u0009if ( elem.options && jQuery.nodeName( elem, \"select\" ) ) {\n\u0009\u0009\u0009\u0009elem.options.length = 0;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return this;\n\u0009},\n\n\u0009clone: function( dataAndEvents, deepDataAndEvents ) {\n\u0009\u0009dataAndEvents = dataAndEvents == null ? false : dataAndEvents;\n\u0009\u0009deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;\n\n\u0009\u0009return this.map(function() {\n\u0009\u0009\u0009return jQuery.clone( this, dataAndEvents, deepDataAndEvents );\n\u0009\u0009});\n\u0009},\n\n\u0009html: function( value ) {\n\u0009\u0009return access( this, function( value ) {\n\u0009\u0009\u0009var elem = this[ 0 ] || {},\n\u0009\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009\u0009l = this.length;\n\n\u0009\u0009\u0009if ( value === undefined ) {\n\u0009\u0009\u0009\u0009return elem.nodeType === 1 ?\n\u0009\u0009\u0009\u0009\u0009elem.innerHTML.replace( rinlinejQuery, \"\" ) :\n\u0009\u0009\u0009\u0009\u0009undefined;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// See if we can take a shortcut and just use innerHTML\n\u0009\u0009\u0009if ( typeof value === \"string\" && !rnoInnerhtml.test( value ) &&\n\u0009\u0009\u0009\u0009( support.htmlSerialize || !rnoshimcache.test( value )  ) &&\n\u0009\u0009\u0009\u0009( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&\n\u0009\u0009\u0009\u0009!wrapMap[ (rtagName.exec( value ) || [ \"\", \"\" ])[ 1 ].toLowerCase() ] ) {\n\n\u0009\u0009\u0009\u0009value = value.replace( rxhtmlTag, \"<$1></$2>\" );\n\n\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009for (; i < l; i++ ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// Remove element nodes and prevent memory leaks\n\u0009\u0009\u0009\u0009\u0009\u0009elem = this[i] || {};\n\u0009\u0009\u0009\u0009\u0009\u0009if ( elem.nodeType === 1 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery.cleanData( getAll( elem, false ) );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009elem.innerHTML = value;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009elem = 0;\n\n\u0009\u0009\u0009\u0009// If using innerHTML throws an exception, use the fallback method\n\u0009\u0009\u0009\u0009} catch(e) {}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( elem ) {\n\u0009\u0009\u0009\u0009this.empty().append( value );\n\u0009\u0009\u0009}\n\u0009\u0009}, null, value, arguments.length );\n\u0009},\n\n\u0009replaceWith: function() {\n\u0009\u0009var arg = arguments[ 0 ];\n\n\u0009\u0009// Make the changes, replacing each context element with the new content\n\u0009\u0009this.domManip( arguments, function( elem ) {\n\u0009\u0009\u0009arg = this.parentNode;\n\n\u0009\u0009\u0009jQuery.cleanData( getAll( this ) );\n\n\u0009\u0009\u0009if ( arg ) {\n\u0009\u0009\u0009\u0009arg.replaceChild( elem, this );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\n\u0009\u0009// Force removal if there was no new content (e.g., from empty arguments)\n\u0009\u0009return arg && (arg.length || arg.nodeType) ? this : this.remove();\n\u0009},\n\n\u0009detach: function( selector ) {\n\u0009\u0009return this.remove( selector, true );\n\u0009},\n\n\u0009domManip: function( args, callback ) {\n\n\u0009\u0009// Flatten any nested arrays\n\u0009\u0009args = concat.apply( [], args );\n\n\u0009\u0009var first, node, hasScripts,\n\u0009\u0009\u0009scripts, doc, fragment,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009l = this.length,\n\u0009\u0009\u0009set = this,\n\u0009\u0009\u0009iNoClone = l - 1,\n\u0009\u0009\u0009value = args[0],\n\u0009\u0009\u0009isFunction = jQuery.isFunction( value );\n\n\u0009\u0009// We can't cloneNode fragments that contain checked, in WebKit\n\u0009\u0009if ( isFunction ||\n\u0009\u0009\u0009\u0009( l > 1 && typeof value === \"string\" &&\n\u0009\u0009\u0009\u0009\u0009!support.checkClone && rchecked.test( value ) ) ) {\n\u0009\u0009\u0009return this.each(function( index ) {\n\u0009\u0009\u0009\u0009var self = set.eq( index );\n\u0009\u0009\u0009\u0009if ( isFunction ) {\n\u0009\u0009\u0009\u0009\u0009args[0] = value.call( this, index, self.html() );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009self.domManip( args, callback );\n\u0009\u0009\u0009});\n\u0009\u0009}\n\n\u0009\u0009if ( l ) {\n\u0009\u0009\u0009fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );\n\u0009\u0009\u0009first = fragment.firstChild;\n\n\u0009\u0009\u0009if ( fragment.childNodes.length === 1 ) {\n\u0009\u0009\u0009\u0009fragment = first;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( first ) {\n\u0009\u0009\u0009\u0009scripts = jQuery.map( getAll( fragment, \"script\" ), disableScript );\n\u0009\u0009\u0009\u0009hasScripts = scripts.length;\n\n\u0009\u0009\u0009\u0009// Use the original fragment for the last item instead of the first because it can end up\n\u0009\u0009\u0009\u0009// being emptied incorrectly in certain situations (#8070).\n\u0009\u0009\u0009\u0009for ( ; i < l; i++ ) {\n\u0009\u0009\u0009\u0009\u0009node = fragment;\n\n\u0009\u0009\u0009\u0009\u0009if ( i !== iNoClone ) {\n\u0009\u0009\u0009\u0009\u0009\u0009node = jQuery.clone( node, true, true );\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Keep references to cloned scripts for later restoration\n\u0009\u0009\u0009\u0009\u0009\u0009if ( hasScripts ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery.merge( scripts, getAll( node, \"script\" ) );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009callback.call( this[i], node, i );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009if ( hasScripts ) {\n\u0009\u0009\u0009\u0009\u0009doc = scripts[ scripts.length - 1 ].ownerDocument;\n\n\u0009\u0009\u0009\u0009\u0009// Reenable scripts\n\u0009\u0009\u0009\u0009\u0009jQuery.map( scripts, restoreScript );\n\n\u0009\u0009\u0009\u0009\u0009// Evaluate executable scripts on first document insertion\n\u0009\u0009\u0009\u0009\u0009for ( i = 0; i < hasScripts; i++ ) {\n\u0009\u0009\u0009\u0009\u0009\u0009node = scripts[ i ];\n\u0009\u0009\u0009\u0009\u0009\u0009if ( rscriptType.test( node.type || \"\" ) &&\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009!jQuery._data( node, \"globalEval\" ) && jQuery.contains( doc, node ) ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( node.src ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Optional AJAX dependency, but won't run scripts if not present\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( jQuery._evalUrl ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery._evalUrl( node.src );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009jQuery.globalEval( ( node.text || node.textContent || node.innerHTML || \"\" ).replace( rcleanScript, \"\" ) );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Fix #11809: Avoid leaking memory\n\u0009\u0009\u0009\u0009fragment = first = null;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return this;\n\u0009}\n});\n\njQuery.each({\n\u0009appendTo: \"append\",\n\u0009prependTo: \"prepend\",\n\u0009insertBefore: \"before\",\n\u0009insertAfter: \"after\",\n\u0009replaceAll: \"replaceWith\"\n}, function( name, original ) {\n\u0009jQuery.fn[ name ] = function( selector ) {\n\u0009\u0009var elems,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009ret = [],\n\u0009\u0009\u0009insert = jQuery( selector ),\n\u0009\u0009\u0009last = insert.length - 1;\n\n\u0009\u0009for ( ; i <= last; i++ ) {\n\u0009\u0009\u0009elems = i === last ? this : this.clone(true);\n\u0009\u0009\u0009jQuery( insert[i] )[ original ]( elems );\n\n\u0009\u0009\u0009// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()\n\u0009\u0009\u0009push.apply( ret, elems.get() );\n\u0009\u0009}\n\n\u0009\u0009return this.pushStack( ret );\n\u0009};\n});\n\n\nvar iframe,\n\u0009elemdisplay = {};\n\n/**\n * Retrieve the actual display of a element\n * @param {String} name nodeName of the element\n * @param {Object} doc Document object\n */\n// Called only from within defaultDisplay\nfunction actualDisplay( name, doc ) {\n\u0009var style,\n\u0009\u0009elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),\n\n\u0009\u0009// getDefaultComputedStyle might be reliably used only on attached element\n\u0009\u0009display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?\n\n\u0009\u0009\u0009// Use of this method is a temporary fix (more like optmization) until something better comes along,\n\u0009\u0009\u0009// since it was removed from specification and supported only in FF\n\u0009\u0009\u0009style.display : jQuery.css( elem[ 0 ], \"display\" );\n\n\u0009// We don't have any data stored on the element,\n\u0009// so use \"detach\" method as fast way to get rid of the element\n\u0009elem.detach();\n\n\u0009return display;\n}\n\n/**\n * Try to determine the default display value of an element\n * @param {String} nodeName\n */\nfunction defaultDisplay( nodeName ) {\n\u0009var doc = document,\n\u0009\u0009display = elemdisplay[ nodeName ];\n\n\u0009if ( !display ) {\n\u0009\u0009display = actualDisplay( nodeName, doc );\n\n\u0009\u0009// If the simple way fails, read from inside an iframe\n\u0009\u0009if ( display === \"none\" || !display ) {\n\n\u0009\u0009\u0009// Use the already-created iframe if possible\n\u0009\u0009\u0009iframe = (iframe || jQuery( \"<iframe frameborder='0' width='0' height='0'/>\" )).appendTo( doc.documentElement );\n\n\u0009\u0009\u0009// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse\n\u0009\u0009\u0009doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;\n\n\u0009\u0009\u0009// Support: IE\n\u0009\u0009\u0009doc.write();\n\u0009\u0009\u0009doc.close();\n\n\u0009\u0009\u0009display = actualDisplay( nodeName, doc );\n\u0009\u0009\u0009iframe.detach();\n\u0009\u0009}\n\n\u0009\u0009// Store the correct default display\n\u0009\u0009elemdisplay[ nodeName ] = display;\n\u0009}\n\n\u0009return display;\n}\n\n\n(function() {\n\u0009var shrinkWrapBlocksVal;\n\n\u0009support.shrinkWrapBlocks = function() {\n\u0009\u0009if ( shrinkWrapBlocksVal != null ) {\n\u0009\u0009\u0009return shrinkWrapBlocksVal;\n\u0009\u0009}\n\n\u0009\u0009// Will be changed later if needed.\n\u0009\u0009shrinkWrapBlocksVal = false;\n\n\u0009\u0009// Minified: var b,c,d\n\u0009\u0009var div, body, container;\n\n\u0009\u0009body = document.getElementsByTagName( \"body\" )[ 0 ];\n\u0009\u0009if ( !body || !body.style ) {\n\u0009\u0009\u0009// Test fired too early or in an unsupported environment, exit.\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Setup\n\u0009\u0009div = document.createElement( \"div\" );\n\u0009\u0009container = document.createElement( \"div\" );\n\u0009\u0009container.style.cssText = \"position:absolute;border:0;width:0;height:0;top:0;left:-9999px\";\n\u0009\u0009body.appendChild( container ).appendChild( div );\n\n\u0009\u0009// Support: IE6\n\u0009\u0009// Check if elements with layout shrink-wrap their children\n\u0009\u0009if ( typeof div.style.zoom !== strundefined ) {\n\u0009\u0009\u0009// Reset CSS: box-sizing; display; margin; border\n\u0009\u0009\u0009div.style.cssText =\n\u0009\u0009\u0009\u0009// Support: Firefox<29, Android 2.3\n\u0009\u0009\u0009\u0009// Vendor-prefix box-sizing\n\u0009\u0009\u0009\u0009\"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;\" +\n\u0009\u0009\u0009\u0009\"box-sizing:content-box;display:block;margin:0;border:0;\" +\n\u0009\u0009\u0009\u0009\"padding:1px;width:1px;zoom:1\";\n\u0009\u0009\u0009div.appendChild( document.createElement( \"div\" ) ).style.width = \"5px\";\n\u0009\u0009\u0009shrinkWrapBlocksVal = div.offsetWidth !== 3;\n\u0009\u0009}\n\n\u0009\u0009body.removeChild( container );\n\n\u0009\u0009return shrinkWrapBlocksVal;\n\u0009};\n\n})();\nvar rmargin = (/^margin/);\n\nvar rnumnonpx = new RegExp( \"^(\" + pnum + \")(?!px)[a-z%]+$\", \"i\" );\n\n\n\nvar getStyles, curCSS,\n\u0009rposition = /^(top|right|bottom|left)$/;\n\nif ( window.getComputedStyle ) {\n\u0009getStyles = function( elem ) {\n\u0009\u0009// Support: IE<=11+, Firefox<=30+ (#15098, #14150)\n\u0009\u0009// IE throws on elements created in popups\n\u0009\u0009// FF meanwhile throws on frame elements through \"defaultView.getComputedStyle\"\n\u0009\u0009if ( elem.ownerDocument.defaultView.opener ) {\n\u0009\u0009\u0009return elem.ownerDocument.defaultView.getComputedStyle( elem, null );\n\u0009\u0009}\n\n\u0009\u0009return window.getComputedStyle( elem, null );\n\u0009};\n\n\u0009curCSS = function( elem, name, computed ) {\n\u0009\u0009var width, minWidth, maxWidth, ret,\n\u0009\u0009\u0009style = elem.style;\n\n\u0009\u0009computed = computed || getStyles( elem );\n\n\u0009\u0009// getPropertyValue is only needed for .css('filter') in IE9, see #12537\n\u0009\u0009ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;\n\n\u0009\u0009if ( computed ) {\n\n\u0009\u0009\u0009if ( ret === \"\" && !jQuery.contains( elem.ownerDocument, elem ) ) {\n\u0009\u0009\u0009\u0009ret = jQuery.style( elem, name );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// A tribute to the \"awesome hack by Dean Edwards\"\n\u0009\u0009\u0009// Chrome < 17 and Safari 5.0 uses \"computed value\" instead of \"used value\" for margin-right\n\u0009\u0009\u0009// Safari 5.1.7 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels\n\u0009\u0009\u0009// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values\n\u0009\u0009\u0009if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {\n\n\u0009\u0009\u0009\u0009// Remember the original values\n\u0009\u0009\u0009\u0009width = style.width;\n\u0009\u0009\u0009\u0009minWidth = style.minWidth;\n\u0009\u0009\u0009\u0009maxWidth = style.maxWidth;\n\n\u0009\u0009\u0009\u0009// Put in the new values to get a computed value out\n\u0009\u0009\u0009\u0009style.minWidth = style.maxWidth = style.width = ret;\n\u0009\u0009\u0009\u0009ret = computed.width;\n\n\u0009\u0009\u0009\u0009// Revert the changed values\n\u0009\u0009\u0009\u0009style.width = width;\n\u0009\u0009\u0009\u0009style.minWidth = minWidth;\n\u0009\u0009\u0009\u0009style.maxWidth = maxWidth;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Support: IE\n\u0009\u0009// IE returns zIndex value as an integer.\n\u0009\u0009return ret === undefined ?\n\u0009\u0009\u0009ret :\n\u0009\u0009\u0009ret + \"\";\n\u0009};\n} else if ( document.documentElement.currentStyle ) {\n\u0009getStyles = function( elem ) {\n\u0009\u0009return elem.currentStyle;\n\u0009};\n\n\u0009curCSS = function( elem, name, computed ) {\n\u0009\u0009var left, rs, rsLeft, ret,\n\u0009\u0009\u0009style = elem.style;\n\n\u0009\u0009computed = computed || getStyles( elem );\n\u0009\u0009ret = computed ? computed[ name ] : undefined;\n\n\u0009\u0009// Avoid setting ret to empty string here\n\u0009\u0009// so we don't default to auto\n\u0009\u0009if ( ret == null && style && style[ name ] ) {\n\u0009\u0009\u0009ret = style[ name ];\n\u0009\u0009}\n\n\u0009\u0009// From the awesome hack by Dean Edwards\n\u0009\u0009// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291\n\n\u0009\u0009// If we're not dealing with a regular pixel number\n\u0009\u0009// but a number that has a weird ending, we need to convert it to pixels\n\u0009\u0009// but not position css attributes, as those are proportional to the parent element instead\n\u0009\u0009// and we can't measure the parent instead because it might trigger a \"stacking dolls\" problem\n\u0009\u0009if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {\n\n\u0009\u0009\u0009// Remember the original values\n\u0009\u0009\u0009left = style.left;\n\u0009\u0009\u0009rs = elem.runtimeStyle;\n\u0009\u0009\u0009rsLeft = rs && rs.left;\n\n\u0009\u0009\u0009// Put in the new values to get a computed value out\n\u0009\u0009\u0009if ( rsLeft ) {\n\u0009\u0009\u0009\u0009rs.left = elem.currentStyle.left;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009style.left = name === \"fontSize\" ? \"1em\" : ret;\n\u0009\u0009\u0009ret = style.pixelLeft + \"px\";\n\n\u0009\u0009\u0009// Revert the changed values\n\u0009\u0009\u0009style.left = left;\n\u0009\u0009\u0009if ( rsLeft ) {\n\u0009\u0009\u0009\u0009rs.left = rsLeft;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Support: IE\n\u0009\u0009// IE returns zIndex value as an integer.\n\u0009\u0009return ret === undefined ?\n\u0009\u0009\u0009ret :\n\u0009\u0009\u0009ret + \"\" || \"auto\";\n\u0009};\n}\n\n\n\n\nfunction addGetHookIf( conditionFn, hookFn ) {\n\u0009// Define the hook, we'll check on the first run if it's really needed.\n\u0009return {\n\u0009\u0009get: function() {\n\u0009\u0009\u0009var condition = conditionFn();\n\n\u0009\u0009\u0009if ( condition == null ) {\n\u0009\u0009\u0009\u0009// The test was not ready at this point; screw the hook this time\n\u0009\u0009\u0009\u0009// but check again when needed next time.\n\u0009\u0009\u0009\u0009return;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( condition ) {\n\u0009\u0009\u0009\u0009// Hook not needed (or it's not possible to use it due to missing dependency),\n\u0009\u0009\u0009\u0009// remove it.\n\u0009\u0009\u0009\u0009// Since there are no other hooks for marginRight, remove the whole object.\n\u0009\u0009\u0009\u0009delete this.get;\n\u0009\u0009\u0009\u0009return;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Hook needed; redefine it so that the support test is not executed again.\n\n\u0009\u0009\u0009return (this.get = hookFn).apply( this, arguments );\n\u0009\u0009}\n\u0009};\n}\n\n\n(function() {\n\u0009// Minified: var b,c,d,e,f,g, h,i\n\u0009var div, style, a, pixelPositionVal, boxSizingReliableVal,\n\u0009\u0009reliableHiddenOffsetsVal, reliableMarginRightVal;\n\n\u0009// Setup\n\u0009div = document.createElement( \"div\" );\n\u0009div.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\u0009a = div.getElementsByTagName( \"a\" )[ 0 ];\n\u0009style = a && a.style;\n\n\u0009// Finish early in limited (non-browser) environments\n\u0009if ( !style ) {\n\u0009\u0009return;\n\u0009}\n\n\u0009style.cssText = \"float:left;opacity:.5\";\n\n\u0009// Support: IE<9\n\u0009// Make sure that element opacity exists (as opposed to filter)\n\u0009support.opacity = style.opacity === \"0.5\";\n\n\u0009// Verify style float existence\n\u0009// (IE uses styleFloat instead of cssFloat)\n\u0009support.cssFloat = !!style.cssFloat;\n\n\u0009div.style.backgroundClip = \"content-box\";\n\u0009div.cloneNode( true ).style.backgroundClip = \"\";\n\u0009support.clearCloneStyle = div.style.backgroundClip === \"content-box\";\n\n\u0009// Support: Firefox<29, Android 2.3\n\u0009// Vendor-prefix box-sizing\n\u0009support.boxSizing = style.boxSizing === \"\" || style.MozBoxSizing === \"\" ||\n\u0009\u0009style.WebkitBoxSizing === \"\";\n\n\u0009jQuery.extend(support, {\n\u0009\u0009reliableHiddenOffsets: function() {\n\u0009\u0009\u0009if ( reliableHiddenOffsetsVal == null ) {\n\u0009\u0009\u0009\u0009computeStyleTests();\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return reliableHiddenOffsetsVal;\n\u0009\u0009},\n\n\u0009\u0009boxSizingReliable: function() {\n\u0009\u0009\u0009if ( boxSizingReliableVal == null ) {\n\u0009\u0009\u0009\u0009computeStyleTests();\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return boxSizingReliableVal;\n\u0009\u0009},\n\n\u0009\u0009pixelPosition: function() {\n\u0009\u0009\u0009if ( pixelPositionVal == null ) {\n\u0009\u0009\u0009\u0009computeStyleTests();\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return pixelPositionVal;\n\u0009\u0009},\n\n\u0009\u0009// Support: Android 2.3\n\u0009\u0009reliableMarginRight: function() {\n\u0009\u0009\u0009if ( reliableMarginRightVal == null ) {\n\u0009\u0009\u0009\u0009computeStyleTests();\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return reliableMarginRightVal;\n\u0009\u0009}\n\u0009});\n\n\u0009function computeStyleTests() {\n\u0009\u0009// Minified: var b,c,d,j\n\u0009\u0009var div, body, container, contents;\n\n\u0009\u0009body = document.getElementsByTagName( \"body\" )[ 0 ];\n\u0009\u0009if ( !body || !body.style ) {\n\u0009\u0009\u0009// Test fired too early or in an unsupported environment, exit.\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Setup\n\u0009\u0009div = document.createElement( \"div\" );\n\u0009\u0009container = document.createElement( \"div\" );\n\u0009\u0009container.style.cssText = \"position:absolute;border:0;width:0;height:0;top:0;left:-9999px\";\n\u0009\u0009body.appendChild( container ).appendChild( div );\n\n\u0009\u0009div.style.cssText =\n\u0009\u0009\u0009// Support: Firefox<29, Android 2.3\n\u0009\u0009\u0009// Vendor-prefix box-sizing\n\u0009\u0009\u0009\"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;\" +\n\u0009\u0009\u0009\"box-sizing:border-box;display:block;margin-top:1%;top:1%;\" +\n\u0009\u0009\u0009\"border:1px;padding:1px;width:4px;position:absolute\";\n\n\u0009\u0009// Support: IE<9\n\u0009\u0009// Assume reasonable values in the absence of getComputedStyle\n\u0009\u0009pixelPositionVal = boxSizingReliableVal = false;\n\u0009\u0009reliableMarginRightVal = true;\n\n\u0009\u0009// Check for getComputedStyle so that this code is not run in IE<9.\n\u0009\u0009if ( window.getComputedStyle ) {\n\u0009\u0009\u0009pixelPositionVal = ( window.getComputedStyle( div, null ) || {} ).top !== \"1%\";\n\u0009\u0009\u0009boxSizingReliableVal =\n\u0009\u0009\u0009\u0009( window.getComputedStyle( div, null ) || { width: \"4px\" } ).width === \"4px\";\n\n\u0009\u0009\u0009// Support: Android 2.3\n\u0009\u0009\u0009// Div with explicit width and no margin-right incorrectly\n\u0009\u0009\u0009// gets computed margin-right based on width of container (#3333)\n\u0009\u0009\u0009// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\u0009\u0009\u0009contents = div.appendChild( document.createElement( \"div\" ) );\n\n\u0009\u0009\u0009// Reset CSS: box-sizing; display; margin; border; padding\n\u0009\u0009\u0009contents.style.cssText = div.style.cssText =\n\u0009\u0009\u0009\u0009// Support: Firefox<29, Android 2.3\n\u0009\u0009\u0009\u0009// Vendor-prefix box-sizing\n\u0009\u0009\u0009\u0009\"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;\" +\n\u0009\u0009\u0009\u0009\"box-sizing:content-box;display:block;margin:0;border:0;padding:0\";\n\u0009\u0009\u0009contents.style.marginRight = contents.style.width = \"0\";\n\u0009\u0009\u0009div.style.width = \"1px\";\n\n\u0009\u0009\u0009reliableMarginRightVal =\n\u0009\u0009\u0009\u0009!parseFloat( ( window.getComputedStyle( contents, null ) || {} ).marginRight );\n\n\u0009\u0009\u0009div.removeChild( contents );\n\u0009\u0009}\n\n\u0009\u0009// Support: IE8\n\u0009\u0009// Check if table cells still have offsetWidth/Height when they are set\n\u0009\u0009// to display:none and there are still other visible table cells in a\n\u0009\u0009// table row; if so, offsetWidth/Height are not reliable for use when\n\u0009\u0009// determining if an element has been hidden directly using\n\u0009\u0009// display:none (it is still safe to use offsets if a parent element is\n\u0009\u0009// hidden; don safety goggles and see bug #4512 for more information).\n\u0009\u0009div.innerHTML = \"<table><tr><td></td><td>t</td></tr></table>\";\n\u0009\u0009contents = div.getElementsByTagName( \"td\" );\n\u0009\u0009contents[ 0 ].style.cssText = \"margin:0;border:0;padding:0;display:none\";\n\u0009\u0009reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;\n\u0009\u0009if ( reliableHiddenOffsetsVal ) {\n\u0009\u0009\u0009contents[ 0 ].style.display = \"\";\n\u0009\u0009\u0009contents[ 1 ].style.display = \"none\";\n\u0009\u0009\u0009reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;\n\u0009\u0009}\n\n\u0009\u0009body.removeChild( container );\n\u0009}\n\n})();\n\n\n// A method for quickly swapping in/out CSS properties to get correct calculations.\njQuery.swap = function( elem, options, callback, args ) {\n\u0009var ret, name,\n\u0009\u0009old = {};\n\n\u0009// Remember the old values, and insert the new ones\n\u0009for ( name in options ) {\n\u0009\u0009old[ name ] = elem.style[ name ];\n\u0009\u0009elem.style[ name ] = options[ name ];\n\u0009}\n\n\u0009ret = callback.apply( elem, args || [] );\n\n\u0009// Revert the old values\n\u0009for ( name in options ) {\n\u0009\u0009elem.style[ name ] = old[ name ];\n\u0009}\n\n\u0009return ret;\n};\n\n\nvar\n\u0009\u0009ralpha = /alpha\\([^)]*\\)/i,\n\u0009ropacity = /opacity\\s*=\\s*([^)]*)/,\n\n\u0009// swappable if display is none or starts with table except \"table\", \"table-cell\", or \"table-caption\"\n\u0009// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display\n\u0009rdisplayswap = /^(none|table(?!-c[ea]).+)/,\n\u0009rnumsplit = new RegExp( \"^(\" + pnum + \")(.*)$\", \"i\" ),\n\u0009rrelNum = new RegExp( \"^([+-])=(\" + pnum + \")\", \"i\" ),\n\n\u0009cssShow = { position: \"absolute\", visibility: \"hidden\", display: \"block\" },\n\u0009cssNormalTransform = {\n\u0009\u0009letterSpacing: \"0\",\n\u0009\u0009fontWeight: \"400\"\n\u0009},\n\n\u0009cssPrefixes = [ \"Webkit\", \"O\", \"Moz\", \"ms\" ];\n\n\n// return a css property mapped to a potentially vendor prefixed property\nfunction vendorPropName( style, name ) {\n\n\u0009// shortcut for names that are not vendor prefixed\n\u0009if ( name in style ) {\n\u0009\u0009return name;\n\u0009}\n\n\u0009// check for vendor prefixed names\n\u0009var capName = name.charAt(0).toUpperCase() + name.slice(1),\n\u0009\u0009origName = name,\n\u0009\u0009i = cssPrefixes.length;\n\n\u0009while ( i-- ) {\n\u0009\u0009name = cssPrefixes[ i ] + capName;\n\u0009\u0009if ( name in style ) {\n\u0009\u0009\u0009return name;\n\u0009\u0009}\n\u0009}\n\n\u0009return origName;\n}\n\nfunction showHide( elements, show ) {\n\u0009var display, elem, hidden,\n\u0009\u0009values = [],\n\u0009\u0009index = 0,\n\u0009\u0009length = elements.length;\n\n\u0009for ( ; index < length; index++ ) {\n\u0009\u0009elem = elements[ index ];\n\u0009\u0009if ( !elem.style ) {\n\u0009\u0009\u0009continue;\n\u0009\u0009}\n\n\u0009\u0009values[ index ] = jQuery._data( elem, \"olddisplay\" );\n\u0009\u0009display = elem.style.display;\n\u0009\u0009if ( show ) {\n\u0009\u0009\u0009// Reset the inline display of this element to learn if it is\n\u0009\u0009\u0009// being hidden by cascaded rules or not\n\u0009\u0009\u0009if ( !values[ index ] && display === \"none\" ) {\n\u0009\u0009\u0009\u0009elem.style.display = \"\";\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Set elements which have been overridden with display: none\n\u0009\u0009\u0009// in a stylesheet to whatever the default browser style is\n\u0009\u0009\u0009// for such an element\n\u0009\u0009\u0009if ( elem.style.display === \"\" && isHidden( elem ) ) {\n\u0009\u0009\u0009\u0009values[ index ] = jQuery._data( elem, \"olddisplay\", defaultDisplay(elem.nodeName) );\n\u0009\u0009\u0009}\n\u0009\u0009} else {\n\u0009\u0009\u0009hidden = isHidden( elem );\n\n\u0009\u0009\u0009if ( display && display !== \"none\" || !hidden ) {\n\u0009\u0009\u0009\u0009jQuery._data( elem, \"olddisplay\", hidden ? display : jQuery.css( elem, \"display\" ) );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009// Set the display of most of the elements in a second loop\n\u0009// to avoid the constant reflow\n\u0009for ( index = 0; index < length; index++ ) {\n\u0009\u0009elem = elements[ index ];\n\u0009\u0009if ( !elem.style ) {\n\u0009\u0009\u0009continue;\n\u0009\u0009}\n\u0009\u0009if ( !show || elem.style.display === \"none\" || elem.style.display === \"\" ) {\n\u0009\u0009\u0009elem.style.display = show ? values[ index ] || \"\" : \"none\";\n\u0009\u0009}\n\u0009}\n\n\u0009return elements;\n}\n\nfunction setPositiveNumber( elem, value, subtract ) {\n\u0009var matches = rnumsplit.exec( value );\n\u0009return matches ?\n\u0009\u0009// Guard against undefined \"subtract\", e.g., when used as in cssHooks\n\u0009\u0009Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || \"px\" ) :\n\u0009\u0009value;\n}\n\nfunction augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {\n\u0009var i = extra === ( isBorderBox ? \"border\" : \"content\" ) ?\n\u0009\u0009// If we already have the right measurement, avoid augmentation\n\u0009\u00094 :\n\u0009\u0009// Otherwise initialize for horizontal or vertical properties\n\u0009\u0009name === \"width\" ? 1 : 0,\n\n\u0009\u0009val = 0;\n\n\u0009for ( ; i < 4; i += 2 ) {\n\u0009\u0009// both box models exclude margin, so add it if we want it\n\u0009\u0009if ( extra === \"margin\" ) {\n\u0009\u0009\u0009val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );\n\u0009\u0009}\n\n\u0009\u0009if ( isBorderBox ) {\n\u0009\u0009\u0009// border-box includes padding, so remove it if we want content\n\u0009\u0009\u0009if ( extra === \"content\" ) {\n\u0009\u0009\u0009\u0009val -= jQuery.css( elem, \"padding\" + cssExpand[ i ], true, styles );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// at this point, extra isn't border nor margin, so remove border\n\u0009\u0009\u0009if ( extra !== \"margin\" ) {\n\u0009\u0009\u0009\u0009val -= jQuery.css( elem, \"border\" + cssExpand[ i ] + \"Width\", true, styles );\n\u0009\u0009\u0009}\n\u0009\u0009} else {\n\u0009\u0009\u0009// at this point, extra isn't content, so add padding\n\u0009\u0009\u0009val += jQuery.css( elem, \"padding\" + cssExpand[ i ], true, styles );\n\n\u0009\u0009\u0009// at this point, extra isn't content nor padding, so add border\n\u0009\u0009\u0009if ( extra !== \"padding\" ) {\n\u0009\u0009\u0009\u0009val += jQuery.css( elem, \"border\" + cssExpand[ i ] + \"Width\", true, styles );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009return val;\n}\n\nfunction getWidthOrHeight( elem, name, extra ) {\n\n\u0009// Start with offset property, which is equivalent to the border-box value\n\u0009var valueIsBorderBox = true,\n\u0009\u0009val = name === \"width\" ? elem.offsetWidth : elem.offsetHeight,\n\u0009\u0009styles = getStyles( elem ),\n\u0009\u0009isBorderBox = support.boxSizing && jQuery.css( elem, \"boxSizing\", false, styles ) === \"border-box\";\n\n\u0009// some non-html elements return undefined for offsetWidth, so check for null/undefined\n\u0009// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285\n\u0009// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668\n\u0009if ( val <= 0 || val == null ) {\n\u0009\u0009// Fall back to computed then uncomputed css if necessary\n\u0009\u0009val = curCSS( elem, name, styles );\n\u0009\u0009if ( val < 0 || val == null ) {\n\u0009\u0009\u0009val = elem.style[ name ];\n\u0009\u0009}\n\n\u0009\u0009// Computed unit is not pixels. Stop here and return.\n\u0009\u0009if ( rnumnonpx.test(val) ) {\n\u0009\u0009\u0009return val;\n\u0009\u0009}\n\n\u0009\u0009// we need the check for style in case a browser which returns unreliable values\n\u0009\u0009// for getComputedStyle silently falls back to the reliable elem.style\n\u0009\u0009valueIsBorderBox = isBorderBox && ( support.boxSizingReliable() || val === elem.style[ name ] );\n\n\u0009\u0009// Normalize \"\", auto, and prepare for extra\n\u0009\u0009val = parseFloat( val ) || 0;\n\u0009}\n\n\u0009// use the active box-sizing model to add/subtract irrelevant styles\n\u0009return ( val +\n\u0009\u0009augmentWidthOrHeight(\n\u0009\u0009\u0009elem,\n\u0009\u0009\u0009name,\n\u0009\u0009\u0009extra || ( isBorderBox ? \"border\" : \"content\" ),\n\u0009\u0009\u0009valueIsBorderBox,\n\u0009\u0009\u0009styles\n\u0009\u0009)\n\u0009) + \"px\";\n}\n\njQuery.extend({\n\u0009// Add in style property hooks for overriding the default\n\u0009// behavior of getting and setting a style property\n\u0009cssHooks: {\n\u0009\u0009opacity: {\n\u0009\u0009\u0009get: function( elem, computed ) {\n\u0009\u0009\u0009\u0009if ( computed ) {\n\u0009\u0009\u0009\u0009\u0009// We should always get a number back from opacity\n\u0009\u0009\u0009\u0009\u0009var ret = curCSS( elem, \"opacity\" );\n\u0009\u0009\u0009\u0009\u0009return ret === \"\" ? \"1\" : ret;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009},\n\n\u0009// Don't automatically add \"px\" to these possibly-unitless properties\n\u0009cssNumber: {\n\u0009\u0009\"columnCount\": true,\n\u0009\u0009\"fillOpacity\": true,\n\u0009\u0009\"flexGrow\": true,\n\u0009\u0009\"flexShrink\": true,\n\u0009\u0009\"fontWeight\": true,\n\u0009\u0009\"lineHeight\": true,\n\u0009\u0009\"opacity\": true,\n\u0009\u0009\"order\": true,\n\u0009\u0009\"orphans\": true,\n\u0009\u0009\"widows\": true,\n\u0009\u0009\"zIndex\": true,\n\u0009\u0009\"zoom\": true\n\u0009},\n\n\u0009// Add in properties whose names you wish to fix before\n\u0009// setting or getting the value\n\u0009cssProps: {\n\u0009\u0009// normalize float css property\n\u0009\u0009\"float\": support.cssFloat ? \"cssFloat\" : \"styleFloat\"\n\u0009},\n\n\u0009// Get and set the style property on a DOM Node\n\u0009style: function( elem, name, value, extra ) {\n\u0009\u0009// Don't set styles on text and comment nodes\n\u0009\u0009if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Make sure that we're working with the right name\n\u0009\u0009var ret, type, hooks,\n\u0009\u0009\u0009origName = jQuery.camelCase( name ),\n\u0009\u0009\u0009style = elem.style;\n\n\u0009\u0009name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );\n\n\u0009\u0009// gets hook for the prefixed version\n\u0009\u0009// followed by the unprefixed version\n\u0009\u0009hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];\n\n\u0009\u0009// Check if we're setting a value\n\u0009\u0009if ( value !== undefined ) {\n\u0009\u0009\u0009type = typeof value;\n\n\u0009\u0009\u0009// convert relative number strings (+= or -=) to relative numbers. #7345\n\u0009\u0009\u0009if ( type === \"string\" && (ret = rrelNum.exec( value )) ) {\n\u0009\u0009\u0009\u0009value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );\n\u0009\u0009\u0009\u0009// Fixes bug #9237\n\u0009\u0009\u0009\u0009type = \"number\";\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Make sure that null and NaN values aren't set. See: #7116\n\u0009\u0009\u0009if ( value == null || value !== value ) {\n\u0009\u0009\u0009\u0009return;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// If a number was passed in, add 'px' to the (except for certain CSS properties)\n\u0009\u0009\u0009if ( type === \"number\" && !jQuery.cssNumber[ origName ] ) {\n\u0009\u0009\u0009\u0009value += \"px\";\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,\n\u0009\u0009\u0009// but it would mean to define eight (for every problematic property) identical functions\n\u0009\u0009\u0009if ( !support.clearCloneStyle && value === \"\" && name.indexOf(\"background\") === 0 ) {\n\u0009\u0009\u0009\u0009style[ name ] = \"inherit\";\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// If a hook was provided, use that value, otherwise just set the specified value\n\u0009\u0009\u0009if ( !hooks || !(\"set\" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {\n\n\u0009\u0009\u0009\u0009// Support: IE\n\u0009\u0009\u0009\u0009// Swallow errors from 'invalid' CSS values (#5509)\n\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009style[ name ] = value;\n\u0009\u0009\u0009\u0009} catch(e) {}\n\u0009\u0009\u0009}\n\n\u0009\u0009} else {\n\u0009\u0009\u0009// If a hook was provided get the non-computed value from there\n\u0009\u0009\u0009if ( hooks && \"get\" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {\n\u0009\u0009\u0009\u0009return ret;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Otherwise just get the value from the style object\n\u0009\u0009\u0009return style[ name ];\n\u0009\u0009}\n\u0009},\n\n\u0009css: function( elem, name, extra, styles ) {\n\u0009\u0009var num, val, hooks,\n\u0009\u0009\u0009origName = jQuery.camelCase( name );\n\n\u0009\u0009// Make sure that we're working with the right name\n\u0009\u0009name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );\n\n\u0009\u0009// gets hook for the prefixed version\n\u0009\u0009// followed by the unprefixed version\n\u0009\u0009hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];\n\n\u0009\u0009// If a hook was provided get the computed value from there\n\u0009\u0009if ( hooks && \"get\" in hooks ) {\n\u0009\u0009\u0009val = hooks.get( elem, true, extra );\n\u0009\u0009}\n\n\u0009\u0009// Otherwise, if a way to get the computed value exists, use that\n\u0009\u0009if ( val === undefined ) {\n\u0009\u0009\u0009val = curCSS( elem, name, styles );\n\u0009\u0009}\n\n\u0009\u0009//convert \"normal\" to computed value\n\u0009\u0009if ( val === \"normal\" && name in cssNormalTransform ) {\n\u0009\u0009\u0009val = cssNormalTransform[ name ];\n\u0009\u0009}\n\n\u0009\u0009// Return, converting to number if forced or a qualifier was provided and val looks numeric\n\u0009\u0009if ( extra === \"\" || extra ) {\n\u0009\u0009\u0009num = parseFloat( val );\n\u0009\u0009\u0009return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;\n\u0009\u0009}\n\u0009\u0009return val;\n\u0009}\n});\n\njQuery.each([ \"height\", \"width\" ], function( i, name ) {\n\u0009jQuery.cssHooks[ name ] = {\n\u0009\u0009get: function( elem, computed, extra ) {\n\u0009\u0009\u0009if ( computed ) {\n\u0009\u0009\u0009\u0009// certain elements can have dimension info if we invisibly show them\n\u0009\u0009\u0009\u0009// however, it must have a current display style that would benefit from this\n\u0009\u0009\u0009\u0009return rdisplayswap.test( jQuery.css( elem, \"display\" ) ) && elem.offsetWidth === 0 ?\n\u0009\u0009\u0009\u0009\u0009jQuery.swap( elem, cssShow, function() {\n\u0009\u0009\u0009\u0009\u0009\u0009return getWidthOrHeight( elem, name, extra );\n\u0009\u0009\u0009\u0009\u0009}) :\n\u0009\u0009\u0009\u0009\u0009getWidthOrHeight( elem, name, extra );\n\u0009\u0009\u0009}\n\u0009\u0009},\n\n\u0009\u0009set: function( elem, value, extra ) {\n\u0009\u0009\u0009var styles = extra && getStyles( elem );\n\u0009\u0009\u0009return setPositiveNumber( elem, value, extra ?\n\u0009\u0009\u0009\u0009augmentWidthOrHeight(\n\u0009\u0009\u0009\u0009\u0009elem,\n\u0009\u0009\u0009\u0009\u0009name,\n\u0009\u0009\u0009\u0009\u0009extra,\n\u0009\u0009\u0009\u0009\u0009support.boxSizing && jQuery.css( elem, \"boxSizing\", false, styles ) === \"border-box\",\n\u0009\u0009\u0009\u0009\u0009styles\n\u0009\u0009\u0009\u0009) : 0\n\u0009\u0009\u0009);\n\u0009\u0009}\n\u0009};\n});\n\nif ( !support.opacity ) {\n\u0009jQuery.cssHooks.opacity = {\n\u0009\u0009get: function( elem, computed ) {\n\u0009\u0009\u0009// IE uses filters for opacity\n\u0009\u0009\u0009return ropacity.test( (computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || \"\" ) ?\n\u0009\u0009\u0009\u0009( 0.01 * parseFloat( RegExp.$1 ) ) + \"\" :\n\u0009\u0009\u0009\u0009computed ? \"1\" : \"\";\n\u0009\u0009},\n\n\u0009\u0009set: function( elem, value ) {\n\u0009\u0009\u0009var style = elem.style,\n\u0009\u0009\u0009\u0009currentStyle = elem.currentStyle,\n\u0009\u0009\u0009\u0009opacity = jQuery.isNumeric( value ) ? \"alpha(opacity=\" + value * 100 + \")\" : \"\",\n\u0009\u0009\u0009\u0009filter = currentStyle && currentStyle.filter || style.filter || \"\";\n\n\u0009\u0009\u0009// IE has trouble with opacity if it does not have layout\n\u0009\u0009\u0009// Force it by setting the zoom level\n\u0009\u0009\u0009style.zoom = 1;\n\n\u0009\u0009\u0009// if setting opacity to 1, and no other filters exist - attempt to remove filter attribute #6652\n\u0009\u0009\u0009// if value === \"\", then remove inline opacity #12685\n\u0009\u0009\u0009if ( ( value >= 1 || value === \"\" ) &&\n\u0009\u0009\u0009\u0009\u0009jQuery.trim( filter.replace( ralpha, \"\" ) ) === \"\" &&\n\u0009\u0009\u0009\u0009\u0009style.removeAttribute ) {\n\n\u0009\u0009\u0009\u0009// Setting style.filter to null, \"\" & \" \" still leave \"filter:\" in the cssText\n\u0009\u0009\u0009\u0009// if \"filter:\" is present at all, clearType is disabled, we want to avoid this\n\u0009\u0009\u0009\u0009// style.removeAttribute is IE Only, but so apparently is this code path...\n\u0009\u0009\u0009\u0009style.removeAttribute( \"filter\" );\n\n\u0009\u0009\u0009\u0009// if there is no filter style applied in a css rule or unset inline opacity, we are done\n\u0009\u0009\u0009\u0009if ( value === \"\" || currentStyle && !currentStyle.filter ) {\n\u0009\u0009\u0009\u0009\u0009return;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// otherwise, set new filter values\n\u0009\u0009\u0009style.filter = ralpha.test( filter ) ?\n\u0009\u0009\u0009\u0009filter.replace( ralpha, opacity ) :\n\u0009\u0009\u0009\u0009filter + \" \" + opacity;\n\u0009\u0009}\n\u0009};\n}\n\njQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,\n\u0009function( elem, computed ) {\n\u0009\u0009if ( computed ) {\n\u0009\u0009\u0009// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right\n\u0009\u0009\u0009// Work around by temporarily setting element display to inline-block\n\u0009\u0009\u0009return jQuery.swap( elem, { \"display\": \"inline-block\" },\n\u0009\u0009\u0009\u0009curCSS, [ elem, \"marginRight\" ] );\n\u0009\u0009}\n\u0009}\n);\n\n// These hooks are used by animate to expand properties\njQuery.each({\n\u0009margin: \"\",\n\u0009padding: \"\",\n\u0009border: \"Width\"\n}, function( prefix, suffix ) {\n\u0009jQuery.cssHooks[ prefix + suffix ] = {\n\u0009\u0009expand: function( value ) {\n\u0009\u0009\u0009var i = 0,\n\u0009\u0009\u0009\u0009expanded = {},\n\n\u0009\u0009\u0009\u0009// assumes a single number if not a string\n\u0009\u0009\u0009\u0009parts = typeof value === \"string\" ? value.split(\" \") : [ value ];\n\n\u0009\u0009\u0009for ( ; i < 4; i++ ) {\n\u0009\u0009\u0009\u0009expanded[ prefix + cssExpand[ i ] + suffix ] =\n\u0009\u0009\u0009\u0009\u0009parts[ i ] || parts[ i - 2 ] || parts[ 0 ];\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return expanded;\n\u0009\u0009}\n\u0009};\n\n\u0009if ( !rmargin.test( prefix ) ) {\n\u0009\u0009jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;\n\u0009}\n});\n\njQuery.fn.extend({\n\u0009css: function( name, value ) {\n\u0009\u0009return access( this, function( elem, name, value ) {\n\u0009\u0009\u0009var styles, len,\n\u0009\u0009\u0009\u0009map = {},\n\u0009\u0009\u0009\u0009i = 0;\n\n\u0009\u0009\u0009if ( jQuery.isArray( name ) ) {\n\u0009\u0009\u0009\u0009styles = getStyles( elem );\n\u0009\u0009\u0009\u0009len = name.length;\n\n\u0009\u0009\u0009\u0009for ( ; i < len; i++ ) {\n\u0009\u0009\u0009\u0009\u0009map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009return map;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return value !== undefined ?\n\u0009\u0009\u0009\u0009jQuery.style( elem, name, value ) :\n\u0009\u0009\u0009\u0009jQuery.css( elem, name );\n\u0009\u0009}, name, value, arguments.length > 1 );\n\u0009},\n\u0009show: function() {\n\u0009\u0009return showHide( this, true );\n\u0009},\n\u0009hide: function() {\n\u0009\u0009return showHide( this );\n\u0009},\n\u0009toggle: function( state ) {\n\u0009\u0009if ( typeof state === \"boolean\" ) {\n\u0009\u0009\u0009return state ? this.show() : this.hide();\n\u0009\u0009}\n\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009if ( isHidden( this ) ) {\n\u0009\u0009\u0009\u0009jQuery( this ).show();\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009jQuery( this ).hide();\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009}\n});\n\n\nfunction Tween( elem, options, prop, end, easing ) {\n\u0009return new Tween.prototype.init( elem, options, prop, end, easing );\n}\njQuery.Tween = Tween;\n\nTween.prototype = {\n\u0009constructor: Tween,\n\u0009init: function( elem, options, prop, end, easing, unit ) {\n\u0009\u0009this.elem = elem;\n\u0009\u0009this.prop = prop;\n\u0009\u0009this.easing = easing || \"swing\";\n\u0009\u0009this.options = options;\n\u0009\u0009this.start = this.now = this.cur();\n\u0009\u0009this.end = end;\n\u0009\u0009this.unit = unit || ( jQuery.cssNumber[ prop ] ? \"\" : \"px\" );\n\u0009},\n\u0009cur: function() {\n\u0009\u0009var hooks = Tween.propHooks[ this.prop ];\n\n\u0009\u0009return hooks && hooks.get ?\n\u0009\u0009\u0009hooks.get( this ) :\n\u0009\u0009\u0009Tween.propHooks._default.get( this );\n\u0009},\n\u0009run: function( percent ) {\n\u0009\u0009var eased,\n\u0009\u0009\u0009hooks = Tween.propHooks[ this.prop ];\n\n\u0009\u0009if ( this.options.duration ) {\n\u0009\u0009\u0009this.pos = eased = jQuery.easing[ this.easing ](\n\u0009\u0009\u0009\u0009percent, this.options.duration * percent, 0, 1, this.options.duration\n\u0009\u0009\u0009);\n\u0009\u0009} else {\n\u0009\u0009\u0009this.pos = eased = percent;\n\u0009\u0009}\n\u0009\u0009this.now = ( this.end - this.start ) * eased + this.start;\n\n\u0009\u0009if ( this.options.step ) {\n\u0009\u0009\u0009this.options.step.call( this.elem, this.now, this );\n\u0009\u0009}\n\n\u0009\u0009if ( hooks && hooks.set ) {\n\u0009\u0009\u0009hooks.set( this );\n\u0009\u0009} else {\n\u0009\u0009\u0009Tween.propHooks._default.set( this );\n\u0009\u0009}\n\u0009\u0009return this;\n\u0009}\n};\n\nTween.prototype.init.prototype = Tween.prototype;\n\nTween.propHooks = {\n\u0009_default: {\n\u0009\u0009get: function( tween ) {\n\u0009\u0009\u0009var result;\n\n\u0009\u0009\u0009if ( tween.elem[ tween.prop ] != null &&\n\u0009\u0009\u0009\u0009(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {\n\u0009\u0009\u0009\u0009return tween.elem[ tween.prop ];\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// passing an empty string as a 3rd parameter to .css will automatically\n\u0009\u0009\u0009// attempt a parseFloat and fallback to a string if the parse fails\n\u0009\u0009\u0009// so, simple values such as \"10px\" are parsed to Float.\n\u0009\u0009\u0009// complex values such as \"rotate(1rad)\" are returned as is.\n\u0009\u0009\u0009result = jQuery.css( tween.elem, tween.prop, \"\" );\n\u0009\u0009\u0009// Empty strings, null, undefined and \"auto\" are converted to 0.\n\u0009\u0009\u0009return !result || result === \"auto\" ? 0 : result;\n\u0009\u0009},\n\u0009\u0009set: function( tween ) {\n\u0009\u0009\u0009// use step hook for back compat - use cssHook if its there - use .style if its\n\u0009\u0009\u0009// available and use plain properties where available\n\u0009\u0009\u0009if ( jQuery.fx.step[ tween.prop ] ) {\n\u0009\u0009\u0009\u0009jQuery.fx.step[ tween.prop ]( tween );\n\u0009\u0009\u0009} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {\n\u0009\u0009\u0009\u0009jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009tween.elem[ tween.prop ] = tween.now;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n};\n\n// Support: IE <=9\n// Panic based approach to setting things on disconnected nodes\n\nTween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {\n\u0009set: function( tween ) {\n\u0009\u0009if ( tween.elem.nodeType && tween.elem.parentNode ) {\n\u0009\u0009\u0009tween.elem[ tween.prop ] = tween.now;\n\u0009\u0009}\n\u0009}\n};\n\njQuery.easing = {\n\u0009linear: function( p ) {\n\u0009\u0009return p;\n\u0009},\n\u0009swing: function( p ) {\n\u0009\u0009return 0.5 - Math.cos( p * Math.PI ) / 2;\n\u0009}\n};\n\njQuery.fx = Tween.prototype.init;\n\n// Back Compat <1.8 extension point\njQuery.fx.step = {};\n\n\n\n\nvar\n\u0009fxNow, timerId,\n\u0009rfxtypes = /^(?:toggle|show|hide)$/,\n\u0009rfxnum = new RegExp( \"^(?:([+-])=|)(\" + pnum + \")([a-z%]*)$\", \"i\" ),\n\u0009rrun = /queueHooks$/,\n\u0009animationPrefilters = [ defaultPrefilter ],\n\u0009tweeners = {\n\u0009\u0009\"*\": [ function( prop, value ) {\n\u0009\u0009\u0009var tween = this.createTween( prop, value ),\n\u0009\u0009\u0009\u0009target = tween.cur(),\n\u0009\u0009\u0009\u0009parts = rfxnum.exec( value ),\n\u0009\u0009\u0009\u0009unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? \"\" : \"px\" ),\n\n\u0009\u0009\u0009\u0009// Starting value computation is required for potential unit mismatches\n\u0009\u0009\u0009\u0009start = ( jQuery.cssNumber[ prop ] || unit !== \"px\" && +target ) &&\n\u0009\u0009\u0009\u0009\u0009rfxnum.exec( jQuery.css( tween.elem, prop ) ),\n\u0009\u0009\u0009\u0009scale = 1,\n\u0009\u0009\u0009\u0009maxIterations = 20;\n\n\u0009\u0009\u0009if ( start && start[ 3 ] !== unit ) {\n\u0009\u0009\u0009\u0009// Trust units reported by jQuery.css\n\u0009\u0009\u0009\u0009unit = unit || start[ 3 ];\n\n\u0009\u0009\u0009\u0009// Make sure we update the tween properties later on\n\u0009\u0009\u0009\u0009parts = parts || [];\n\n\u0009\u0009\u0009\u0009// Iteratively approximate from a nonzero starting point\n\u0009\u0009\u0009\u0009start = +target || 1;\n\n\u0009\u0009\u0009\u0009do {\n\u0009\u0009\u0009\u0009\u0009// If previous iteration zeroed out, double until we get *something*\n\u0009\u0009\u0009\u0009\u0009// Use a string for doubling factor so we don't accidentally see scale as unchanged below\n\u0009\u0009\u0009\u0009\u0009scale = scale || \".5\";\n\n\u0009\u0009\u0009\u0009\u0009// Adjust and apply\n\u0009\u0009\u0009\u0009\u0009start = start / scale;\n\u0009\u0009\u0009\u0009\u0009jQuery.style( tween.elem, prop, start + unit );\n\n\u0009\u0009\u0009\u0009// Update scale, tolerating zero or NaN from tween.cur()\n\u0009\u0009\u0009\u0009// And breaking the loop if scale is unchanged or perfect, or if we've just had enough\n\u0009\u0009\u0009\u0009} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Update tween properties\n\u0009\u0009\u0009if ( parts ) {\n\u0009\u0009\u0009\u0009start = tween.start = +start || +target || 0;\n\u0009\u0009\u0009\u0009tween.unit = unit;\n\u0009\u0009\u0009\u0009// If a +=/-= token was provided, we're doing a relative animation\n\u0009\u0009\u0009\u0009tween.end = parts[ 1 ] ?\n\u0009\u0009\u0009\u0009\u0009start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :\n\u0009\u0009\u0009\u0009\u0009+parts[ 2 ];\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return tween;\n\u0009\u0009} ]\n\u0009};\n\n// Animations created synchronously will run synchronously\nfunction createFxNow() {\n\u0009setTimeout(function() {\n\u0009\u0009fxNow = undefined;\n\u0009});\n\u0009return ( fxNow = jQuery.now() );\n}\n\n// Generate parameters to create a standard animation\nfunction genFx( type, includeWidth ) {\n\u0009var which,\n\u0009\u0009attrs = { height: type },\n\u0009\u0009i = 0;\n\n\u0009// if we include width, step value is 1 to do all cssExpand values,\n\u0009// if we don't include width, step value is 2 to skip over Left and Right\n\u0009includeWidth = includeWidth ? 1 : 0;\n\u0009for ( ; i < 4 ; i += 2 - includeWidth ) {\n\u0009\u0009which = cssExpand[ i ];\n\u0009\u0009attrs[ \"margin\" + which ] = attrs[ \"padding\" + which ] = type;\n\u0009}\n\n\u0009if ( includeWidth ) {\n\u0009\u0009attrs.opacity = attrs.width = type;\n\u0009}\n\n\u0009return attrs;\n}\n\nfunction createTween( value, prop, animation ) {\n\u0009var tween,\n\u0009\u0009collection = ( tweeners[ prop ] || [] ).concat( tweeners[ \"*\" ] ),\n\u0009\u0009index = 0,\n\u0009\u0009length = collection.length;\n\u0009for ( ; index < length; index++ ) {\n\u0009\u0009if ( (tween = collection[ index ].call( animation, prop, value )) ) {\n\n\u0009\u0009\u0009// we're done with this property\n\u0009\u0009\u0009return tween;\n\u0009\u0009}\n\u0009}\n}\n\nfunction defaultPrefilter( elem, props, opts ) {\n\u0009/* jshint validthis: true */\n\u0009var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,\n\u0009\u0009anim = this,\n\u0009\u0009orig = {},\n\u0009\u0009style = elem.style,\n\u0009\u0009hidden = elem.nodeType && isHidden( elem ),\n\u0009\u0009dataShow = jQuery._data( elem, \"fxshow\" );\n\n\u0009// handle queue: false promises\n\u0009if ( !opts.queue ) {\n\u0009\u0009hooks = jQuery._queueHooks( elem, \"fx\" );\n\u0009\u0009if ( hooks.unqueued == null ) {\n\u0009\u0009\u0009hooks.unqueued = 0;\n\u0009\u0009\u0009oldfire = hooks.empty.fire;\n\u0009\u0009\u0009hooks.empty.fire = function() {\n\u0009\u0009\u0009\u0009if ( !hooks.unqueued ) {\n\u0009\u0009\u0009\u0009\u0009oldfire();\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009};\n\u0009\u0009}\n\u0009\u0009hooks.unqueued++;\n\n\u0009\u0009anim.always(function() {\n\u0009\u0009\u0009// doing this makes sure that the complete handler will be called\n\u0009\u0009\u0009// before this completes\n\u0009\u0009\u0009anim.always(function() {\n\u0009\u0009\u0009\u0009hooks.unqueued--;\n\u0009\u0009\u0009\u0009if ( !jQuery.queue( elem, \"fx\" ).length ) {\n\u0009\u0009\u0009\u0009\u0009hooks.empty.fire();\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009});\n\u0009\u0009});\n\u0009}\n\n\u0009// height/width overflow pass\n\u0009if ( elem.nodeType === 1 && ( \"height\" in props || \"width\" in props ) ) {\n\u0009\u0009// Make sure that nothing sneaks out\n\u0009\u0009// Record all 3 overflow attributes because IE does not\n\u0009\u0009// change the overflow attribute when overflowX and\n\u0009\u0009// overflowY are set to the same value\n\u0009\u0009opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];\n\n\u0009\u0009// Set display property to inline-block for height/width\n\u0009\u0009// animations on inline elements that are having width/height animated\n\u0009\u0009display = jQuery.css( elem, \"display\" );\n\n\u0009\u0009// Test default display if display is currently \"none\"\n\u0009\u0009checkDisplay = display === \"none\" ?\n\u0009\u0009\u0009jQuery._data( elem, \"olddisplay\" ) || defaultDisplay( elem.nodeName ) : display;\n\n\u0009\u0009if ( checkDisplay === \"inline\" && jQuery.css( elem, \"float\" ) === \"none\" ) {\n\n\u0009\u0009\u0009// inline-level elements accept inline-block;\n\u0009\u0009\u0009// block-level elements need to be inline with layout\n\u0009\u0009\u0009if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === \"inline\" ) {\n\u0009\u0009\u0009\u0009style.display = \"inline-block\";\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009style.zoom = 1;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009if ( opts.overflow ) {\n\u0009\u0009style.overflow = \"hidden\";\n\u0009\u0009if ( !support.shrinkWrapBlocks() ) {\n\u0009\u0009\u0009anim.always(function() {\n\u0009\u0009\u0009\u0009style.overflow = opts.overflow[ 0 ];\n\u0009\u0009\u0009\u0009style.overflowX = opts.overflow[ 1 ];\n\u0009\u0009\u0009\u0009style.overflowY = opts.overflow[ 2 ];\n\u0009\u0009\u0009});\n\u0009\u0009}\n\u0009}\n\n\u0009// show/hide pass\n\u0009for ( prop in props ) {\n\u0009\u0009value = props[ prop ];\n\u0009\u0009if ( rfxtypes.exec( value ) ) {\n\u0009\u0009\u0009delete props[ prop ];\n\u0009\u0009\u0009toggle = toggle || value === \"toggle\";\n\u0009\u0009\u0009if ( value === ( hidden ? \"hide\" : \"show\" ) ) {\n\n\u0009\u0009\u0009\u0009// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden\n\u0009\u0009\u0009\u0009if ( value === \"show\" && dataShow && dataShow[ prop ] !== undefined ) {\n\u0009\u0009\u0009\u0009\u0009hidden = true;\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009continue;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009\u0009orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );\n\n\u0009\u0009// Any non-fx value stops us from restoring the original display value\n\u0009\u0009} else {\n\u0009\u0009\u0009display = undefined;\n\u0009\u0009}\n\u0009}\n\n\u0009if ( !jQuery.isEmptyObject( orig ) ) {\n\u0009\u0009if ( dataShow ) {\n\u0009\u0009\u0009if ( \"hidden\" in dataShow ) {\n\u0009\u0009\u0009\u0009hidden = dataShow.hidden;\n\u0009\u0009\u0009}\n\u0009\u0009} else {\n\u0009\u0009\u0009dataShow = jQuery._data( elem, \"fxshow\", {} );\n\u0009\u0009}\n\n\u0009\u0009// store state if its toggle - enables .stop().toggle() to \"reverse\"\n\u0009\u0009if ( toggle ) {\n\u0009\u0009\u0009dataShow.hidden = !hidden;\n\u0009\u0009}\n\u0009\u0009if ( hidden ) {\n\u0009\u0009\u0009jQuery( elem ).show();\n\u0009\u0009} else {\n\u0009\u0009\u0009anim.done(function() {\n\u0009\u0009\u0009\u0009jQuery( elem ).hide();\n\u0009\u0009\u0009});\n\u0009\u0009}\n\u0009\u0009anim.done(function() {\n\u0009\u0009\u0009var prop;\n\u0009\u0009\u0009jQuery._removeData( elem, \"fxshow\" );\n\u0009\u0009\u0009for ( prop in orig ) {\n\u0009\u0009\u0009\u0009jQuery.style( elem, prop, orig[ prop ] );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009\u0009for ( prop in orig ) {\n\u0009\u0009\u0009tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );\n\n\u0009\u0009\u0009if ( !( prop in dataShow ) ) {\n\u0009\u0009\u0009\u0009dataShow[ prop ] = tween.start;\n\u0009\u0009\u0009\u0009if ( hidden ) {\n\u0009\u0009\u0009\u0009\u0009tween.end = tween.start;\n\u0009\u0009\u0009\u0009\u0009tween.start = prop === \"width\" || prop === \"height\" ? 1 : 0;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009// If this is a noop like .hide().hide(), restore an overwritten display value\n\u0009} else if ( (display === \"none\" ? defaultDisplay( elem.nodeName ) : display) === \"inline\" ) {\n\u0009\u0009style.display = display;\n\u0009}\n}\n\nfunction propFilter( props, specialEasing ) {\n\u0009var index, name, easing, value, hooks;\n\n\u0009// camelCase, specialEasing and expand cssHook pass\n\u0009for ( index in props ) {\n\u0009\u0009name = jQuery.camelCase( index );\n\u0009\u0009easing = specialEasing[ name ];\n\u0009\u0009value = props[ index ];\n\u0009\u0009if ( jQuery.isArray( value ) ) {\n\u0009\u0009\u0009easing = value[ 1 ];\n\u0009\u0009\u0009value = props[ index ] = value[ 0 ];\n\u0009\u0009}\n\n\u0009\u0009if ( index !== name ) {\n\u0009\u0009\u0009props[ name ] = value;\n\u0009\u0009\u0009delete props[ index ];\n\u0009\u0009}\n\n\u0009\u0009hooks = jQuery.cssHooks[ name ];\n\u0009\u0009if ( hooks && \"expand\" in hooks ) {\n\u0009\u0009\u0009value = hooks.expand( value );\n\u0009\u0009\u0009delete props[ name ];\n\n\u0009\u0009\u0009// not quite $.extend, this wont overwrite keys already present.\n\u0009\u0009\u0009// also - reusing 'index' from above because we have the correct \"name\"\n\u0009\u0009\u0009for ( index in value ) {\n\u0009\u0009\u0009\u0009if ( !( index in props ) ) {\n\u0009\u0009\u0009\u0009\u0009props[ index ] = value[ index ];\n\u0009\u0009\u0009\u0009\u0009specialEasing[ index ] = easing;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009} else {\n\u0009\u0009\u0009specialEasing[ name ] = easing;\n\u0009\u0009}\n\u0009}\n}\n\nfunction Animation( elem, properties, options ) {\n\u0009var result,\n\u0009\u0009stopped,\n\u0009\u0009index = 0,\n\u0009\u0009length = animationPrefilters.length,\n\u0009\u0009deferred = jQuery.Deferred().always( function() {\n\u0009\u0009\u0009// don't match elem in the :animated selector\n\u0009\u0009\u0009delete tick.elem;\n\u0009\u0009}),\n\u0009\u0009tick = function() {\n\u0009\u0009\u0009if ( stopped ) {\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009var currentTime = fxNow || createFxNow(),\n\u0009\u0009\u0009\u0009remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),\n\u0009\u0009\u0009\u0009// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)\n\u0009\u0009\u0009\u0009temp = remaining / animation.duration || 0,\n\u0009\u0009\u0009\u0009percent = 1 - temp,\n\u0009\u0009\u0009\u0009index = 0,\n\u0009\u0009\u0009\u0009length = animation.tweens.length;\n\n\u0009\u0009\u0009for ( ; index < length ; index++ ) {\n\u0009\u0009\u0009\u0009animation.tweens[ index ].run( percent );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009deferred.notifyWith( elem, [ animation, percent, remaining ]);\n\n\u0009\u0009\u0009if ( percent < 1 && length ) {\n\u0009\u0009\u0009\u0009return remaining;\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009deferred.resolveWith( elem, [ animation ] );\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009}\n\u0009\u0009},\n\u0009\u0009animation = deferred.promise({\n\u0009\u0009\u0009elem: elem,\n\u0009\u0009\u0009props: jQuery.extend( {}, properties ),\n\u0009\u0009\u0009opts: jQuery.extend( true, { specialEasing: {} }, options ),\n\u0009\u0009\u0009originalProperties: properties,\n\u0009\u0009\u0009originalOptions: options,\n\u0009\u0009\u0009startTime: fxNow || createFxNow(),\n\u0009\u0009\u0009duration: options.duration,\n\u0009\u0009\u0009tweens: [],\n\u0009\u0009\u0009createTween: function( prop, end ) {\n\u0009\u0009\u0009\u0009var tween = jQuery.Tween( elem, animation.opts, prop, end,\n\u0009\u0009\u0009\u0009\u0009\u0009animation.opts.specialEasing[ prop ] || animation.opts.easing );\n\u0009\u0009\u0009\u0009animation.tweens.push( tween );\n\u0009\u0009\u0009\u0009return tween;\n\u0009\u0009\u0009},\n\u0009\u0009\u0009stop: function( gotoEnd ) {\n\u0009\u0009\u0009\u0009var index = 0,\n\u0009\u0009\u0009\u0009\u0009// if we are going to the end, we want to run all the tweens\n\u0009\u0009\u0009\u0009\u0009// otherwise we skip this part\n\u0009\u0009\u0009\u0009\u0009length = gotoEnd ? animation.tweens.length : 0;\n\u0009\u0009\u0009\u0009if ( stopped ) {\n\u0009\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009stopped = true;\n\u0009\u0009\u0009\u0009for ( ; index < length ; index++ ) {\n\u0009\u0009\u0009\u0009\u0009animation.tweens[ index ].run( 1 );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// resolve when we played the last frame\n\u0009\u0009\u0009\u0009// otherwise, reject\n\u0009\u0009\u0009\u0009if ( gotoEnd ) {\n\u0009\u0009\u0009\u0009\u0009deferred.resolveWith( elem, [ animation, gotoEnd ] );\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009deferred.rejectWith( elem, [ animation, gotoEnd ] );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009}\n\u0009\u0009}),\n\u0009\u0009props = animation.props;\n\n\u0009propFilter( props, animation.opts.specialEasing );\n\n\u0009for ( ; index < length ; index++ ) {\n\u0009\u0009result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );\n\u0009\u0009if ( result ) {\n\u0009\u0009\u0009return result;\n\u0009\u0009}\n\u0009}\n\n\u0009jQuery.map( props, createTween, animation );\n\n\u0009if ( jQuery.isFunction( animation.opts.start ) ) {\n\u0009\u0009animation.opts.start.call( elem, animation );\n\u0009}\n\n\u0009jQuery.fx.timer(\n\u0009\u0009jQuery.extend( tick, {\n\u0009\u0009\u0009elem: elem,\n\u0009\u0009\u0009anim: animation,\n\u0009\u0009\u0009queue: animation.opts.queue\n\u0009\u0009})\n\u0009);\n\n\u0009// attach callbacks from options\n\u0009return animation.progress( animation.opts.progress )\n\u0009\u0009.done( animation.opts.done, animation.opts.complete )\n\u0009\u0009.fail( animation.opts.fail )\n\u0009\u0009.always( animation.opts.always );\n}\n\njQuery.Animation = jQuery.extend( Animation, {\n\u0009tweener: function( props, callback ) {\n\u0009\u0009if ( jQuery.isFunction( props ) ) {\n\u0009\u0009\u0009callback = props;\n\u0009\u0009\u0009props = [ \"*\" ];\n\u0009\u0009} else {\n\u0009\u0009\u0009props = props.split(\" \");\n\u0009\u0009}\n\n\u0009\u0009var prop,\n\u0009\u0009\u0009index = 0,\n\u0009\u0009\u0009length = props.length;\n\n\u0009\u0009for ( ; index < length ; index++ ) {\n\u0009\u0009\u0009prop = props[ index ];\n\u0009\u0009\u0009tweeners[ prop ] = tweeners[ prop ] || [];\n\u0009\u0009\u0009tweeners[ prop ].unshift( callback );\n\u0009\u0009}\n\u0009},\n\n\u0009prefilter: function( callback, prepend ) {\n\u0009\u0009if ( prepend ) {\n\u0009\u0009\u0009animationPrefilters.unshift( callback );\n\u0009\u0009} else {\n\u0009\u0009\u0009animationPrefilters.push( callback );\n\u0009\u0009}\n\u0009}\n});\n\njQuery.speed = function( speed, easing, fn ) {\n\u0009var opt = speed && typeof speed === \"object\" ? jQuery.extend( {}, speed ) : {\n\u0009\u0009complete: fn || !fn && easing ||\n\u0009\u0009\u0009jQuery.isFunction( speed ) && speed,\n\u0009\u0009duration: speed,\n\u0009\u0009easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing\n\u0009};\n\n\u0009opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === \"number\" ? opt.duration :\n\u0009\u0009opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;\n\n\u0009// normalize opt.queue - true/undefined/null -> \"fx\"\n\u0009if ( opt.queue == null || opt.queue === true ) {\n\u0009\u0009opt.queue = \"fx\";\n\u0009}\n\n\u0009// Queueing\n\u0009opt.old = opt.complete;\n\n\u0009opt.complete = function() {\n\u0009\u0009if ( jQuery.isFunction( opt.old ) ) {\n\u0009\u0009\u0009opt.old.call( this );\n\u0009\u0009}\n\n\u0009\u0009if ( opt.queue ) {\n\u0009\u0009\u0009jQuery.dequeue( this, opt.queue );\n\u0009\u0009}\n\u0009};\n\n\u0009return opt;\n};\n\njQuery.fn.extend({\n\u0009fadeTo: function( speed, to, easing, callback ) {\n\n\u0009\u0009// show any hidden elements after setting opacity to 0\n\u0009\u0009return this.filter( isHidden ).css( \"opacity\", 0 ).show()\n\n\u0009\u0009\u0009// animate to the value specified\n\u0009\u0009\u0009.end().animate({ opacity: to }, speed, easing, callback );\n\u0009},\n\u0009animate: function( prop, speed, easing, callback ) {\n\u0009\u0009var empty = jQuery.isEmptyObject( prop ),\n\u0009\u0009\u0009optall = jQuery.speed( speed, easing, callback ),\n\u0009\u0009\u0009doAnimation = function() {\n\u0009\u0009\u0009\u0009// Operate on a copy of prop so per-property easing won't be lost\n\u0009\u0009\u0009\u0009var anim = Animation( this, jQuery.extend( {}, prop ), optall );\n\n\u0009\u0009\u0009\u0009// Empty animations, or finishing resolves immediately\n\u0009\u0009\u0009\u0009if ( empty || jQuery._data( this, \"finish\" ) ) {\n\u0009\u0009\u0009\u0009\u0009anim.stop( true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009};\n\u0009\u0009\u0009doAnimation.finish = doAnimation;\n\n\u0009\u0009return empty || optall.queue === false ?\n\u0009\u0009\u0009this.each( doAnimation ) :\n\u0009\u0009\u0009this.queue( optall.queue, doAnimation );\n\u0009},\n\u0009stop: function( type, clearQueue, gotoEnd ) {\n\u0009\u0009var stopQueue = function( hooks ) {\n\u0009\u0009\u0009var stop = hooks.stop;\n\u0009\u0009\u0009delete hooks.stop;\n\u0009\u0009\u0009stop( gotoEnd );\n\u0009\u0009};\n\n\u0009\u0009if ( typeof type !== \"string\" ) {\n\u0009\u0009\u0009gotoEnd = clearQueue;\n\u0009\u0009\u0009clearQueue = type;\n\u0009\u0009\u0009type = undefined;\n\u0009\u0009}\n\u0009\u0009if ( clearQueue && type !== false ) {\n\u0009\u0009\u0009this.queue( type || \"fx\", [] );\n\u0009\u0009}\n\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009var dequeue = true,\n\u0009\u0009\u0009\u0009index = type != null && type + \"queueHooks\",\n\u0009\u0009\u0009\u0009timers = jQuery.timers,\n\u0009\u0009\u0009\u0009data = jQuery._data( this );\n\n\u0009\u0009\u0009if ( index ) {\n\u0009\u0009\u0009\u0009if ( data[ index ] && data[ index ].stop ) {\n\u0009\u0009\u0009\u0009\u0009stopQueue( data[ index ] );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009for ( index in data ) {\n\u0009\u0009\u0009\u0009\u0009if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009stopQueue( data[ index ] );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009for ( index = timers.length; index--; ) {\n\u0009\u0009\u0009\u0009if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {\n\u0009\u0009\u0009\u0009\u0009timers[ index ].anim.stop( gotoEnd );\n\u0009\u0009\u0009\u0009\u0009dequeue = false;\n\u0009\u0009\u0009\u0009\u0009timers.splice( index, 1 );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// start the next in the queue if the last step wasn't forced\n\u0009\u0009\u0009// timers currently will call their complete callbacks, which will dequeue\n\u0009\u0009\u0009// but only if they were gotoEnd\n\u0009\u0009\u0009if ( dequeue || !gotoEnd ) {\n\u0009\u0009\u0009\u0009jQuery.dequeue( this, type );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\u0009finish: function( type ) {\n\u0009\u0009if ( type !== false ) {\n\u0009\u0009\u0009type = type || \"fx\";\n\u0009\u0009}\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009var index,\n\u0009\u0009\u0009\u0009data = jQuery._data( this ),\n\u0009\u0009\u0009\u0009queue = data[ type + \"queue\" ],\n\u0009\u0009\u0009\u0009hooks = data[ type + \"queueHooks\" ],\n\u0009\u0009\u0009\u0009timers = jQuery.timers,\n\u0009\u0009\u0009\u0009length = queue ? queue.length : 0;\n\n\u0009\u0009\u0009// enable finishing flag on private data\n\u0009\u0009\u0009data.finish = true;\n\n\u0009\u0009\u0009// empty the queue first\n\u0009\u0009\u0009jQuery.queue( this, type, [] );\n\n\u0009\u0009\u0009if ( hooks && hooks.stop ) {\n\u0009\u0009\u0009\u0009hooks.stop.call( this, true );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// look for any active animations, and finish them\n\u0009\u0009\u0009for ( index = timers.length; index--; ) {\n\u0009\u0009\u0009\u0009if ( timers[ index ].elem === this && timers[ index ].queue === type ) {\n\u0009\u0009\u0009\u0009\u0009timers[ index ].anim.stop( true );\n\u0009\u0009\u0009\u0009\u0009timers.splice( index, 1 );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// look for any animations in the old queue and finish them\n\u0009\u0009\u0009for ( index = 0; index < length; index++ ) {\n\u0009\u0009\u0009\u0009if ( queue[ index ] && queue[ index ].finish ) {\n\u0009\u0009\u0009\u0009\u0009queue[ index ].finish.call( this );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// turn off finishing flag\n\u0009\u0009\u0009delete data.finish;\n\u0009\u0009});\n\u0009}\n});\n\njQuery.each([ \"toggle\", \"show\", \"hide\" ], function( i, name ) {\n\u0009var cssFn = jQuery.fn[ name ];\n\u0009jQuery.fn[ name ] = function( speed, easing, callback ) {\n\u0009\u0009return speed == null || typeof speed === \"boolean\" ?\n\u0009\u0009\u0009cssFn.apply( this, arguments ) :\n\u0009\u0009\u0009this.animate( genFx( name, true ), speed, easing, callback );\n\u0009};\n});\n\n// Generate shortcuts for custom animations\njQuery.each({\n\u0009slideDown: genFx(\"show\"),\n\u0009slideUp: genFx(\"hide\"),\n\u0009slideToggle: genFx(\"toggle\"),\n\u0009fadeIn: { opacity: \"show\" },\n\u0009fadeOut: { opacity: \"hide\" },\n\u0009fadeToggle: { opacity: \"toggle\" }\n}, function( name, props ) {\n\u0009jQuery.fn[ name ] = function( speed, easing, callback ) {\n\u0009\u0009return this.animate( props, speed, easing, callback );\n\u0009};\n});\n\njQuery.timers = [];\njQuery.fx.tick = function() {\n\u0009var timer,\n\u0009\u0009timers = jQuery.timers,\n\u0009\u0009i = 0;\n\n\u0009fxNow = jQuery.now();\n\n\u0009for ( ; i < timers.length; i++ ) {\n\u0009\u0009timer = timers[ i ];\n\u0009\u0009// Checks the timer has not already been removed\n\u0009\u0009if ( !timer() && timers[ i ] === timer ) {\n\u0009\u0009\u0009timers.splice( i--, 1 );\n\u0009\u0009}\n\u0009}\n\n\u0009if ( !timers.length ) {\n\u0009\u0009jQuery.fx.stop();\n\u0009}\n\u0009fxNow = undefined;\n};\n\njQuery.fx.timer = function( timer ) {\n\u0009jQuery.timers.push( timer );\n\u0009if ( timer() ) {\n\u0009\u0009jQuery.fx.start();\n\u0009} else {\n\u0009\u0009jQuery.timers.pop();\n\u0009}\n};\n\njQuery.fx.interval = 13;\n\njQuery.fx.start = function() {\n\u0009if ( !timerId ) {\n\u0009\u0009timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );\n\u0009}\n};\n\njQuery.fx.stop = function() {\n\u0009clearInterval( timerId );\n\u0009timerId = null;\n};\n\njQuery.fx.speeds = {\n\u0009slow: 600,\n\u0009fast: 200,\n\u0009// Default speed\n\u0009_default: 400\n};\n\n\n// Based off of the plugin by Clint Helfers, with permission.\n// http://blindsignals.com/index.php/2009/07/jquery-delay/\njQuery.fn.delay = function( time, type ) {\n\u0009time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;\n\u0009type = type || \"fx\";\n\n\u0009return this.queue( type, function( next, hooks ) {\n\u0009\u0009var timeout = setTimeout( next, time );\n\u0009\u0009hooks.stop = function() {\n\u0009\u0009\u0009clearTimeout( timeout );\n\u0009\u0009};\n\u0009});\n};\n\n\n(function() {\n\u0009// Minified: var a,b,c,d,e\n\u0009var input, div, select, a, opt;\n\n\u0009// Setup\n\u0009div = document.createElement( \"div\" );\n\u0009div.setAttribute( \"className\", \"t\" );\n\u0009div.innerHTML = \"  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>\";\n\u0009a = div.getElementsByTagName(\"a\")[ 0 ];\n\n\u0009// First batch of tests.\n\u0009select = document.createElement(\"select\");\n\u0009opt = select.appendChild( document.createElement(\"option\") );\n\u0009input = div.getElementsByTagName(\"input\")[ 0 ];\n\n\u0009a.style.cssText = \"top:1px\";\n\n\u0009// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)\n\u0009support.getSetAttribute = div.className !== \"t\";\n\n\u0009// Get the style information from getAttribute\n\u0009// (IE uses .cssText instead)\n\u0009support.style = /top/.test( a.getAttribute(\"style\") );\n\n\u0009// Make sure that URLs aren't manipulated\n\u0009// (IE normalizes it by default)\n\u0009support.hrefNormalized = a.getAttribute(\"href\") === \"/a\";\n\n\u0009// Check the default checkbox/radio value (\"\" on WebKit; \"on\" elsewhere)\n\u0009support.checkOn = !!input.value;\n\n\u0009// Make sure that a selected-by-default option has a working selected property.\n\u0009// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)\n\u0009support.optSelected = opt.selected;\n\n\u0009// Tests for enctype support on a form (#6743)\n\u0009support.enctype = !!document.createElement(\"form\").enctype;\n\n\u0009// Make sure that the options inside disabled selects aren't marked as disabled\n\u0009// (WebKit marks them as disabled)\n\u0009select.disabled = true;\n\u0009support.optDisabled = !opt.disabled;\n\n\u0009// Support: IE8 only\n\u0009// Check if we can trust getAttribute(\"value\")\n\u0009input = document.createElement( \"input\" );\n\u0009input.setAttribute( \"value\", \"\" );\n\u0009support.input = input.getAttribute( \"value\" ) === \"\";\n\n\u0009// Check if an input maintains its value after becoming a radio\n\u0009input.value = \"t\";\n\u0009input.setAttribute( \"type\", \"radio\" );\n\u0009support.radioValue = input.value === \"t\";\n})();\n\n\nvar rreturn = /\\r/g;\n\njQuery.fn.extend({\n\u0009val: function( value ) {\n\u0009\u0009var hooks, ret, isFunction,\n\u0009\u0009\u0009elem = this[0];\n\n\u0009\u0009if ( !arguments.length ) {\n\u0009\u0009\u0009if ( elem ) {\n\u0009\u0009\u0009\u0009hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];\n\n\u0009\u0009\u0009\u0009if ( hooks && \"get\" in hooks && (ret = hooks.get( elem, \"value\" )) !== undefined ) {\n\u0009\u0009\u0009\u0009\u0009return ret;\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009ret = elem.value;\n\n\u0009\u0009\u0009\u0009return typeof ret === \"string\" ?\n\u0009\u0009\u0009\u0009\u0009// handle most common string cases\n\u0009\u0009\u0009\u0009\u0009ret.replace(rreturn, \"\") :\n\u0009\u0009\u0009\u0009\u0009// handle cases where value is null/undef or number\n\u0009\u0009\u0009\u0009\u0009ret == null ? \"\" : ret;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009isFunction = jQuery.isFunction( value );\n\n\u0009\u0009return this.each(function( i ) {\n\u0009\u0009\u0009var val;\n\n\u0009\u0009\u0009if ( this.nodeType !== 1 ) {\n\u0009\u0009\u0009\u0009return;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( isFunction ) {\n\u0009\u0009\u0009\u0009val = value.call( this, i, jQuery( this ).val() );\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009val = value;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Treat null/undefined as \"\"; convert numbers to string\n\u0009\u0009\u0009if ( val == null ) {\n\u0009\u0009\u0009\u0009val = \"\";\n\u0009\u0009\u0009} else if ( typeof val === \"number\" ) {\n\u0009\u0009\u0009\u0009val += \"\";\n\u0009\u0009\u0009} else if ( jQuery.isArray( val ) ) {\n\u0009\u0009\u0009\u0009val = jQuery.map( val, function( value ) {\n\u0009\u0009\u0009\u0009\u0009return value == null ? \"\" : value + \"\";\n\u0009\u0009\u0009\u0009});\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];\n\n\u0009\u0009\u0009// If set returns undefined, fall back to normal setting\n\u0009\u0009\u0009if ( !hooks || !(\"set\" in hooks) || hooks.set( this, val, \"value\" ) === undefined ) {\n\u0009\u0009\u0009\u0009this.value = val;\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009}\n});\n\njQuery.extend({\n\u0009valHooks: {\n\u0009\u0009option: {\n\u0009\u0009\u0009get: function( elem ) {\n\u0009\u0009\u0009\u0009var val = jQuery.find.attr( elem, \"value\" );\n\u0009\u0009\u0009\u0009return val != null ?\n\u0009\u0009\u0009\u0009\u0009val :\n\u0009\u0009\u0009\u0009\u0009// Support: IE10-11+\n\u0009\u0009\u0009\u0009\u0009// option.text throws exceptions (#14686, #14858)\n\u0009\u0009\u0009\u0009\u0009jQuery.trim( jQuery.text( elem ) );\n\u0009\u0009\u0009}\n\u0009\u0009},\n\u0009\u0009select: {\n\u0009\u0009\u0009get: function( elem ) {\n\u0009\u0009\u0009\u0009var value, option,\n\u0009\u0009\u0009\u0009\u0009options = elem.options,\n\u0009\u0009\u0009\u0009\u0009index = elem.selectedIndex,\n\u0009\u0009\u0009\u0009\u0009one = elem.type === \"select-one\" || index < 0,\n\u0009\u0009\u0009\u0009\u0009values = one ? null : [],\n\u0009\u0009\u0009\u0009\u0009max = one ? index + 1 : options.length,\n\u0009\u0009\u0009\u0009\u0009i = index < 0 ?\n\u0009\u0009\u0009\u0009\u0009\u0009max :\n\u0009\u0009\u0009\u0009\u0009\u0009one ? index : 0;\n\n\u0009\u0009\u0009\u0009// Loop through all the selected options\n\u0009\u0009\u0009\u0009for ( ; i < max; i++ ) {\n\u0009\u0009\u0009\u0009\u0009option = options[ i ];\n\n\u0009\u0009\u0009\u0009\u0009// oldIE doesn't update selected after form reset (#2551)\n\u0009\u0009\u0009\u0009\u0009if ( ( option.selected || i === index ) &&\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Don't return options that are disabled or in a disabled optgroup\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009( support.optDisabled ? !option.disabled : option.getAttribute(\"disabled\") === null ) &&\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, \"optgroup\" ) ) ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Get the specific value for the option\n\u0009\u0009\u0009\u0009\u0009\u0009value = jQuery( option ).val();\n\n\u0009\u0009\u0009\u0009\u0009\u0009// We don't need an array for one selects\n\u0009\u0009\u0009\u0009\u0009\u0009if ( one ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return value;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Multi-Selects return an array\n\u0009\u0009\u0009\u0009\u0009\u0009values.push( value );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009return values;\n\u0009\u0009\u0009},\n\n\u0009\u0009\u0009set: function( elem, value ) {\n\u0009\u0009\u0009\u0009var optionSet, option,\n\u0009\u0009\u0009\u0009\u0009options = elem.options,\n\u0009\u0009\u0009\u0009\u0009values = jQuery.makeArray( value ),\n\u0009\u0009\u0009\u0009\u0009i = options.length;\n\n\u0009\u0009\u0009\u0009while ( i-- ) {\n\u0009\u0009\u0009\u0009\u0009option = options[ i ];\n\n\u0009\u0009\u0009\u0009\u0009if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) >= 0 ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Support: IE6\n\u0009\u0009\u0009\u0009\u0009\u0009// When new option element is added to select box we need to\n\u0009\u0009\u0009\u0009\u0009\u0009// force reflow of newly added node in order to workaround delay\n\u0009\u0009\u0009\u0009\u0009\u0009// of initialization properties\n\u0009\u0009\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009option.selected = optionSet = true;\n\n\u0009\u0009\u0009\u0009\u0009\u0009} catch ( _ ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Will be executed only in IE6\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009option.scrollHeight;\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009option.selected = false;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Force browsers to behave consistently when non-matching value is set\n\u0009\u0009\u0009\u0009if ( !optionSet ) {\n\u0009\u0009\u0009\u0009\u0009elem.selectedIndex = -1;\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009return options;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n});\n\n// Radios and checkboxes getter/setter\njQuery.each([ \"radio\", \"checkbox\" ], function() {\n\u0009jQuery.valHooks[ this ] = {\n\u0009\u0009set: function( elem, value ) {\n\u0009\u0009\u0009if ( jQuery.isArray( value ) ) {\n\u0009\u0009\u0009\u0009return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009};\n\u0009if ( !support.checkOn ) {\n\u0009\u0009jQuery.valHooks[ this ].get = function( elem ) {\n\u0009\u0009\u0009// Support: Webkit\n\u0009\u0009\u0009// \"\" is returned instead of \"on\" if a value isn't specified\n\u0009\u0009\u0009return elem.getAttribute(\"value\") === null ? \"on\" : elem.value;\n\u0009\u0009};\n\u0009}\n});\n\n\n\n\nvar nodeHook, boolHook,\n\u0009attrHandle = jQuery.expr.attrHandle,\n\u0009ruseDefault = /^(?:checked|selected)$/i,\n\u0009getSetAttribute = support.getSetAttribute,\n\u0009getSetInput = support.input;\n\njQuery.fn.extend({\n\u0009attr: function( name, value ) {\n\u0009\u0009return access( this, jQuery.attr, name, value, arguments.length > 1 );\n\u0009},\n\n\u0009removeAttr: function( name ) {\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009jQuery.removeAttr( this, name );\n\u0009\u0009});\n\u0009}\n});\n\njQuery.extend({\n\u0009attr: function( elem, name, value ) {\n\u0009\u0009var hooks, ret,\n\u0009\u0009\u0009nType = elem.nodeType;\n\n\u0009\u0009// don't get/set attributes on text, comment and attribute nodes\n\u0009\u0009if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009// Fallback to prop when attributes are not supported\n\u0009\u0009if ( typeof elem.getAttribute === strundefined ) {\n\u0009\u0009\u0009return jQuery.prop( elem, name, value );\n\u0009\u0009}\n\n\u0009\u0009// All attributes are lowercase\n\u0009\u0009// Grab necessary hook if one is defined\n\u0009\u0009if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {\n\u0009\u0009\u0009name = name.toLowerCase();\n\u0009\u0009\u0009hooks = jQuery.attrHooks[ name ] ||\n\u0009\u0009\u0009\u0009( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );\n\u0009\u0009}\n\n\u0009\u0009if ( value !== undefined ) {\n\n\u0009\u0009\u0009if ( value === null ) {\n\u0009\u0009\u0009\u0009jQuery.removeAttr( elem, name );\n\n\u0009\u0009\u0009} else if ( hooks && \"set\" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {\n\u0009\u0009\u0009\u0009return ret;\n\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009elem.setAttribute( name, value + \"\" );\n\u0009\u0009\u0009\u0009return value;\n\u0009\u0009\u0009}\n\n\u0009\u0009} else if ( hooks && \"get\" in hooks && (ret = hooks.get( elem, name )) !== null ) {\n\u0009\u0009\u0009return ret;\n\n\u0009\u0009} else {\n\u0009\u0009\u0009ret = jQuery.find.attr( elem, name );\n\n\u0009\u0009\u0009// Non-existent attributes return null, we normalize to undefined\n\u0009\u0009\u0009return ret == null ?\n\u0009\u0009\u0009\u0009undefined :\n\u0009\u0009\u0009\u0009ret;\n\u0009\u0009}\n\u0009},\n\n\u0009removeAttr: function( elem, value ) {\n\u0009\u0009var name, propName,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009attrNames = value && value.match( rnotwhite );\n\n\u0009\u0009if ( attrNames && elem.nodeType === 1 ) {\n\u0009\u0009\u0009while ( (name = attrNames[i++]) ) {\n\u0009\u0009\u0009\u0009propName = jQuery.propFix[ name ] || name;\n\n\u0009\u0009\u0009\u0009// Boolean attributes get special treatment (#10870)\n\u0009\u0009\u0009\u0009if ( jQuery.expr.match.bool.test( name ) ) {\n\u0009\u0009\u0009\u0009\u0009// Set corresponding property to false\n\u0009\u0009\u0009\u0009\u0009if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem[ propName ] = false;\n\u0009\u0009\u0009\u0009\u0009// Support: IE<9\n\u0009\u0009\u0009\u0009\u0009// Also clear defaultChecked/defaultSelected (if appropriate)\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009elem[ jQuery.camelCase( \"default-\" + name ) ] =\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009elem[ propName ] = false;\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// See #9699 for explanation of this approach (setting first, then removal)\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009jQuery.attr( elem, name, \"\" );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009elem.removeAttribute( getSetAttribute ? name : propName );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009},\n\n\u0009attrHooks: {\n\u0009\u0009type: {\n\u0009\u0009\u0009set: function( elem, value ) {\n\u0009\u0009\u0009\u0009if ( !support.radioValue && value === \"radio\" && jQuery.nodeName(elem, \"input\") ) {\n\u0009\u0009\u0009\u0009\u0009// Setting the type on a radio button after the value resets the value in IE6-9\n\u0009\u0009\u0009\u0009\u0009// Reset value to default in case type is set after value during creation\n\u0009\u0009\u0009\u0009\u0009var val = elem.value;\n\u0009\u0009\u0009\u0009\u0009elem.setAttribute( \"type\", value );\n\u0009\u0009\u0009\u0009\u0009if ( val ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem.value = val;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009return value;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n});\n\n// Hook for boolean attributes\nboolHook = {\n\u0009set: function( elem, value, name ) {\n\u0009\u0009if ( value === false ) {\n\u0009\u0009\u0009// Remove boolean attributes when set to false\n\u0009\u0009\u0009jQuery.removeAttr( elem, name );\n\u0009\u0009} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {\n\u0009\u0009\u0009// IE<8 needs the *property* name\n\u0009\u0009\u0009elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );\n\n\u0009\u0009// Use defaultChecked and defaultSelected for oldIE\n\u0009\u0009} else {\n\u0009\u0009\u0009elem[ jQuery.camelCase( \"default-\" + name ) ] = elem[ name ] = true;\n\u0009\u0009}\n\n\u0009\u0009return name;\n\u0009}\n};\n\n// Retrieve booleans specially\njQuery.each( jQuery.expr.match.bool.source.match( /\\w+/g ), function( i, name ) {\n\n\u0009var getter = attrHandle[ name ] || jQuery.find.attr;\n\n\u0009attrHandle[ name ] = getSetInput && getSetAttribute || !ruseDefault.test( name ) ?\n\u0009\u0009function( elem, name, isXML ) {\n\u0009\u0009\u0009var ret, handle;\n\u0009\u0009\u0009if ( !isXML ) {\n\u0009\u0009\u0009\u0009// Avoid an infinite loop by temporarily removing this function from the getter\n\u0009\u0009\u0009\u0009handle = attrHandle[ name ];\n\u0009\u0009\u0009\u0009attrHandle[ name ] = ret;\n\u0009\u0009\u0009\u0009ret = getter( elem, name, isXML ) != null ?\n\u0009\u0009\u0009\u0009\u0009name.toLowerCase() :\n\u0009\u0009\u0009\u0009\u0009null;\n\u0009\u0009\u0009\u0009attrHandle[ name ] = handle;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return ret;\n\u0009\u0009} :\n\u0009\u0009function( elem, name, isXML ) {\n\u0009\u0009\u0009if ( !isXML ) {\n\u0009\u0009\u0009\u0009return elem[ jQuery.camelCase( \"default-\" + name ) ] ?\n\u0009\u0009\u0009\u0009\u0009name.toLowerCase() :\n\u0009\u0009\u0009\u0009\u0009null;\n\u0009\u0009\u0009}\n\u0009\u0009};\n});\n\n// fix oldIE attroperties\nif ( !getSetInput || !getSetAttribute ) {\n\u0009jQuery.attrHooks.value = {\n\u0009\u0009set: function( elem, value, name ) {\n\u0009\u0009\u0009if ( jQuery.nodeName( elem, \"input\" ) ) {\n\u0009\u0009\u0009\u0009// Does not return so that setAttribute is also used\n\u0009\u0009\u0009\u0009elem.defaultValue = value;\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009// Use nodeHook if defined (#1954); otherwise setAttribute is fine\n\u0009\u0009\u0009\u0009return nodeHook && nodeHook.set( elem, value, name );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009};\n}\n\n// IE6/7 do not support getting/setting some attributes with get/setAttribute\nif ( !getSetAttribute ) {\n\n\u0009// Use this for any attribute in IE6/7\n\u0009// This fixes almost every IE6/7 issue\n\u0009nodeHook = {\n\u0009\u0009set: function( elem, value, name ) {\n\u0009\u0009\u0009// Set the existing or create a new attribute node\n\u0009\u0009\u0009var ret = elem.getAttributeNode( name );\n\u0009\u0009\u0009if ( !ret ) {\n\u0009\u0009\u0009\u0009elem.setAttributeNode(\n\u0009\u0009\u0009\u0009\u0009(ret = elem.ownerDocument.createAttribute( name ))\n\u0009\u0009\u0009\u0009);\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009ret.value = value += \"\";\n\n\u0009\u0009\u0009// Break association with cloned elements by also using setAttribute (#9646)\n\u0009\u0009\u0009if ( name === \"value\" || value === elem.getAttribute( name ) ) {\n\u0009\u0009\u0009\u0009return value;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009};\n\n\u0009// Some attributes are constructed with empty-string values when not defined\n\u0009attrHandle.id = attrHandle.name = attrHandle.coords =\n\u0009\u0009function( elem, name, isXML ) {\n\u0009\u0009\u0009var ret;\n\u0009\u0009\u0009if ( !isXML ) {\n\u0009\u0009\u0009\u0009return (ret = elem.getAttributeNode( name )) && ret.value !== \"\" ?\n\u0009\u0009\u0009\u0009\u0009ret.value :\n\u0009\u0009\u0009\u0009\u0009null;\n\u0009\u0009\u0009}\n\u0009\u0009};\n\n\u0009// Fixing value retrieval on a button requires this module\n\u0009jQuery.valHooks.button = {\n\u0009\u0009get: function( elem, name ) {\n\u0009\u0009\u0009var ret = elem.getAttributeNode( name );\n\u0009\u0009\u0009if ( ret && ret.specified ) {\n\u0009\u0009\u0009\u0009return ret.value;\n\u0009\u0009\u0009}\n\u0009\u0009},\n\u0009\u0009set: nodeHook.set\n\u0009};\n\n\u0009// Set contenteditable to false on removals(#10429)\n\u0009// Setting to empty string throws an error as an invalid value\n\u0009jQuery.attrHooks.contenteditable = {\n\u0009\u0009set: function( elem, value, name ) {\n\u0009\u0009\u0009nodeHook.set( elem, value === \"\" ? false : value, name );\n\u0009\u0009}\n\u0009};\n\n\u0009// Set width and height to auto instead of 0 on empty string( Bug #8150 )\n\u0009// This is for removals\n\u0009jQuery.each([ \"width\", \"height\" ], function( i, name ) {\n\u0009\u0009jQuery.attrHooks[ name ] = {\n\u0009\u0009\u0009set: function( elem, value ) {\n\u0009\u0009\u0009\u0009if ( value === \"\" ) {\n\u0009\u0009\u0009\u0009\u0009elem.setAttribute( name, \"auto\" );\n\u0009\u0009\u0009\u0009\u0009return value;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009};\n\u0009});\n}\n\nif ( !support.style ) {\n\u0009jQuery.attrHooks.style = {\n\u0009\u0009get: function( elem ) {\n\u0009\u0009\u0009// Return undefined in the case of empty string\n\u0009\u0009\u0009// Note: IE uppercases css property names, but if we were to .toLowerCase()\n\u0009\u0009\u0009// .cssText, that would destroy case senstitivity in URL's, like in \"background\"\n\u0009\u0009\u0009return elem.style.cssText || undefined;\n\u0009\u0009},\n\u0009\u0009set: function( elem, value ) {\n\u0009\u0009\u0009return ( elem.style.cssText = value + \"\" );\n\u0009\u0009}\n\u0009};\n}\n\n\n\n\nvar rfocusable = /^(?:input|select|textarea|button|object)$/i,\n\u0009rclickable = /^(?:a|area)$/i;\n\njQuery.fn.extend({\n\u0009prop: function( name, value ) {\n\u0009\u0009return access( this, jQuery.prop, name, value, arguments.length > 1 );\n\u0009},\n\n\u0009removeProp: function( name ) {\n\u0009\u0009name = jQuery.propFix[ name ] || name;\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009// try/catch handles cases where IE balks (such as removing a property on window)\n\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009this[ name ] = undefined;\n\u0009\u0009\u0009\u0009delete this[ name ];\n\u0009\u0009\u0009} catch( e ) {}\n\u0009\u0009});\n\u0009}\n});\n\njQuery.extend({\n\u0009propFix: {\n\u0009\u0009\"for\": \"htmlFor\",\n\u0009\u0009\"class\": \"className\"\n\u0009},\n\n\u0009prop: function( elem, name, value ) {\n\u0009\u0009var ret, hooks, notxml,\n\u0009\u0009\u0009nType = elem.nodeType;\n\n\u0009\u0009// don't get/set properties on text, comment and attribute nodes\n\u0009\u0009if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009notxml = nType !== 1 || !jQuery.isXMLDoc( elem );\n\n\u0009\u0009if ( notxml ) {\n\u0009\u0009\u0009// Fix name and attach hooks\n\u0009\u0009\u0009name = jQuery.propFix[ name ] || name;\n\u0009\u0009\u0009hooks = jQuery.propHooks[ name ];\n\u0009\u0009}\n\n\u0009\u0009if ( value !== undefined ) {\n\u0009\u0009\u0009return hooks && \"set\" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?\n\u0009\u0009\u0009\u0009ret :\n\u0009\u0009\u0009\u0009( elem[ name ] = value );\n\n\u0009\u0009} else {\n\u0009\u0009\u0009return hooks && \"get\" in hooks && (ret = hooks.get( elem, name )) !== null ?\n\u0009\u0009\u0009\u0009ret :\n\u0009\u0009\u0009\u0009elem[ name ];\n\u0009\u0009}\n\u0009},\n\n\u0009propHooks: {\n\u0009\u0009tabIndex: {\n\u0009\u0009\u0009get: function( elem ) {\n\u0009\u0009\u0009\u0009// elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set\n\u0009\u0009\u0009\u0009// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/\n\u0009\u0009\u0009\u0009// Use proper attribute retrieval(#12072)\n\u0009\u0009\u0009\u0009var tabindex = jQuery.find.attr( elem, \"tabindex\" );\n\n\u0009\u0009\u0009\u0009return tabindex ?\n\u0009\u0009\u0009\u0009\u0009parseInt( tabindex, 10 ) :\n\u0009\u0009\u0009\u0009\u0009rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?\n\u0009\u0009\u0009\u0009\u0009\u00090 :\n\u0009\u0009\u0009\u0009\u0009\u0009-1;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n});\n\n// Some attributes require a special call on IE\n// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx\nif ( !support.hrefNormalized ) {\n\u0009// href/src property should get the full normalized URL (#10299/#12915)\n\u0009jQuery.each([ \"href\", \"src\" ], function( i, name ) {\n\u0009\u0009jQuery.propHooks[ name ] = {\n\u0009\u0009\u0009get: function( elem ) {\n\u0009\u0009\u0009\u0009return elem.getAttribute( name, 4 );\n\u0009\u0009\u0009}\n\u0009\u0009};\n\u0009});\n}\n\n// Support: Safari, IE9+\n// mis-reports the default selected property of an option\n// Accessing the parent's selectedIndex property fixes it\nif ( !support.optSelected ) {\n\u0009jQuery.propHooks.selected = {\n\u0009\u0009get: function( elem ) {\n\u0009\u0009\u0009var parent = elem.parentNode;\n\n\u0009\u0009\u0009if ( parent ) {\n\u0009\u0009\u0009\u0009parent.selectedIndex;\n\n\u0009\u0009\u0009\u0009// Make sure that it also works with optgroups, see #5701\n\u0009\u0009\u0009\u0009if ( parent.parentNode ) {\n\u0009\u0009\u0009\u0009\u0009parent.parentNode.selectedIndex;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return null;\n\u0009\u0009}\n\u0009};\n}\n\njQuery.each([\n\u0009\"tabIndex\",\n\u0009\"readOnly\",\n\u0009\"maxLength\",\n\u0009\"cellSpacing\",\n\u0009\"cellPadding\",\n\u0009\"rowSpan\",\n\u0009\"colSpan\",\n\u0009\"useMap\",\n\u0009\"frameBorder\",\n\u0009\"contentEditable\"\n], function() {\n\u0009jQuery.propFix[ this.toLowerCase() ] = this;\n});\n\n// IE6/7 call enctype encoding\nif ( !support.enctype ) {\n\u0009jQuery.propFix.enctype = \"encoding\";\n}\n\n\n\n\nvar rclass = /[\\t\\r\\n\\f]/g;\n\njQuery.fn.extend({\n\u0009addClass: function( value ) {\n\u0009\u0009var classes, elem, cur, clazz, j, finalValue,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009len = this.length,\n\u0009\u0009\u0009proceed = typeof value === \"string\" && value;\n\n\u0009\u0009if ( jQuery.isFunction( value ) ) {\n\u0009\u0009\u0009return this.each(function( j ) {\n\u0009\u0009\u0009\u0009jQuery( this ).addClass( value.call( this, j, this.className ) );\n\u0009\u0009\u0009});\n\u0009\u0009}\n\n\u0009\u0009if ( proceed ) {\n\u0009\u0009\u0009// The disjunction here is for better compressibility (see removeClass)\n\u0009\u0009\u0009classes = ( value || \"\" ).match( rnotwhite ) || [];\n\n\u0009\u0009\u0009for ( ; i < len; i++ ) {\n\u0009\u0009\u0009\u0009elem = this[ i ];\n\u0009\u0009\u0009\u0009cur = elem.nodeType === 1 && ( elem.className ?\n\u0009\u0009\u0009\u0009\u0009( \" \" + elem.className + \" \" ).replace( rclass, \" \" ) :\n\u0009\u0009\u0009\u0009\u0009\" \"\n\u0009\u0009\u0009\u0009);\n\n\u0009\u0009\u0009\u0009if ( cur ) {\n\u0009\u0009\u0009\u0009\u0009j = 0;\n\u0009\u0009\u0009\u0009\u0009while ( (clazz = classes[j++]) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( cur.indexOf( \" \" + clazz + \" \" ) < 0 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009cur += clazz + \" \";\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// only assign if different to avoid unneeded rendering.\n\u0009\u0009\u0009\u0009\u0009finalValue = jQuery.trim( cur );\n\u0009\u0009\u0009\u0009\u0009if ( elem.className !== finalValue ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem.className = finalValue;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return this;\n\u0009},\n\n\u0009removeClass: function( value ) {\n\u0009\u0009var classes, elem, cur, clazz, j, finalValue,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009len = this.length,\n\u0009\u0009\u0009proceed = arguments.length === 0 || typeof value === \"string\" && value;\n\n\u0009\u0009if ( jQuery.isFunction( value ) ) {\n\u0009\u0009\u0009return this.each(function( j ) {\n\u0009\u0009\u0009\u0009jQuery( this ).removeClass( value.call( this, j, this.className ) );\n\u0009\u0009\u0009});\n\u0009\u0009}\n\u0009\u0009if ( proceed ) {\n\u0009\u0009\u0009classes = ( value || \"\" ).match( rnotwhite ) || [];\n\n\u0009\u0009\u0009for ( ; i < len; i++ ) {\n\u0009\u0009\u0009\u0009elem = this[ i ];\n\u0009\u0009\u0009\u0009// This expression is here for better compressibility (see addClass)\n\u0009\u0009\u0009\u0009cur = elem.nodeType === 1 && ( elem.className ?\n\u0009\u0009\u0009\u0009\u0009( \" \" + elem.className + \" \" ).replace( rclass, \" \" ) :\n\u0009\u0009\u0009\u0009\u0009\"\"\n\u0009\u0009\u0009\u0009);\n\n\u0009\u0009\u0009\u0009if ( cur ) {\n\u0009\u0009\u0009\u0009\u0009j = 0;\n\u0009\u0009\u0009\u0009\u0009while ( (clazz = classes[j++]) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// Remove *all* instances\n\u0009\u0009\u0009\u0009\u0009\u0009while ( cur.indexOf( \" \" + clazz + \" \" ) >= 0 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009cur = cur.replace( \" \" + clazz + \" \", \" \" );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// only assign if different to avoid unneeded rendering.\n\u0009\u0009\u0009\u0009\u0009finalValue = value ? jQuery.trim( cur ) : \"\";\n\u0009\u0009\u0009\u0009\u0009if ( elem.className !== finalValue ) {\n\u0009\u0009\u0009\u0009\u0009\u0009elem.className = finalValue;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return this;\n\u0009},\n\n\u0009toggleClass: function( value, stateVal ) {\n\u0009\u0009var type = typeof value;\n\n\u0009\u0009if ( typeof stateVal === \"boolean\" && type === \"string\" ) {\n\u0009\u0009\u0009return stateVal ? this.addClass( value ) : this.removeClass( value );\n\u0009\u0009}\n\n\u0009\u0009if ( jQuery.isFunction( value ) ) {\n\u0009\u0009\u0009return this.each(function( i ) {\n\u0009\u0009\u0009\u0009jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );\n\u0009\u0009\u0009});\n\u0009\u0009}\n\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009if ( type === \"string\" ) {\n\u0009\u0009\u0009\u0009// toggle individual class names\n\u0009\u0009\u0009\u0009var className,\n\u0009\u0009\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009\u0009\u0009self = jQuery( this ),\n\u0009\u0009\u0009\u0009\u0009classNames = value.match( rnotwhite ) || [];\n\n\u0009\u0009\u0009\u0009while ( (className = classNames[ i++ ]) ) {\n\u0009\u0009\u0009\u0009\u0009// check each className given, space separated list\n\u0009\u0009\u0009\u0009\u0009if ( self.hasClass( className ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009self.removeClass( className );\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009self.addClass( className );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Toggle whole class name\n\u0009\u0009\u0009} else if ( type === strundefined || type === \"boolean\" ) {\n\u0009\u0009\u0009\u0009if ( this.className ) {\n\u0009\u0009\u0009\u0009\u0009// store className if set\n\u0009\u0009\u0009\u0009\u0009jQuery._data( this, \"__className__\", this.className );\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// If the element has a class name or if we're passed \"false\",\n\u0009\u0009\u0009\u0009// then remove the whole classname (if there was one, the above saved it).\n\u0009\u0009\u0009\u0009// Otherwise bring back whatever was previously saved (if anything),\n\u0009\u0009\u0009\u0009// falling back to the empty string if nothing was stored.\n\u0009\u0009\u0009\u0009this.className = this.className || value === false ? \"\" : jQuery._data( this, \"__className__\" ) || \"\";\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\n\u0009hasClass: function( selector ) {\n\u0009\u0009var className = \" \" + selector + \" \",\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009l = this.length;\n\u0009\u0009for ( ; i < l; i++ ) {\n\u0009\u0009\u0009if ( this[i].nodeType === 1 && (\" \" + this[i].className + \" \").replace(rclass, \" \").indexOf( className ) >= 0 ) {\n\u0009\u0009\u0009\u0009return true;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return false;\n\u0009}\n});\n\n\n\n\n// Return jQuery for attributes-only inclusion\n\n\njQuery.each( (\"blur focus focusin focusout load resize scroll unload click dblclick \" +\n\u0009\"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave \" +\n\u0009\"change select submit keydown keypress keyup error contextmenu\").split(\" \"), function( i, name ) {\n\n\u0009// Handle event binding\n\u0009jQuery.fn[ name ] = function( data, fn ) {\n\u0009\u0009return arguments.length > 0 ?\n\u0009\u0009\u0009this.on( name, null, data, fn ) :\n\u0009\u0009\u0009this.trigger( name );\n\u0009};\n});\n\njQuery.fn.extend({\n\u0009hover: function( fnOver, fnOut ) {\n\u0009\u0009return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );\n\u0009},\n\n\u0009bind: function( types, data, fn ) {\n\u0009\u0009return this.on( types, null, data, fn );\n\u0009},\n\u0009unbind: function( types, fn ) {\n\u0009\u0009return this.off( types, null, fn );\n\u0009},\n\n\u0009delegate: function( selector, types, data, fn ) {\n\u0009\u0009return this.on( types, selector, data, fn );\n\u0009},\n\u0009undelegate: function( selector, types, fn ) {\n\u0009\u0009// ( namespace ) or ( selector, types [, fn] )\n\u0009\u0009return arguments.length === 1 ? this.off( selector, \"**\" ) : this.off( types, selector || \"**\", fn );\n\u0009}\n});\n\n\nvar nonce = jQuery.now();\n\nvar rquery = (/\\?/);\n\n\n\nvar rvalidtokens = /(,)|(\\[|{)|(}|])|\"(?:[^\"\\\\\\r\\n]|\\\\[\"\\\\\\/bfnrt]|\\\\u[\\da-fA-F]{4})*\"\\s*:?|true|false|null|-?(?!0\\d)\\d+(?:\\.\\d+|)(?:[eE][+-]?\\d+|)/g;\n\njQuery.parseJSON = function( data ) {\n\u0009// Attempt to parse using the native JSON parser first\n\u0009if ( window.JSON && window.JSON.parse ) {\n\u0009\u0009// Support: Android 2.3\n\u0009\u0009// Workaround failure to string-cast null input\n\u0009\u0009return window.JSON.parse( data + \"\" );\n\u0009}\n\n\u0009var requireNonComma,\n\u0009\u0009depth = null,\n\u0009\u0009str = jQuery.trim( data + \"\" );\n\n\u0009// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains\n\u0009// after removing valid tokens\n\u0009return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {\n\n\u0009\u0009// Force termination if we see a misplaced comma\n\u0009\u0009if ( requireNonComma && comma ) {\n\u0009\u0009\u0009depth = 0;\n\u0009\u0009}\n\n\u0009\u0009// Perform no more replacements after returning to outermost depth\n\u0009\u0009if ( depth === 0 ) {\n\u0009\u0009\u0009return token;\n\u0009\u0009}\n\n\u0009\u0009// Commas must not follow \"[\", \"{\", or \",\"\n\u0009\u0009requireNonComma = open || comma;\n\n\u0009\u0009// Determine new depth\n\u0009\u0009// array/object open (\"[\" or \"{\"): depth += true - false (increment)\n\u0009\u0009// array/object close (\"]\" or \"}\"): depth += false - true (decrement)\n\u0009\u0009// other cases (\",\" or primitive): depth += true - true (numeric cast)\n\u0009\u0009depth += !close - !open;\n\n\u0009\u0009// Remove this token\n\u0009\u0009return \"\";\n\u0009}) ) ?\n\u0009\u0009( Function( \"return \" + str ) )() :\n\u0009\u0009jQuery.error( \"Invalid JSON: \" + data );\n};\n\n\n// Cross-browser xml parsing\njQuery.parseXML = function( data ) {\n\u0009var xml, tmp;\n\u0009if ( !data || typeof data !== \"string\" ) {\n\u0009\u0009return null;\n\u0009}\n\u0009try {\n\u0009\u0009if ( window.DOMParser ) { // Standard\n\u0009\u0009\u0009tmp = new DOMParser();\n\u0009\u0009\u0009xml = tmp.parseFromString( data, \"text/xml\" );\n\u0009\u0009} else { // IE\n\u0009\u0009\u0009xml = new ActiveXObject( \"Microsoft.XMLDOM\" );\n\u0009\u0009\u0009xml.async = \"false\";\n\u0009\u0009\u0009xml.loadXML( data );\n\u0009\u0009}\n\u0009} catch( e ) {\n\u0009\u0009xml = undefined;\n\u0009}\n\u0009if ( !xml || !xml.documentElement || xml.getElementsByTagName( \"parsererror\" ).length ) {\n\u0009\u0009jQuery.error( \"Invalid XML: \" + data );\n\u0009}\n\u0009return xml;\n};\n\n\nvar\n\u0009// Document location\n\u0009ajaxLocParts,\n\u0009ajaxLocation,\n\n\u0009rhash = /#.*$/,\n\u0009rts = /([?&])_=[^&]*/,\n\u0009rheaders = /^(.*?):[ \\t]*([^\\r\\n]*)\\r?$/mg, // IE leaves an \\r character at EOL\n\u0009// #7653, #8125, #8152: local protocol detection\n\u0009rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,\n\u0009rnoContent = /^(?:GET|HEAD)$/,\n\u0009rprotocol = /^\\/\\//,\n\u0009rurl = /^([\\w.+-]+:)(?:\\/\\/(?:[^\\/?#]*@|)([^\\/?#:]*)(?::(\\d+)|)|)/,\n\n\u0009/* Prefilters\n\u0009 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)\n\u0009 * 2) These are called:\n\u0009 *    - BEFORE asking for a transport\n\u0009 *    - AFTER param serialization (s.data is a string if s.processData is true)\n\u0009 * 3) key is the dataType\n\u0009 * 4) the catchall symbol \"*\" can be used\n\u0009 * 5) execution will start with transport dataType and THEN continue down to \"*\" if needed\n\u0009 */\n\u0009prefilters = {},\n\n\u0009/* Transports bindings\n\u0009 * 1) key is the dataType\n\u0009 * 2) the catchall symbol \"*\" can be used\n\u0009 * 3) selection will start with transport dataType and THEN go to \"*\" if needed\n\u0009 */\n\u0009transports = {},\n\n\u0009// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression\n\u0009allTypes = \"*/\".concat(\"*\");\n\n// #8138, IE may throw an exception when accessing\n// a field from window.location if document.domain has been set\ntry {\n\u0009ajaxLocation = location.href;\n} catch( e ) {\n\u0009// Use the href attribute of an A element\n\u0009// since IE will modify it given document.location\n\u0009ajaxLocation = document.createElement( \"a\" );\n\u0009ajaxLocation.href = \"\";\n\u0009ajaxLocation = ajaxLocation.href;\n}\n\n// Segment location into parts\najaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];\n\n// Base \"constructor\" for jQuery.ajaxPrefilter and jQuery.ajaxTransport\nfunction addToPrefiltersOrTransports( structure ) {\n\n\u0009// dataTypeExpression is optional and defaults to \"*\"\n\u0009return function( dataTypeExpression, func ) {\n\n\u0009\u0009if ( typeof dataTypeExpression !== \"string\" ) {\n\u0009\u0009\u0009func = dataTypeExpression;\n\u0009\u0009\u0009dataTypeExpression = \"*\";\n\u0009\u0009}\n\n\u0009\u0009var dataType,\n\u0009\u0009\u0009i = 0,\n\u0009\u0009\u0009dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];\n\n\u0009\u0009if ( jQuery.isFunction( func ) ) {\n\u0009\u0009\u0009// For each dataType in the dataTypeExpression\n\u0009\u0009\u0009while ( (dataType = dataTypes[i++]) ) {\n\u0009\u0009\u0009\u0009// Prepend if requested\n\u0009\u0009\u0009\u0009if ( dataType.charAt( 0 ) === \"+\" ) {\n\u0009\u0009\u0009\u0009\u0009dataType = dataType.slice( 1 ) || \"*\";\n\u0009\u0009\u0009\u0009\u0009(structure[ dataType ] = structure[ dataType ] || []).unshift( func );\n\n\u0009\u0009\u0009\u0009// Otherwise append\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009(structure[ dataType ] = structure[ dataType ] || []).push( func );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009};\n}\n\n// Base inspection function for prefilters and transports\nfunction inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {\n\n\u0009var inspected = {},\n\u0009\u0009seekingTransport = ( structure === transports );\n\n\u0009function inspect( dataType ) {\n\u0009\u0009var selected;\n\u0009\u0009inspected[ dataType ] = true;\n\u0009\u0009jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {\n\u0009\u0009\u0009var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );\n\u0009\u0009\u0009if ( typeof dataTypeOrTransport === \"string\" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {\n\u0009\u0009\u0009\u0009options.dataTypes.unshift( dataTypeOrTransport );\n\u0009\u0009\u0009\u0009inspect( dataTypeOrTransport );\n\u0009\u0009\u0009\u0009return false;\n\u0009\u0009\u0009} else if ( seekingTransport ) {\n\u0009\u0009\u0009\u0009return !( selected = dataTypeOrTransport );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009\u0009return selected;\n\u0009}\n\n\u0009return inspect( options.dataTypes[ 0 ] ) || !inspected[ \"*\" ] && inspect( \"*\" );\n}\n\n// A special extend for ajax options\n// that takes \"flat\" options (not to be deep extended)\n// Fixes #9887\nfunction ajaxExtend( target, src ) {\n\u0009var deep, key,\n\u0009\u0009flatOptions = jQuery.ajaxSettings.flatOptions || {};\n\n\u0009for ( key in src ) {\n\u0009\u0009if ( src[ key ] !== undefined ) {\n\u0009\u0009\u0009( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];\n\u0009\u0009}\n\u0009}\n\u0009if ( deep ) {\n\u0009\u0009jQuery.extend( true, target, deep );\n\u0009}\n\n\u0009return target;\n}\n\n/* Handles responses to an ajax request:\n * - finds the right dataType (mediates between content-type and expected dataType)\n * - returns the corresponding response\n */\nfunction ajaxHandleResponses( s, jqXHR, responses ) {\n\u0009var firstDataType, ct, finalDataType, type,\n\u0009\u0009contents = s.contents,\n\u0009\u0009dataTypes = s.dataTypes;\n\n\u0009// Remove auto dataType and get content-type in the process\n\u0009while ( dataTypes[ 0 ] === \"*\" ) {\n\u0009\u0009dataTypes.shift();\n\u0009\u0009if ( ct === undefined ) {\n\u0009\u0009\u0009ct = s.mimeType || jqXHR.getResponseHeader(\"Content-Type\");\n\u0009\u0009}\n\u0009}\n\n\u0009// Check if we're dealing with a known content-type\n\u0009if ( ct ) {\n\u0009\u0009for ( type in contents ) {\n\u0009\u0009\u0009if ( contents[ type ] && contents[ type ].test( ct ) ) {\n\u0009\u0009\u0009\u0009dataTypes.unshift( type );\n\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009// Check to see if we have a response for the expected dataType\n\u0009if ( dataTypes[ 0 ] in responses ) {\n\u0009\u0009finalDataType = dataTypes[ 0 ];\n\u0009} else {\n\u0009\u0009// Try convertible dataTypes\n\u0009\u0009for ( type in responses ) {\n\u0009\u0009\u0009if ( !dataTypes[ 0 ] || s.converters[ type + \" \" + dataTypes[0] ] ) {\n\u0009\u0009\u0009\u0009finalDataType = type;\n\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009if ( !firstDataType ) {\n\u0009\u0009\u0009\u0009firstDataType = type;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009\u0009// Or just use first one\n\u0009\u0009finalDataType = finalDataType || firstDataType;\n\u0009}\n\n\u0009// If we found a dataType\n\u0009// We add the dataType to the list if needed\n\u0009// and return the corresponding response\n\u0009if ( finalDataType ) {\n\u0009\u0009if ( finalDataType !== dataTypes[ 0 ] ) {\n\u0009\u0009\u0009dataTypes.unshift( finalDataType );\n\u0009\u0009}\n\u0009\u0009return responses[ finalDataType ];\n\u0009}\n}\n\n/* Chain conversions given the request and the original response\n * Also sets the responseXXX fields on the jqXHR instance\n */\nfunction ajaxConvert( s, response, jqXHR, isSuccess ) {\n\u0009var conv2, current, conv, tmp, prev,\n\u0009\u0009converters = {},\n\u0009\u0009// Work with a copy of dataTypes in case we need to modify it for conversion\n\u0009\u0009dataTypes = s.dataTypes.slice();\n\n\u0009// Create converters map with lowercased keys\n\u0009if ( dataTypes[ 1 ] ) {\n\u0009\u0009for ( conv in s.converters ) {\n\u0009\u0009\u0009converters[ conv.toLowerCase() ] = s.converters[ conv ];\n\u0009\u0009}\n\u0009}\n\n\u0009current = dataTypes.shift();\n\n\u0009// Convert to each sequential dataType\n\u0009while ( current ) {\n\n\u0009\u0009if ( s.responseFields[ current ] ) {\n\u0009\u0009\u0009jqXHR[ s.responseFields[ current ] ] = response;\n\u0009\u0009}\n\n\u0009\u0009// Apply the dataFilter if provided\n\u0009\u0009if ( !prev && isSuccess && s.dataFilter ) {\n\u0009\u0009\u0009response = s.dataFilter( response, s.dataType );\n\u0009\u0009}\n\n\u0009\u0009prev = current;\n\u0009\u0009current = dataTypes.shift();\n\n\u0009\u0009if ( current ) {\n\n\u0009\u0009\u0009// There's only work to do if current dataType is non-auto\n\u0009\u0009\u0009if ( current === \"*\" ) {\n\n\u0009\u0009\u0009\u0009current = prev;\n\n\u0009\u0009\u0009// Convert response if prev dataType is non-auto and differs from current\n\u0009\u0009\u0009} else if ( prev !== \"*\" && prev !== current ) {\n\n\u0009\u0009\u0009\u0009// Seek a direct converter\n\u0009\u0009\u0009\u0009conv = converters[ prev + \" \" + current ] || converters[ \"* \" + current ];\n\n\u0009\u0009\u0009\u0009// If none found, seek a pair\n\u0009\u0009\u0009\u0009if ( !conv ) {\n\u0009\u0009\u0009\u0009\u0009for ( conv2 in converters ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009// If conv2 outputs current\n\u0009\u0009\u0009\u0009\u0009\u0009tmp = conv2.split( \" \" );\n\u0009\u0009\u0009\u0009\u0009\u0009if ( tmp[ 1 ] === current ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// If prev can be converted to accepted input\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009conv = converters[ prev + \" \" + tmp[ 0 ] ] ||\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009converters[ \"* \" + tmp[ 0 ] ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( conv ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Condense equivalence converters\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( conv === true ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009conv = converters[ conv2 ];\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Otherwise, insert the intermediate dataType\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else if ( converters[ conv2 ] !== true ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009current = tmp[ 0 ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009dataTypes.unshift( tmp[ 1 ] );\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009break;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Apply converter (if not an equivalence)\n\u0009\u0009\u0009\u0009if ( conv !== true ) {\n\n\u0009\u0009\u0009\u0009\u0009// Unless errors are allowed to bubble, catch and return them\n\u0009\u0009\u0009\u0009\u0009if ( conv && s[ \"throws\" ] ) {\n\u0009\u0009\u0009\u0009\u0009\u0009response = conv( response );\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009response = conv( response );\n\u0009\u0009\u0009\u0009\u0009\u0009} catch ( e ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009return { state: \"parsererror\", error: conv ? e : \"No conversion from \" + prev + \" to \" + current };\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009}\n\n\u0009return { state: \"success\", data: response };\n}\n\njQuery.extend({\n\n\u0009// Counter for holding the number of active queries\n\u0009active: 0,\n\n\u0009// Last-Modified header cache for next request\n\u0009lastModified: {},\n\u0009etag: {},\n\n\u0009ajaxSettings: {\n\u0009\u0009url: ajaxLocation,\n\u0009\u0009type: \"GET\",\n\u0009\u0009isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),\n\u0009\u0009global: true,\n\u0009\u0009processData: true,\n\u0009\u0009async: true,\n\u0009\u0009contentType: \"application/x-www-form-urlencoded; charset=UTF-8\",\n\u0009\u0009/*\n\u0009\u0009timeout: 0,\n\u0009\u0009data: null,\n\u0009\u0009dataType: null,\n\u0009\u0009username: null,\n\u0009\u0009password: null,\n\u0009\u0009cache: null,\n\u0009\u0009throws: false,\n\u0009\u0009traditional: false,\n\u0009\u0009headers: {},\n\u0009\u0009*/\n\n\u0009\u0009accepts: {\n\u0009\u0009\u0009\"*\": allTypes,\n\u0009\u0009\u0009text: \"text/plain\",\n\u0009\u0009\u0009html: \"text/html\",\n\u0009\u0009\u0009xml: \"application/xml, text/xml\",\n\u0009\u0009\u0009json: \"application/json, text/javascript\"\n\u0009\u0009},\n\n\u0009\u0009contents: {\n\u0009\u0009\u0009xml: /xml/,\n\u0009\u0009\u0009html: /html/,\n\u0009\u0009\u0009json: /json/\n\u0009\u0009},\n\n\u0009\u0009responseFields: {\n\u0009\u0009\u0009xml: \"responseXML\",\n\u0009\u0009\u0009text: \"responseText\",\n\u0009\u0009\u0009json: \"responseJSON\"\n\u0009\u0009},\n\n\u0009\u0009// Data converters\n\u0009\u0009// Keys separate source (or catchall \"*\") and destination types with a single space\n\u0009\u0009converters: {\n\n\u0009\u0009\u0009// Convert anything to text\n\u0009\u0009\u0009\"* text\": String,\n\n\u0009\u0009\u0009// Text to html (true = no transformation)\n\u0009\u0009\u0009\"text html\": true,\n\n\u0009\u0009\u0009// Evaluate text as a json expression\n\u0009\u0009\u0009\"text json\": jQuery.parseJSON,\n\n\u0009\u0009\u0009// Parse text as xml\n\u0009\u0009\u0009\"text xml\": jQuery.parseXML\n\u0009\u0009},\n\n\u0009\u0009// For options that shouldn't be deep extended:\n\u0009\u0009// you can add your own custom options here if\n\u0009\u0009// and when you create one that shouldn't be\n\u0009\u0009// deep extended (see ajaxExtend)\n\u0009\u0009flatOptions: {\n\u0009\u0009\u0009url: true,\n\u0009\u0009\u0009context: true\n\u0009\u0009}\n\u0009},\n\n\u0009// Creates a full fledged settings object into target\n\u0009// with both ajaxSettings and settings fields.\n\u0009// If target is omitted, writes into ajaxSettings.\n\u0009ajaxSetup: function( target, settings ) {\n\u0009\u0009return settings ?\n\n\u0009\u0009\u0009// Building a settings object\n\u0009\u0009\u0009ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :\n\n\u0009\u0009\u0009// Extending ajaxSettings\n\u0009\u0009\u0009ajaxExtend( jQuery.ajaxSettings, target );\n\u0009},\n\n\u0009ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),\n\u0009ajaxTransport: addToPrefiltersOrTransports( transports ),\n\n\u0009// Main method\n\u0009ajax: function( url, options ) {\n\n\u0009\u0009// If url is an object, simulate pre-1.5 signature\n\u0009\u0009if ( typeof url === \"object\" ) {\n\u0009\u0009\u0009options = url;\n\u0009\u0009\u0009url = undefined;\n\u0009\u0009}\n\n\u0009\u0009// Force options to be an object\n\u0009\u0009options = options || {};\n\n\u0009\u0009var // Cross-domain detection vars\n\u0009\u0009\u0009parts,\n\u0009\u0009\u0009// Loop variable\n\u0009\u0009\u0009i,\n\u0009\u0009\u0009// URL without anti-cache param\n\u0009\u0009\u0009cacheURL,\n\u0009\u0009\u0009// Response headers as string\n\u0009\u0009\u0009responseHeadersString,\n\u0009\u0009\u0009// timeout handle\n\u0009\u0009\u0009timeoutTimer,\n\n\u0009\u0009\u0009// To know if global events are to be dispatched\n\u0009\u0009\u0009fireGlobals,\n\n\u0009\u0009\u0009transport,\n\u0009\u0009\u0009// Response headers\n\u0009\u0009\u0009responseHeaders,\n\u0009\u0009\u0009// Create the final options object\n\u0009\u0009\u0009s = jQuery.ajaxSetup( {}, options ),\n\u0009\u0009\u0009// Callbacks context\n\u0009\u0009\u0009callbackContext = s.context || s,\n\u0009\u0009\u0009// Context for global events is callbackContext if it is a DOM node or jQuery collection\n\u0009\u0009\u0009globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?\n\u0009\u0009\u0009\u0009jQuery( callbackContext ) :\n\u0009\u0009\u0009\u0009jQuery.event,\n\u0009\u0009\u0009// Deferreds\n\u0009\u0009\u0009deferred = jQuery.Deferred(),\n\u0009\u0009\u0009completeDeferred = jQuery.Callbacks(\"once memory\"),\n\u0009\u0009\u0009// Status-dependent callbacks\n\u0009\u0009\u0009statusCode = s.statusCode || {},\n\u0009\u0009\u0009// Headers (they are sent all at once)\n\u0009\u0009\u0009requestHeaders = {},\n\u0009\u0009\u0009requestHeadersNames = {},\n\u0009\u0009\u0009// The jqXHR state\n\u0009\u0009\u0009state = 0,\n\u0009\u0009\u0009// Default abort message\n\u0009\u0009\u0009strAbort = \"canceled\",\n\u0009\u0009\u0009// Fake xhr\n\u0009\u0009\u0009jqXHR = {\n\u0009\u0009\u0009\u0009readyState: 0,\n\n\u0009\u0009\u0009\u0009// Builds headers hashtable if needed\n\u0009\u0009\u0009\u0009getResponseHeader: function( key ) {\n\u0009\u0009\u0009\u0009\u0009var match;\n\u0009\u0009\u0009\u0009\u0009if ( state === 2 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( !responseHeaders ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009responseHeaders = {};\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009while ( (match = rheaders.exec( responseHeadersString )) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009match = responseHeaders[ key.toLowerCase() ];\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009return match == null ? null : match;\n\u0009\u0009\u0009\u0009},\n\n\u0009\u0009\u0009\u0009// Raw string\n\u0009\u0009\u0009\u0009getAllResponseHeaders: function() {\n\u0009\u0009\u0009\u0009\u0009return state === 2 ? responseHeadersString : null;\n\u0009\u0009\u0009\u0009},\n\n\u0009\u0009\u0009\u0009// Caches the header\n\u0009\u0009\u0009\u0009setRequestHeader: function( name, value ) {\n\u0009\u0009\u0009\u0009\u0009var lname = name.toLowerCase();\n\u0009\u0009\u0009\u0009\u0009if ( !state ) {\n\u0009\u0009\u0009\u0009\u0009\u0009name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;\n\u0009\u0009\u0009\u0009\u0009\u0009requestHeaders[ name ] = value;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009\u0009},\n\n\u0009\u0009\u0009\u0009// Overrides response content-type header\n\u0009\u0009\u0009\u0009overrideMimeType: function( type ) {\n\u0009\u0009\u0009\u0009\u0009if ( !state ) {\n\u0009\u0009\u0009\u0009\u0009\u0009s.mimeType = type;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009\u0009},\n\n\u0009\u0009\u0009\u0009// Status-dependent callbacks\n\u0009\u0009\u0009\u0009statusCode: function( map ) {\n\u0009\u0009\u0009\u0009\u0009var code;\n\u0009\u0009\u0009\u0009\u0009if ( map ) {\n\u0009\u0009\u0009\u0009\u0009\u0009if ( state < 2 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009for ( code in map ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Lazy-add the new callback in a way that preserves old ones\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009statusCode[ code ] = [ statusCode[ code ], map[ code ] ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Execute the appropriate callbacks\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009jqXHR.always( map[ jqXHR.status ] );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009\u0009},\n\n\u0009\u0009\u0009\u0009// Cancel the request\n\u0009\u0009\u0009\u0009abort: function( statusText ) {\n\u0009\u0009\u0009\u0009\u0009var finalText = statusText || strAbort;\n\u0009\u0009\u0009\u0009\u0009if ( transport ) {\n\u0009\u0009\u0009\u0009\u0009\u0009transport.abort( finalText );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009done( 0, finalText );\n\u0009\u0009\u0009\u0009\u0009return this;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009};\n\n\u0009\u0009// Attach deferreds\n\u0009\u0009deferred.promise( jqXHR ).complete = completeDeferred.add;\n\u0009\u0009jqXHR.success = jqXHR.done;\n\u0009\u0009jqXHR.error = jqXHR.fail;\n\n\u0009\u0009// Remove hash character (#7531: and string promotion)\n\u0009\u0009// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)\n\u0009\u0009// Handle falsy url in the settings object (#10093: consistency with old signature)\n\u0009\u0009// We also use the url parameter if available\n\u0009\u0009s.url = ( ( url || s.url || ajaxLocation ) + \"\" ).replace( rhash, \"\" ).replace( rprotocol, ajaxLocParts[ 1 ] + \"//\" );\n\n\u0009\u0009// Alias method option to type as per ticket #12004\n\u0009\u0009s.type = options.method || options.type || s.method || s.type;\n\n\u0009\u0009// Extract dataTypes list\n\u0009\u0009s.dataTypes = jQuery.trim( s.dataType || \"*\" ).toLowerCase().match( rnotwhite ) || [ \"\" ];\n\n\u0009\u0009// A cross-domain request is in order when we have a protocol:host:port mismatch\n\u0009\u0009if ( s.crossDomain == null ) {\n\u0009\u0009\u0009parts = rurl.exec( s.url.toLowerCase() );\n\u0009\u0009\u0009s.crossDomain = !!( parts &&\n\u0009\u0009\u0009\u0009( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||\n\u0009\u0009\u0009\u0009\u0009( parts[ 3 ] || ( parts[ 1 ] === \"http:\" ? \"80\" : \"443\" ) ) !==\n\u0009\u0009\u0009\u0009\u0009\u0009( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === \"http:\" ? \"80\" : \"443\" ) ) )\n\u0009\u0009\u0009);\n\u0009\u0009}\n\n\u0009\u0009// Convert data if not already a string\n\u0009\u0009if ( s.data && s.processData && typeof s.data !== \"string\" ) {\n\u0009\u0009\u0009s.data = jQuery.param( s.data, s.traditional );\n\u0009\u0009}\n\n\u0009\u0009// Apply prefilters\n\u0009\u0009inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );\n\n\u0009\u0009// If request was aborted inside a prefilter, stop there\n\u0009\u0009if ( state === 2 ) {\n\u0009\u0009\u0009return jqXHR;\n\u0009\u0009}\n\n\u0009\u0009// We can fire global events as of now if asked to\n\u0009\u0009// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)\n\u0009\u0009fireGlobals = jQuery.event && s.global;\n\n\u0009\u0009// Watch for a new set of requests\n\u0009\u0009if ( fireGlobals && jQuery.active++ === 0 ) {\n\u0009\u0009\u0009jQuery.event.trigger(\"ajaxStart\");\n\u0009\u0009}\n\n\u0009\u0009// Uppercase the type\n\u0009\u0009s.type = s.type.toUpperCase();\n\n\u0009\u0009// Determine if request has content\n\u0009\u0009s.hasContent = !rnoContent.test( s.type );\n\n\u0009\u0009// Save the URL in case we're toying with the If-Modified-Since\n\u0009\u0009// and/or If-None-Match header later on\n\u0009\u0009cacheURL = s.url;\n\n\u0009\u0009// More options handling for requests with no content\n\u0009\u0009if ( !s.hasContent ) {\n\n\u0009\u0009\u0009// If data is available, append data to url\n\u0009\u0009\u0009if ( s.data ) {\n\u0009\u0009\u0009\u0009cacheURL = ( s.url += ( rquery.test( cacheURL ) ? \"&\" : \"?\" ) + s.data );\n\u0009\u0009\u0009\u0009// #9682: remove data so that it's not used in an eventual retry\n\u0009\u0009\u0009\u0009delete s.data;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Add anti-cache in url if needed\n\u0009\u0009\u0009if ( s.cache === false ) {\n\u0009\u0009\u0009\u0009s.url = rts.test( cacheURL ) ?\n\n\u0009\u0009\u0009\u0009\u0009// If there is already a '_' parameter, set its value\n\u0009\u0009\u0009\u0009\u0009cacheURL.replace( rts, \"$1_=\" + nonce++ ) :\n\n\u0009\u0009\u0009\u0009\u0009// Otherwise add one to the end\n\u0009\u0009\u0009\u0009\u0009cacheURL + ( rquery.test( cacheURL ) ? \"&\" : \"?\" ) + \"_=\" + nonce++;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.\n\u0009\u0009if ( s.ifModified ) {\n\u0009\u0009\u0009if ( jQuery.lastModified[ cacheURL ] ) {\n\u0009\u0009\u0009\u0009jqXHR.setRequestHeader( \"If-Modified-Since\", jQuery.lastModified[ cacheURL ] );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009if ( jQuery.etag[ cacheURL ] ) {\n\u0009\u0009\u0009\u0009jqXHR.setRequestHeader( \"If-None-Match\", jQuery.etag[ cacheURL ] );\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Set the correct header, if data is being sent\n\u0009\u0009if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {\n\u0009\u0009\u0009jqXHR.setRequestHeader( \"Content-Type\", s.contentType );\n\u0009\u0009}\n\n\u0009\u0009// Set the Accepts header for the server, depending on the dataType\n\u0009\u0009jqXHR.setRequestHeader(\n\u0009\u0009\u0009\"Accept\",\n\u0009\u0009\u0009s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?\n\u0009\u0009\u0009\u0009s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== \"*\" ? \", \" + allTypes + \"; q=0.01\" : \"\" ) :\n\u0009\u0009\u0009\u0009s.accepts[ \"*\" ]\n\u0009\u0009);\n\n\u0009\u0009// Check for headers option\n\u0009\u0009for ( i in s.headers ) {\n\u0009\u0009\u0009jqXHR.setRequestHeader( i, s.headers[ i ] );\n\u0009\u0009}\n\n\u0009\u0009// Allow custom headers/mimetypes and early abort\n\u0009\u0009if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {\n\u0009\u0009\u0009// Abort if not done already and return\n\u0009\u0009\u0009return jqXHR.abort();\n\u0009\u0009}\n\n\u0009\u0009// aborting is no longer a cancellation\n\u0009\u0009strAbort = \"abort\";\n\n\u0009\u0009// Install callbacks on deferreds\n\u0009\u0009for ( i in { success: 1, error: 1, complete: 1 } ) {\n\u0009\u0009\u0009jqXHR[ i ]( s[ i ] );\n\u0009\u0009}\n\n\u0009\u0009// Get transport\n\u0009\u0009transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );\n\n\u0009\u0009// If no transport, we auto-abort\n\u0009\u0009if ( !transport ) {\n\u0009\u0009\u0009done( -1, \"No Transport\" );\n\u0009\u0009} else {\n\u0009\u0009\u0009jqXHR.readyState = 1;\n\n\u0009\u0009\u0009// Send global event\n\u0009\u0009\u0009if ( fireGlobals ) {\n\u0009\u0009\u0009\u0009globalEventContext.trigger( \"ajaxSend\", [ jqXHR, s ] );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009// Timeout\n\u0009\u0009\u0009if ( s.async && s.timeout > 0 ) {\n\u0009\u0009\u0009\u0009timeoutTimer = setTimeout(function() {\n\u0009\u0009\u0009\u0009\u0009jqXHR.abort(\"timeout\");\n\u0009\u0009\u0009\u0009}, s.timeout );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009state = 1;\n\u0009\u0009\u0009\u0009transport.send( requestHeaders, done );\n\u0009\u0009\u0009} catch ( e ) {\n\u0009\u0009\u0009\u0009// Propagate exception as error if not done\n\u0009\u0009\u0009\u0009if ( state < 2 ) {\n\u0009\u0009\u0009\u0009\u0009done( -1, e );\n\u0009\u0009\u0009\u0009// Simply rethrow otherwise\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009throw e;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009// Callback for when everything is done\n\u0009\u0009function done( status, nativeStatusText, responses, headers ) {\n\u0009\u0009\u0009var isSuccess, success, error, response, modified,\n\u0009\u0009\u0009\u0009statusText = nativeStatusText;\n\n\u0009\u0009\u0009// Called once\n\u0009\u0009\u0009if ( state === 2 ) {\n\u0009\u0009\u0009\u0009return;\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// State is \"done\" now\n\u0009\u0009\u0009state = 2;\n\n\u0009\u0009\u0009// Clear timeout if it exists\n\u0009\u0009\u0009if ( timeoutTimer ) {\n\u0009\u0009\u0009\u0009clearTimeout( timeoutTimer );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Dereference transport for early garbage collection\n\u0009\u0009\u0009// (no matter how long the jqXHR object will be used)\n\u0009\u0009\u0009transport = undefined;\n\n\u0009\u0009\u0009// Cache response headers\n\u0009\u0009\u0009responseHeadersString = headers || \"\";\n\n\u0009\u0009\u0009// Set readyState\n\u0009\u0009\u0009jqXHR.readyState = status > 0 ? 4 : 0;\n\n\u0009\u0009\u0009// Determine if successful\n\u0009\u0009\u0009isSuccess = status >= 200 && status < 300 || status === 304;\n\n\u0009\u0009\u0009// Get response data\n\u0009\u0009\u0009if ( responses ) {\n\u0009\u0009\u0009\u0009response = ajaxHandleResponses( s, jqXHR, responses );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Convert no matter what (that way responseXXX fields are always set)\n\u0009\u0009\u0009response = ajaxConvert( s, response, jqXHR, isSuccess );\n\n\u0009\u0009\u0009// If successful, handle type chaining\n\u0009\u0009\u0009if ( isSuccess ) {\n\n\u0009\u0009\u0009\u0009// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.\n\u0009\u0009\u0009\u0009if ( s.ifModified ) {\n\u0009\u0009\u0009\u0009\u0009modified = jqXHR.getResponseHeader(\"Last-Modified\");\n\u0009\u0009\u0009\u0009\u0009if ( modified ) {\n\u0009\u0009\u0009\u0009\u0009\u0009jQuery.lastModified[ cacheURL ] = modified;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009modified = jqXHR.getResponseHeader(\"etag\");\n\u0009\u0009\u0009\u0009\u0009if ( modified ) {\n\u0009\u0009\u0009\u0009\u0009\u0009jQuery.etag[ cacheURL ] = modified;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// if no content\n\u0009\u0009\u0009\u0009if ( status === 204 || s.type === \"HEAD\" ) {\n\u0009\u0009\u0009\u0009\u0009statusText = \"nocontent\";\n\n\u0009\u0009\u0009\u0009// if not modified\n\u0009\u0009\u0009\u0009} else if ( status === 304 ) {\n\u0009\u0009\u0009\u0009\u0009statusText = \"notmodified\";\n\n\u0009\u0009\u0009\u0009// If we have data, let's convert it\n\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009statusText = response.state;\n\u0009\u0009\u0009\u0009\u0009success = response.data;\n\u0009\u0009\u0009\u0009\u0009error = response.error;\n\u0009\u0009\u0009\u0009\u0009isSuccess = !error;\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009// We extract error from statusText\n\u0009\u0009\u0009\u0009// then normalize statusText and status for non-aborts\n\u0009\u0009\u0009\u0009error = statusText;\n\u0009\u0009\u0009\u0009if ( status || !statusText ) {\n\u0009\u0009\u0009\u0009\u0009statusText = \"error\";\n\u0009\u0009\u0009\u0009\u0009if ( status < 0 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009status = 0;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Set data for the fake xhr object\n\u0009\u0009\u0009jqXHR.status = status;\n\u0009\u0009\u0009jqXHR.statusText = ( nativeStatusText || statusText ) + \"\";\n\n\u0009\u0009\u0009// Success/Error\n\u0009\u0009\u0009if ( isSuccess ) {\n\u0009\u0009\u0009\u0009deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Status-dependent callbacks\n\u0009\u0009\u0009jqXHR.statusCode( statusCode );\n\u0009\u0009\u0009statusCode = undefined;\n\n\u0009\u0009\u0009if ( fireGlobals ) {\n\u0009\u0009\u0009\u0009globalEventContext.trigger( isSuccess ? \"ajaxSuccess\" : \"ajaxError\",\n\u0009\u0009\u0009\u0009\u0009[ jqXHR, s, isSuccess ? success : error ] );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Complete\n\u0009\u0009\u0009completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );\n\n\u0009\u0009\u0009if ( fireGlobals ) {\n\u0009\u0009\u0009\u0009globalEventContext.trigger( \"ajaxComplete\", [ jqXHR, s ] );\n\u0009\u0009\u0009\u0009// Handle the global AJAX counter\n\u0009\u0009\u0009\u0009if ( !( --jQuery.active ) ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.event.trigger(\"ajaxStop\");\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009}\n\n\u0009\u0009return jqXHR;\n\u0009},\n\n\u0009getJSON: function( url, data, callback ) {\n\u0009\u0009return jQuery.get( url, data, callback, \"json\" );\n\u0009},\n\n\u0009getScript: function( url, callback ) {\n\u0009\u0009return jQuery.get( url, undefined, callback, \"script\" );\n\u0009}\n});\n\njQuery.each( [ \"get\", \"post\" ], function( i, method ) {\n\u0009jQuery[ method ] = function( url, data, callback, type ) {\n\u0009\u0009// shift arguments if data argument was omitted\n\u0009\u0009if ( jQuery.isFunction( data ) ) {\n\u0009\u0009\u0009type = type || callback;\n\u0009\u0009\u0009callback = data;\n\u0009\u0009\u0009data = undefined;\n\u0009\u0009}\n\n\u0009\u0009return jQuery.ajax({\n\u0009\u0009\u0009url: url,\n\u0009\u0009\u0009type: method,\n\u0009\u0009\u0009dataType: type,\n\u0009\u0009\u0009data: data,\n\u0009\u0009\u0009success: callback\n\u0009\u0009});\n\u0009};\n});\n\n\njQuery._evalUrl = function( url ) {\n\u0009return jQuery.ajax({\n\u0009\u0009url: url,\n\u0009\u0009type: \"GET\",\n\u0009\u0009dataType: \"script\",\n\u0009\u0009async: false,\n\u0009\u0009global: false,\n\u0009\u0009\"throws\": true\n\u0009});\n};\n\n\njQuery.fn.extend({\n\u0009wrapAll: function( html ) {\n\u0009\u0009if ( jQuery.isFunction( html ) ) {\n\u0009\u0009\u0009return this.each(function(i) {\n\u0009\u0009\u0009\u0009jQuery(this).wrapAll( html.call(this, i) );\n\u0009\u0009\u0009});\n\u0009\u0009}\n\n\u0009\u0009if ( this[0] ) {\n\u0009\u0009\u0009// The elements to wrap the target around\n\u0009\u0009\u0009var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);\n\n\u0009\u0009\u0009if ( this[0].parentNode ) {\n\u0009\u0009\u0009\u0009wrap.insertBefore( this[0] );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009wrap.map(function() {\n\u0009\u0009\u0009\u0009var elem = this;\n\n\u0009\u0009\u0009\u0009while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {\n\u0009\u0009\u0009\u0009\u0009elem = elem.firstChild;\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009return elem;\n\u0009\u0009\u0009}).append( this );\n\u0009\u0009}\n\n\u0009\u0009return this;\n\u0009},\n\n\u0009wrapInner: function( html ) {\n\u0009\u0009if ( jQuery.isFunction( html ) ) {\n\u0009\u0009\u0009return this.each(function(i) {\n\u0009\u0009\u0009\u0009jQuery(this).wrapInner( html.call(this, i) );\n\u0009\u0009\u0009});\n\u0009\u0009}\n\n\u0009\u0009return this.each(function() {\n\u0009\u0009\u0009var self = jQuery( this ),\n\u0009\u0009\u0009\u0009contents = self.contents();\n\n\u0009\u0009\u0009if ( contents.length ) {\n\u0009\u0009\u0009\u0009contents.wrapAll( html );\n\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009self.append( html );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\u0009},\n\n\u0009wrap: function( html ) {\n\u0009\u0009var isFunction = jQuery.isFunction( html );\n\n\u0009\u0009return this.each(function(i) {\n\u0009\u0009\u0009jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );\n\u0009\u0009});\n\u0009},\n\n\u0009unwrap: function() {\n\u0009\u0009return this.parent().each(function() {\n\u0009\u0009\u0009if ( !jQuery.nodeName( this, \"body\" ) ) {\n\u0009\u0009\u0009\u0009jQuery( this ).replaceWith( this.childNodes );\n\u0009\u0009\u0009}\n\u0009\u0009}).end();\n\u0009}\n});\n\n\njQuery.expr.filters.hidden = function( elem ) {\n\u0009// Support: Opera <= 12.12\n\u0009// Opera reports offsetWidths and offsetHeights less than zero on some elements\n\u0009return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 ||\n\u0009\u0009(!support.reliableHiddenOffsets() &&\n\u0009\u0009\u0009((elem.style && elem.style.display) || jQuery.css( elem, \"display\" )) === \"none\");\n};\n\njQuery.expr.filters.visible = function( elem ) {\n\u0009return !jQuery.expr.filters.hidden( elem );\n};\n\n\n\n\nvar r20 = /%20/g,\n\u0009rbracket = /\\[\\]$/,\n\u0009rCRLF = /\\r?\\n/g,\n\u0009rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,\n\u0009rsubmittable = /^(?:input|select|textarea|keygen)/i;\n\nfunction buildParams( prefix, obj, traditional, add ) {\n\u0009var name;\n\n\u0009if ( jQuery.isArray( obj ) ) {\n\u0009\u0009// Serialize array item.\n\u0009\u0009jQuery.each( obj, function( i, v ) {\n\u0009\u0009\u0009if ( traditional || rbracket.test( prefix ) ) {\n\u0009\u0009\u0009\u0009// Treat each array item as a scalar.\n\u0009\u0009\u0009\u0009add( prefix, v );\n\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009// Item is non-scalar (array or object), encode its numeric index.\n\u0009\u0009\u0009\u0009buildParams( prefix + \"[\" + ( typeof v === \"object\" ? i : \"\" ) + \"]\", v, traditional, add );\n\u0009\u0009\u0009}\n\u0009\u0009});\n\n\u0009} else if ( !traditional && jQuery.type( obj ) === \"object\" ) {\n\u0009\u0009// Serialize object item.\n\u0009\u0009for ( name in obj ) {\n\u0009\u0009\u0009buildParams( prefix + \"[\" + name + \"]\", obj[ name ], traditional, add );\n\u0009\u0009}\n\n\u0009} else {\n\u0009\u0009// Serialize scalar item.\n\u0009\u0009add( prefix, obj );\n\u0009}\n}\n\n// Serialize an array of form elements or a set of\n// key/values into a query string\njQuery.param = function( a, traditional ) {\n\u0009var prefix,\n\u0009\u0009s = [],\n\u0009\u0009add = function( key, value ) {\n\u0009\u0009\u0009// If value is a function, invoke it and return its value\n\u0009\u0009\u0009value = jQuery.isFunction( value ) ? value() : ( value == null ? \"\" : value );\n\u0009\u0009\u0009s[ s.length ] = encodeURIComponent( key ) + \"=\" + encodeURIComponent( value );\n\u0009\u0009};\n\n\u0009// Set traditional to true for jQuery <= 1.3.2 behavior.\n\u0009if ( traditional === undefined ) {\n\u0009\u0009traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;\n\u0009}\n\n\u0009// If an array was passed in, assume that it is an array of form elements.\n\u0009if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {\n\u0009\u0009// Serialize the form elements\n\u0009\u0009jQuery.each( a, function() {\n\u0009\u0009\u0009add( this.name, this.value );\n\u0009\u0009});\n\n\u0009} else {\n\u0009\u0009// If traditional, encode the \"old\" way (the way 1.3.2 or older\n\u0009\u0009// did it), otherwise encode params recursively.\n\u0009\u0009for ( prefix in a ) {\n\u0009\u0009\u0009buildParams( prefix, a[ prefix ], traditional, add );\n\u0009\u0009}\n\u0009}\n\n\u0009// Return the resulting serialization\n\u0009return s.join( \"&\" ).replace( r20, \"+\" );\n};\n\njQuery.fn.extend({\n\u0009serialize: function() {\n\u0009\u0009return jQuery.param( this.serializeArray() );\n\u0009},\n\u0009serializeArray: function() {\n\u0009\u0009return this.map(function() {\n\u0009\u0009\u0009// Can add propHook for \"elements\" to filter or add form elements\n\u0009\u0009\u0009var elements = jQuery.prop( this, \"elements\" );\n\u0009\u0009\u0009return elements ? jQuery.makeArray( elements ) : this;\n\u0009\u0009})\n\u0009\u0009.filter(function() {\n\u0009\u0009\u0009var type = this.type;\n\u0009\u0009\u0009// Use .is(\":disabled\") so that fieldset[disabled] works\n\u0009\u0009\u0009return this.name && !jQuery( this ).is( \":disabled\" ) &&\n\u0009\u0009\u0009\u0009rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&\n\u0009\u0009\u0009\u0009( this.checked || !rcheckableType.test( type ) );\n\u0009\u0009})\n\u0009\u0009.map(function( i, elem ) {\n\u0009\u0009\u0009var val = jQuery( this ).val();\n\n\u0009\u0009\u0009return val == null ?\n\u0009\u0009\u0009\u0009null :\n\u0009\u0009\u0009\u0009jQuery.isArray( val ) ?\n\u0009\u0009\u0009\u0009\u0009jQuery.map( val, function( val ) {\n\u0009\u0009\u0009\u0009\u0009\u0009return { name: elem.name, value: val.replace( rCRLF, \"\\r\\n\" ) };\n\u0009\u0009\u0009\u0009\u0009}) :\n\u0009\u0009\u0009\u0009\u0009{ name: elem.name, value: val.replace( rCRLF, \"\\r\\n\" ) };\n\u0009\u0009}).get();\n\u0009}\n});\n\n\n// Create the request object\n// (This is still attached to ajaxSettings for backward compatibility)\njQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?\n\u0009// Support: IE6+\n\u0009function() {\n\n\u0009\u0009// XHR cannot access local files, always use ActiveX for that case\n\u0009\u0009return !this.isLocal &&\n\n\u0009\u0009\u0009// Support: IE7-8\n\u0009\u0009\u0009// oldIE XHR does not support non-RFC2616 methods (#13240)\n\u0009\u0009\u0009// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx\n\u0009\u0009\u0009// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9\n\u0009\u0009\u0009// Although this check for six methods instead of eight\n\u0009\u0009\u0009// since IE also does not support \"trace\" and \"connect\"\n\u0009\u0009\u0009/^(get|post|head|put|delete|options)$/i.test( this.type ) &&\n\n\u0009\u0009\u0009createStandardXHR() || createActiveXHR();\n\u0009} :\n\u0009// For all other browsers, use the standard XMLHttpRequest object\n\u0009createStandardXHR;\n\nvar xhrId = 0,\n\u0009xhrCallbacks = {},\n\u0009xhrSupported = jQuery.ajaxSettings.xhr();\n\n// Support: IE<10\n// Open requests must be manually aborted on unload (#5280)\n// See https://support.microsoft.com/kb/2856746 for more info\nif ( window.attachEvent ) {\n\u0009window.attachEvent( \"onunload\", function() {\n\u0009\u0009for ( var key in xhrCallbacks ) {\n\u0009\u0009\u0009xhrCallbacks[ key ]( undefined, true );\n\u0009\u0009}\n\u0009});\n}\n\n// Determine support properties\nsupport.cors = !!xhrSupported && ( \"withCredentials\" in xhrSupported );\nxhrSupported = support.ajax = !!xhrSupported;\n\n// Create transport if the browser can provide an xhr\nif ( xhrSupported ) {\n\n\u0009jQuery.ajaxTransport(function( options ) {\n\u0009\u0009// Cross domain only allowed if supported through XMLHttpRequest\n\u0009\u0009if ( !options.crossDomain || support.cors ) {\n\n\u0009\u0009\u0009var callback;\n\n\u0009\u0009\u0009return {\n\u0009\u0009\u0009\u0009send: function( headers, complete ) {\n\u0009\u0009\u0009\u0009\u0009var i,\n\u0009\u0009\u0009\u0009\u0009\u0009xhr = options.xhr(),\n\u0009\u0009\u0009\u0009\u0009\u0009id = ++xhrId;\n\n\u0009\u0009\u0009\u0009\u0009// Open the socket\n\u0009\u0009\u0009\u0009\u0009xhr.open( options.type, options.url, options.async, options.username, options.password );\n\n\u0009\u0009\u0009\u0009\u0009// Apply custom fields if provided\n\u0009\u0009\u0009\u0009\u0009if ( options.xhrFields ) {\n\u0009\u0009\u0009\u0009\u0009\u0009for ( i in options.xhrFields ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009xhr[ i ] = options.xhrFields[ i ];\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Override mime type if needed\n\u0009\u0009\u0009\u0009\u0009if ( options.mimeType && xhr.overrideMimeType ) {\n\u0009\u0009\u0009\u0009\u0009\u0009xhr.overrideMimeType( options.mimeType );\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// X-Requested-With header\n\u0009\u0009\u0009\u0009\u0009// For cross-domain requests, seeing as conditions for a preflight are\n\u0009\u0009\u0009\u0009\u0009// akin to a jigsaw puzzle, we simply never set it to be sure.\n\u0009\u0009\u0009\u0009\u0009// (it can always be set on a per-request basis or even using ajaxSetup)\n\u0009\u0009\u0009\u0009\u0009// For same-domain requests, won't change header if already provided.\n\u0009\u0009\u0009\u0009\u0009if ( !options.crossDomain && !headers[\"X-Requested-With\"] ) {\n\u0009\u0009\u0009\u0009\u0009\u0009headers[\"X-Requested-With\"] = \"XMLHttpRequest\";\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Set headers\n\u0009\u0009\u0009\u0009\u0009for ( i in headers ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// Support: IE<9\n\u0009\u0009\u0009\u0009\u0009\u0009// IE's ActiveXObject throws a 'Type Mismatch' exception when setting\n\u0009\u0009\u0009\u0009\u0009\u0009// request header to a null-value.\n\u0009\u0009\u0009\u0009\u0009\u0009//\n\u0009\u0009\u0009\u0009\u0009\u0009// To keep consistent with other XHR implementations, cast the value\n\u0009\u0009\u0009\u0009\u0009\u0009// to string and ignore `undefined`.\n\u0009\u0009\u0009\u0009\u0009\u0009if ( headers[ i ] !== undefined ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009xhr.setRequestHeader( i, headers[ i ] + \"\" );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009// Do send the request\n\u0009\u0009\u0009\u0009\u0009// This may raise an exception which is actually\n\u0009\u0009\u0009\u0009\u0009// handled in jQuery.ajax (so no try/catch here)\n\u0009\u0009\u0009\u0009\u0009xhr.send( ( options.hasContent && options.data ) || null );\n\n\u0009\u0009\u0009\u0009\u0009// Listener\n\u0009\u0009\u0009\u0009\u0009callback = function( _, isAbort ) {\n\u0009\u0009\u0009\u0009\u0009\u0009var status, statusText, responses;\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Was never called and is aborted or complete\n\u0009\u0009\u0009\u0009\u0009\u0009if ( callback && ( isAbort || xhr.readyState === 4 ) ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Clean up\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009delete xhrCallbacks[ id ];\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009callback = undefined;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009xhr.onreadystatechange = jQuery.noop;\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Abort manually if needed\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( isAbort ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( xhr.readyState !== 4 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009xhr.abort();\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009responses = {};\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009status = xhr.status;\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Support: IE<10\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Accessing binary-data responseText throws an exception\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// (#11426)\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( typeof xhr.responseText === \"string\" ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009responses.text = xhr.responseText;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Firefox throws an exception when accessing\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// statusText for faulty cross-domain requests\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009try {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009statusText = xhr.statusText;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009} catch( e ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// We normalize with Webkit giving an empty statusText\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009statusText = \"\";\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// Filter status for non standard behaviors\n\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// If the request is local and we have data: assume a success\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// (success with no data won't get notified, that's the best we\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// can do given current implementations)\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009if ( !status && options.isLocal && !options.crossDomain ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009status = responses.text ? 200 : 404;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009// IE - #1450: sometimes returns 1223 when it should be 204\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009} else if ( status === 1223 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009status = 204;\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Call complete if needed\n\u0009\u0009\u0009\u0009\u0009\u0009if ( responses ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009complete( status, statusText, responses, xhr.getAllResponseHeaders() );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009};\n\n\u0009\u0009\u0009\u0009\u0009if ( !options.async ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// if we're in sync mode we fire the callback\n\u0009\u0009\u0009\u0009\u0009\u0009callback();\n\u0009\u0009\u0009\u0009\u0009} else if ( xhr.readyState === 4 ) {\n\u0009\u0009\u0009\u0009\u0009\u0009// (IE6 & IE7) if it's in cache and has been\n\u0009\u0009\u0009\u0009\u0009\u0009// retrieved directly we need to fire the callback\n\u0009\u0009\u0009\u0009\u0009\u0009setTimeout( callback );\n\u0009\u0009\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009\u0009\u0009// Add to the list of active xhr callbacks\n\u0009\u0009\u0009\u0009\u0009\u0009xhr.onreadystatechange = xhrCallbacks[ id ] = callback;\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009},\n\n\u0009\u0009\u0009\u0009abort: function() {\n\u0009\u0009\u0009\u0009\u0009if ( callback ) {\n\u0009\u0009\u0009\u0009\u0009\u0009callback( undefined, true );\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009};\n\u0009\u0009}\n\u0009});\n}\n\n// Functions to create xhrs\nfunction createStandardXHR() {\n\u0009try {\n\u0009\u0009return new window.XMLHttpRequest();\n\u0009} catch( e ) {}\n}\n\nfunction createActiveXHR() {\n\u0009try {\n\u0009\u0009return new window.ActiveXObject( \"Microsoft.XMLHTTP\" );\n\u0009} catch( e ) {}\n}\n\n\n\n\n// Install script dataType\njQuery.ajaxSetup({\n\u0009accepts: {\n\u0009\u0009script: \"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript\"\n\u0009},\n\u0009contents: {\n\u0009\u0009script: /(?:java|ecma)script/\n\u0009},\n\u0009converters: {\n\u0009\u0009\"text script\": function( text ) {\n\u0009\u0009\u0009jQuery.globalEval( text );\n\u0009\u0009\u0009return text;\n\u0009\u0009}\n\u0009}\n});\n\n// Handle cache's special case and global\njQuery.ajaxPrefilter( \"script\", function( s ) {\n\u0009if ( s.cache === undefined ) {\n\u0009\u0009s.cache = false;\n\u0009}\n\u0009if ( s.crossDomain ) {\n\u0009\u0009s.type = \"GET\";\n\u0009\u0009s.global = false;\n\u0009}\n});\n\n// Bind script tag hack transport\njQuery.ajaxTransport( \"script\", function(s) {\n\n\u0009// This transport only deals with cross domain requests\n\u0009if ( s.crossDomain ) {\n\n\u0009\u0009var script,\n\u0009\u0009\u0009head = document.head || jQuery(\"head\")[0] || document.documentElement;\n\n\u0009\u0009return {\n\n\u0009\u0009\u0009send: function( _, callback ) {\n\n\u0009\u0009\u0009\u0009script = document.createElement(\"script\");\n\n\u0009\u0009\u0009\u0009script.async = true;\n\n\u0009\u0009\u0009\u0009if ( s.scriptCharset ) {\n\u0009\u0009\u0009\u0009\u0009script.charset = s.scriptCharset;\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009script.src = s.url;\n\n\u0009\u0009\u0009\u0009// Attach handlers for all browsers\n\u0009\u0009\u0009\u0009script.onload = script.onreadystatechange = function( _, isAbort ) {\n\n\u0009\u0009\u0009\u0009\u0009if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Handle memory leak in IE\n\u0009\u0009\u0009\u0009\u0009\u0009script.onload = script.onreadystatechange = null;\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Remove the script\n\u0009\u0009\u0009\u0009\u0009\u0009if ( script.parentNode ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009script.parentNode.removeChild( script );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Dereference the script\n\u0009\u0009\u0009\u0009\u0009\u0009script = null;\n\n\u0009\u0009\u0009\u0009\u0009\u0009// Callback if not abort\n\u0009\u0009\u0009\u0009\u0009\u0009if ( !isAbort ) {\n\u0009\u0009\u0009\u0009\u0009\u0009\u0009callback( 200, \"success\" );\n\u0009\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009\u0009};\n\n\u0009\u0009\u0009\u0009// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending\n\u0009\u0009\u0009\u0009// Use native DOM manipulation to avoid our domManip AJAX trickery\n\u0009\u0009\u0009\u0009head.insertBefore( script, head.firstChild );\n\u0009\u0009\u0009},\n\n\u0009\u0009\u0009abort: function() {\n\u0009\u0009\u0009\u0009if ( script ) {\n\u0009\u0009\u0009\u0009\u0009script.onload( undefined, true );\n\u0009\u0009\u0009\u0009}\n\u0009\u0009\u0009}\n\u0009\u0009};\n\u0009}\n});\n\n\n\n\nvar oldCallbacks = [],\n\u0009rjsonp = /(=)\\?(?=&|$)|\\?\\?/;\n\n// Default jsonp settings\njQuery.ajaxSetup({\n\u0009jsonp: \"callback\",\n\u0009jsonpCallback: function() {\n\u0009\u0009var callback = oldCallbacks.pop() || ( jQuery.expando + \"_\" + ( nonce++ ) );\n\u0009\u0009this[ callback ] = true;\n\u0009\u0009return callback;\n\u0009}\n});\n\n// Detect, normalize options and install callbacks for jsonp requests\njQuery.ajaxPrefilter( \"json jsonp\", function( s, originalSettings, jqXHR ) {\n\n\u0009var callbackName, overwritten, responseContainer,\n\u0009\u0009jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?\n\u0009\u0009\u0009\"url\" :\n\u0009\u0009\u0009typeof s.data === \"string\" && !( s.contentType || \"\" ).indexOf(\"application/x-www-form-urlencoded\") && rjsonp.test( s.data ) && \"data\"\n\u0009\u0009);\n\n\u0009// Handle iff the expected data type is \"jsonp\" or we have a parameter to set\n\u0009if ( jsonProp || s.dataTypes[ 0 ] === \"jsonp\" ) {\n\n\u0009\u0009// Get callback name, remembering preexisting value associated with it\n\u0009\u0009callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?\n\u0009\u0009\u0009s.jsonpCallback() :\n\u0009\u0009\u0009s.jsonpCallback;\n\n\u0009\u0009// Insert callback into url or form data\n\u0009\u0009if ( jsonProp ) {\n\u0009\u0009\u0009s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, \"$1\" + callbackName );\n\u0009\u0009} else if ( s.jsonp !== false ) {\n\u0009\u0009\u0009s.url += ( rquery.test( s.url ) ? \"&\" : \"?\" ) + s.jsonp + \"=\" + callbackName;\n\u0009\u0009}\n\n\u0009\u0009// Use data converter to retrieve json after script execution\n\u0009\u0009s.converters[\"script json\"] = function() {\n\u0009\u0009\u0009if ( !responseContainer ) {\n\u0009\u0009\u0009\u0009jQuery.error( callbackName + \" was not called\" );\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return responseContainer[ 0 ];\n\u0009\u0009};\n\n\u0009\u0009// force json dataType\n\u0009\u0009s.dataTypes[ 0 ] = \"json\";\n\n\u0009\u0009// Install callback\n\u0009\u0009overwritten = window[ callbackName ];\n\u0009\u0009window[ callbackName ] = function() {\n\u0009\u0009\u0009responseContainer = arguments;\n\u0009\u0009};\n\n\u0009\u0009// Clean-up function (fires after converters)\n\u0009\u0009jqXHR.always(function() {\n\u0009\u0009\u0009// Restore preexisting value\n\u0009\u0009\u0009window[ callbackName ] = overwritten;\n\n\u0009\u0009\u0009// Save back as free\n\u0009\u0009\u0009if ( s[ callbackName ] ) {\n\u0009\u0009\u0009\u0009// make sure that re-using the options doesn't screw things around\n\u0009\u0009\u0009\u0009s.jsonpCallback = originalSettings.jsonpCallback;\n\n\u0009\u0009\u0009\u0009// save the callback name for future use\n\u0009\u0009\u0009\u0009oldCallbacks.push( callbackName );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Call if it was a function and we have a response\n\u0009\u0009\u0009if ( responseContainer && jQuery.isFunction( overwritten ) ) {\n\u0009\u0009\u0009\u0009overwritten( responseContainer[ 0 ] );\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009responseContainer = overwritten = undefined;\n\u0009\u0009});\n\n\u0009\u0009// Delegate to script\n\u0009\u0009return \"script\";\n\u0009}\n});\n\n\n\n\n// data: string of html\n// context (optional): If specified, the fragment will be created in this context, defaults to document\n// keepScripts (optional): If true, will include scripts passed in the html string\njQuery.parseHTML = function( data, context, keepScripts ) {\n\u0009if ( !data || typeof data !== \"string\" ) {\n\u0009\u0009return null;\n\u0009}\n\u0009if ( typeof context === \"boolean\" ) {\n\u0009\u0009keepScripts = context;\n\u0009\u0009context = false;\n\u0009}\n\u0009context = context || document;\n\n\u0009var parsed = rsingleTag.exec( data ),\n\u0009\u0009scripts = !keepScripts && [];\n\n\u0009// Single tag\n\u0009if ( parsed ) {\n\u0009\u0009return [ context.createElement( parsed[1] ) ];\n\u0009}\n\n\u0009parsed = jQuery.buildFragment( [ data ], context, scripts );\n\n\u0009if ( scripts && scripts.length ) {\n\u0009\u0009jQuery( scripts ).remove();\n\u0009}\n\n\u0009return jQuery.merge( [], parsed.childNodes );\n};\n\n\n// Keep a copy of the old load method\nvar _load = jQuery.fn.load;\n\n/**\n * Load a url into a page\n */\njQuery.fn.load = function( url, params, callback ) {\n\u0009if ( typeof url !== \"string\" && _load ) {\n\u0009\u0009return _load.apply( this, arguments );\n\u0009}\n\n\u0009var selector, response, type,\n\u0009\u0009self = this,\n\u0009\u0009off = url.indexOf(\" \");\n\n\u0009if ( off >= 0 ) {\n\u0009\u0009selector = jQuery.trim( url.slice( off, url.length ) );\n\u0009\u0009url = url.slice( 0, off );\n\u0009}\n\n\u0009// If it's a function\n\u0009if ( jQuery.isFunction( params ) ) {\n\n\u0009\u0009// We assume that it's the callback\n\u0009\u0009callback = params;\n\u0009\u0009params = undefined;\n\n\u0009// Otherwise, build a param string\n\u0009} else if ( params && typeof params === \"object\" ) {\n\u0009\u0009type = \"POST\";\n\u0009}\n\n\u0009// If we have elements to modify, make the request\n\u0009if ( self.length > 0 ) {\n\u0009\u0009jQuery.ajax({\n\u0009\u0009\u0009url: url,\n\n\u0009\u0009\u0009// if \"type\" variable is undefined, then \"GET\" method will be used\n\u0009\u0009\u0009type: type,\n\u0009\u0009\u0009dataType: \"html\",\n\u0009\u0009\u0009data: params\n\u0009\u0009}).done(function( responseText ) {\n\n\u0009\u0009\u0009// Save response for use in complete callback\n\u0009\u0009\u0009response = arguments;\n\n\u0009\u0009\u0009self.html( selector ?\n\n\u0009\u0009\u0009\u0009// If a selector was specified, locate the right elements in a dummy div\n\u0009\u0009\u0009\u0009// Exclude scripts to avoid IE 'Permission Denied' errors\n\u0009\u0009\u0009\u0009jQuery(\"<div>\").append( jQuery.parseHTML( responseText ) ).find( selector ) :\n\n\u0009\u0009\u0009\u0009// Otherwise use the full result\n\u0009\u0009\u0009\u0009responseText );\n\n\u0009\u0009}).complete( callback && function( jqXHR, status ) {\n\u0009\u0009\u0009self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );\n\u0009\u0009});\n\u0009}\n\n\u0009return this;\n};\n\n\n\n\n// Attach a bunch of functions for handling common AJAX events\njQuery.each( [ \"ajaxStart\", \"ajaxStop\", \"ajaxComplete\", \"ajaxError\", \"ajaxSuccess\", \"ajaxSend\" ], function( i, type ) {\n\u0009jQuery.fn[ type ] = function( fn ) {\n\u0009\u0009return this.on( type, fn );\n\u0009};\n});\n\n\n\n\njQuery.expr.filters.animated = function( elem ) {\n\u0009return jQuery.grep(jQuery.timers, function( fn ) {\n\u0009\u0009return elem === fn.elem;\n\u0009}).length;\n};\n\n\n\n\n\nvar docElem = window.document.documentElement;\n\n/**\n * Gets a window from an element\n */\nfunction getWindow( elem ) {\n\u0009return jQuery.isWindow( elem ) ?\n\u0009\u0009elem :\n\u0009\u0009elem.nodeType === 9 ?\n\u0009\u0009\u0009elem.defaultView || elem.parentWindow :\n\u0009\u0009\u0009false;\n}\n\njQuery.offset = {\n\u0009setOffset: function( elem, options, i ) {\n\u0009\u0009var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,\n\u0009\u0009\u0009position = jQuery.css( elem, \"position\" ),\n\u0009\u0009\u0009curElem = jQuery( elem ),\n\u0009\u0009\u0009props = {};\n\n\u0009\u0009// set position first, in-case top/left are set even on static elem\n\u0009\u0009if ( position === \"static\" ) {\n\u0009\u0009\u0009elem.style.position = \"relative\";\n\u0009\u0009}\n\n\u0009\u0009curOffset = curElem.offset();\n\u0009\u0009curCSSTop = jQuery.css( elem, \"top\" );\n\u0009\u0009curCSSLeft = jQuery.css( elem, \"left\" );\n\u0009\u0009calculatePosition = ( position === \"absolute\" || position === \"fixed\" ) &&\n\u0009\u0009\u0009jQuery.inArray(\"auto\", [ curCSSTop, curCSSLeft ] ) > -1;\n\n\u0009\u0009// need to be able to calculate position if either top or left is auto and position is either absolute or fixed\n\u0009\u0009if ( calculatePosition ) {\n\u0009\u0009\u0009curPosition = curElem.position();\n\u0009\u0009\u0009curTop = curPosition.top;\n\u0009\u0009\u0009curLeft = curPosition.left;\n\u0009\u0009} else {\n\u0009\u0009\u0009curTop = parseFloat( curCSSTop ) || 0;\n\u0009\u0009\u0009curLeft = parseFloat( curCSSLeft ) || 0;\n\u0009\u0009}\n\n\u0009\u0009if ( jQuery.isFunction( options ) ) {\n\u0009\u0009\u0009options = options.call( elem, i, curOffset );\n\u0009\u0009}\n\n\u0009\u0009if ( options.top != null ) {\n\u0009\u0009\u0009props.top = ( options.top - curOffset.top ) + curTop;\n\u0009\u0009}\n\u0009\u0009if ( options.left != null ) {\n\u0009\u0009\u0009props.left = ( options.left - curOffset.left ) + curLeft;\n\u0009\u0009}\n\n\u0009\u0009if ( \"using\" in options ) {\n\u0009\u0009\u0009options.using.call( elem, props );\n\u0009\u0009} else {\n\u0009\u0009\u0009curElem.css( props );\n\u0009\u0009}\n\u0009}\n};\n\njQuery.fn.extend({\n\u0009offset: function( options ) {\n\u0009\u0009if ( arguments.length ) {\n\u0009\u0009\u0009return options === undefined ?\n\u0009\u0009\u0009\u0009this :\n\u0009\u0009\u0009\u0009this.each(function( i ) {\n\u0009\u0009\u0009\u0009\u0009jQuery.offset.setOffset( this, options, i );\n\u0009\u0009\u0009\u0009});\n\u0009\u0009}\n\n\u0009\u0009var docElem, win,\n\u0009\u0009\u0009box = { top: 0, left: 0 },\n\u0009\u0009\u0009elem = this[ 0 ],\n\u0009\u0009\u0009doc = elem && elem.ownerDocument;\n\n\u0009\u0009if ( !doc ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009docElem = doc.documentElement;\n\n\u0009\u0009// Make sure it's not a disconnected DOM node\n\u0009\u0009if ( !jQuery.contains( docElem, elem ) ) {\n\u0009\u0009\u0009return box;\n\u0009\u0009}\n\n\u0009\u0009// If we don't have gBCR, just use 0,0 rather than error\n\u0009\u0009// BlackBerry 5, iOS 3 (original iPhone)\n\u0009\u0009if ( typeof elem.getBoundingClientRect !== strundefined ) {\n\u0009\u0009\u0009box = elem.getBoundingClientRect();\n\u0009\u0009}\n\u0009\u0009win = getWindow( doc );\n\u0009\u0009return {\n\u0009\u0009\u0009top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),\n\u0009\u0009\u0009left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )\n\u0009\u0009};\n\u0009},\n\n\u0009position: function() {\n\u0009\u0009if ( !this[ 0 ] ) {\n\u0009\u0009\u0009return;\n\u0009\u0009}\n\n\u0009\u0009var offsetParent, offset,\n\u0009\u0009\u0009parentOffset = { top: 0, left: 0 },\n\u0009\u0009\u0009elem = this[ 0 ];\n\n\u0009\u0009// fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent\n\u0009\u0009if ( jQuery.css( elem, \"position\" ) === \"fixed\" ) {\n\u0009\u0009\u0009// we assume that getBoundingClientRect is available when computed position is fixed\n\u0009\u0009\u0009offset = elem.getBoundingClientRect();\n\u0009\u0009} else {\n\u0009\u0009\u0009// Get *real* offsetParent\n\u0009\u0009\u0009offsetParent = this.offsetParent();\n\n\u0009\u0009\u0009// Get correct offsets\n\u0009\u0009\u0009offset = this.offset();\n\u0009\u0009\u0009if ( !jQuery.nodeName( offsetParent[ 0 ], \"html\" ) ) {\n\u0009\u0009\u0009\u0009parentOffset = offsetParent.offset();\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009// Add offsetParent borders\n\u0009\u0009\u0009parentOffset.top  += jQuery.css( offsetParent[ 0 ], \"borderTopWidth\", true );\n\u0009\u0009\u0009parentOffset.left += jQuery.css( offsetParent[ 0 ], \"borderLeftWidth\", true );\n\u0009\u0009}\n\n\u0009\u0009// Subtract parent offsets and element margins\n\u0009\u0009// note: when an element has margin: auto the offsetLeft and marginLeft\n\u0009\u0009// are the same in Safari causing offset.left to incorrectly be 0\n\u0009\u0009return {\n\u0009\u0009\u0009top:  offset.top  - parentOffset.top - jQuery.css( elem, \"marginTop\", true ),\n\u0009\u0009\u0009left: offset.left - parentOffset.left - jQuery.css( elem, \"marginLeft\", true)\n\u0009\u0009};\n\u0009},\n\n\u0009offsetParent: function() {\n\u0009\u0009return this.map(function() {\n\u0009\u0009\u0009var offsetParent = this.offsetParent || docElem;\n\n\u0009\u0009\u0009while ( offsetParent && ( !jQuery.nodeName( offsetParent, \"html\" ) && jQuery.css( offsetParent, \"position\" ) === \"static\" ) ) {\n\u0009\u0009\u0009\u0009offsetParent = offsetParent.offsetParent;\n\u0009\u0009\u0009}\n\u0009\u0009\u0009return offsetParent || docElem;\n\u0009\u0009});\n\u0009}\n});\n\n// Create scrollLeft and scrollTop methods\njQuery.each( { scrollLeft: \"pageXOffset\", scrollTop: \"pageYOffset\" }, function( method, prop ) {\n\u0009var top = /Y/.test( prop );\n\n\u0009jQuery.fn[ method ] = function( val ) {\n\u0009\u0009return access( this, function( elem, method, val ) {\n\u0009\u0009\u0009var win = getWindow( elem );\n\n\u0009\u0009\u0009if ( val === undefined ) {\n\u0009\u0009\u0009\u0009return win ? (prop in win) ? win[ prop ] :\n\u0009\u0009\u0009\u0009\u0009win.document.documentElement[ method ] :\n\u0009\u0009\u0009\u0009\u0009elem[ method ];\n\u0009\u0009\u0009}\n\n\u0009\u0009\u0009if ( win ) {\n\u0009\u0009\u0009\u0009win.scrollTo(\n\u0009\u0009\u0009\u0009\u0009!top ? val : jQuery( win ).scrollLeft(),\n\u0009\u0009\u0009\u0009\u0009top ? val : jQuery( win ).scrollTop()\n\u0009\u0009\u0009\u0009);\n\n\u0009\u0009\u0009} else {\n\u0009\u0009\u0009\u0009elem[ method ] = val;\n\u0009\u0009\u0009}\n\u0009\u0009}, method, val, arguments.length, null );\n\u0009};\n});\n\n// Add the top/left cssHooks using jQuery.fn.position\n// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084\n// getComputedStyle returns percent when specified for top/left/bottom/right\n// rather than make the css module depend on the offset module, we just check for it here\njQuery.each( [ \"top\", \"left\" ], function( i, prop ) {\n\u0009jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,\n\u0009\u0009function( elem, computed ) {\n\u0009\u0009\u0009if ( computed ) {\n\u0009\u0009\u0009\u0009computed = curCSS( elem, prop );\n\u0009\u0009\u0009\u0009// if curCSS returns percentage, fallback to offset\n\u0009\u0009\u0009\u0009return rnumnonpx.test( computed ) ?\n\u0009\u0009\u0009\u0009\u0009jQuery( elem ).position()[ prop ] + \"px\" :\n\u0009\u0009\u0009\u0009\u0009computed;\n\u0009\u0009\u0009}\n\u0009\u0009}\n\u0009);\n});\n\n\n// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods\njQuery.each( { Height: \"height\", Width: \"width\" }, function( name, type ) {\n\u0009jQuery.each( { padding: \"inner\" + name, content: type, \"\": \"outer\" + name }, function( defaultExtra, funcName ) {\n\u0009\u0009// margin is only for outerHeight, outerWidth\n\u0009\u0009jQuery.fn[ funcName ] = function( margin, value ) {\n\u0009\u0009\u0009var chainable = arguments.length && ( defaultExtra || typeof margin !== \"boolean\" ),\n\u0009\u0009\u0009\u0009extra = defaultExtra || ( margin === true || value === true ? \"margin\" : \"border\" );\n\n\u0009\u0009\u0009return access( this, function( elem, type, value ) {\n\u0009\u0009\u0009\u0009var doc;\n\n\u0009\u0009\u0009\u0009if ( jQuery.isWindow( elem ) ) {\n\u0009\u0009\u0009\u0009\u0009// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there\n\u0009\u0009\u0009\u0009\u0009// isn't a whole lot we can do. See pull request at this URL for discussion:\n\u0009\u0009\u0009\u0009\u0009// https://github.com/jquery/jquery/pull/764\n\u0009\u0009\u0009\u0009\u0009return elem.document.documentElement[ \"client\" + name ];\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009// Get document width or height\n\u0009\u0009\u0009\u0009if ( elem.nodeType === 9 ) {\n\u0009\u0009\u0009\u0009\u0009doc = elem.documentElement;\n\n\u0009\u0009\u0009\u0009\u0009// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height], whichever is greatest\n\u0009\u0009\u0009\u0009\u0009// unfortunately, this causes bug #3838 in IE6/8 only, but there is currently no good, small way to fix it.\n\u0009\u0009\u0009\u0009\u0009return Math.max(\n\u0009\u0009\u0009\u0009\u0009\u0009elem.body[ \"scroll\" + name ], doc[ \"scroll\" + name ],\n\u0009\u0009\u0009\u0009\u0009\u0009elem.body[ \"offset\" + name ], doc[ \"offset\" + name ],\n\u0009\u0009\u0009\u0009\u0009\u0009doc[ \"client\" + name ]\n\u0009\u0009\u0009\u0009\u0009);\n\u0009\u0009\u0009\u0009}\n\n\u0009\u0009\u0009\u0009return value === undefined ?\n\u0009\u0009\u0009\u0009\u0009// Get width or height on the element, requesting but not forcing parseFloat\n\u0009\u0009\u0009\u0009\u0009jQuery.css( elem, type, extra ) :\n\n\u0009\u0009\u0009\u0009\u0009// Set width or height on the element\n\u0009\u0009\u0009\u0009\u0009jQuery.style( elem, type, value, extra );\n\u0009\u0009\u0009}, type, chainable ? margin : undefined, chainable, null );\n\u0009\u0009};\n\u0009});\n});\n\n\n// The number of elements contained in the matched element set\njQuery.fn.size = function() {\n\u0009return this.length;\n};\n\njQuery.fn.andSelf = jQuery.fn.addBack;\n\n\n\n\n// Register as a named AMD module, since jQuery can be concatenated with other\n// files that may use define, but not via a proper concatenation script that\n// understands anonymous AMD modules. A named AMD is safest and most robust\n// way to register. Lowercase jquery is used because AMD module names are\n// derived from file names, and jQuery is normally delivered in a lowercase\n// file name. Do this after creating the global so that if an AMD module wants\n// to call noConflict to hide this version of jQuery, it will work.\n\n// Note that for maximum portability, libraries that are not jQuery should\n// declare themselves as anonymous modules, and avoid setting a global if an\n// AMD loader is present. jQuery is a special case. For more information, see\n// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon\n\nif ( typeof define === \"function\" && define.amd ) {\n\u0009define( \"jquery\", [], function() {\n\u0009\u0009return jQuery;\n\u0009});\n}\n\n\n\n\nvar\n\u0009// Map over jQuery in case of overwrite\n\u0009_jQuery = window.jQuery,\n\n\u0009// Map over the $ in case of overwrite\n\u0009_$ = window.$;\n\njQuery.noConflict = function( deep ) {\n\u0009if ( window.$ === jQuery ) {\n\u0009\u0009window.$ = _$;\n\u0009}\n\n\u0009if ( deep && window.jQuery === jQuery ) {\n\u0009\u0009window.jQuery = _jQuery;\n\u0009}\n\n\u0009return jQuery;\n};\n\n// Expose jQuery and $ identifiers, even in\n// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)\n// and CommonJS for browser emulators (#13566)\nif ( typeof noGlobal === strundefined ) {\n\u0009window.jQuery = window.$ = jQuery;\n}\n\n\n\n\nreturn jQuery;\n\n}));\n" + scriptEnd;
    html += scriptStart + "/* turn.js 4.1.0 | Copyright (c) 2012 Emmanuel Garcia | turnjs.com | turnjs.com/license.txt */\n\n(function(f){function I(a,b,c){if(!c[0]||\"object\"==typeof c[0])return b.init.apply(a,c);if(b[c[0]])return b[c[0]].apply(a,Array.prototype.slice.call(c,1));throw p(c[0]+\" is not a method or property\");}function l(a,b,c,d){return{css:{position:\"absolute\",top:a,left:b,overflow:d||\"hidden\",zIndex:c||\"auto\"}}}function R(a,b,c,d,e){var h=1-e,f=h*h*h,g=e*e*e;return j(Math.round(f*a.x+3*e*h*h*b.x+3*e*e*h*c.x+g*d.x),Math.round(f*a.y+3*e*h*h*b.y+3*e*e*h*c.y+g*d.y))}function j(a,b){return{x:a,y:b}}function E(a,\nb,c){return y&&c?\" translate3d(\"+a+\"px,\"+b+\"px, 0px) \":\" translate(\"+a+\"px, \"+b+\"px) \"}function F(a){return\" rotate(\"+a+\"deg) \"}function n(a,b){return Object.prototype.hasOwnProperty.call(b,a)}function S(){for(var a=[\"Moz\",\"Webkit\",\"Khtml\",\"O\",\"ms\"],b=a.length,c=\"\";b--;)a[b]+\"Transform\"in document.body.style&&(c=\"-\"+a[b].toLowerCase()+\"-\");return c}function O(a,b,c,d,e){var h,f=[];if(\"-webkit-\"==v){for(h=0;h<e;h++)f.push(\"color-stop(\"+d[h][0]+\", \"+d[h][1]+\")\");a.css({\"background-image\":\"-webkit-gradient(linear, \"+\nb.x+\"% \"+b.y+\"%,\"+c.x+\"% \"+c.y+\"%, \"+f.join(\",\")+\" )\"})}else{var b={x:b.x/100*a.width(),y:b.y/100*a.height()},c={x:c.x/100*a.width(),y:c.y/100*a.height()},g=c.x-b.x;h=c.y-b.y;var i=Math.atan2(h,g),w=i-Math.PI/2,w=Math.abs(a.width()*Math.sin(w))+Math.abs(a.height()*Math.cos(w)),g=Math.sqrt(h*h+g*g),c=j(c.x<b.x?a.width():0,c.y<b.y?a.height():0),k=Math.tan(i);h=-1/k;k=(h*c.x-c.y-k*b.x+b.y)/(h-k);c=h*k-h*c.x+c.y;b=Math.sqrt(Math.pow(k-b.x,2)+Math.pow(c-b.y,2));for(h=0;h<e;h++)f.push(\" \"+d[h][1]+\" \"+100*\n(b+g*d[h][0])/w+\"%\");a.css({\"background-image\":v+\"linear-gradient(\"+-i+\"rad,\"+f.join(\",\")+\")\"})}}function s(a,b,c){a=f.Event(a);b.trigger(a,c);return a.isDefaultPrevented()?\"prevented\":a.isPropagationStopped()?\"stopped\":\"\"}function p(a){function b(a){this.name=\"TurnJsError\";this.message=a}b.prototype=Error();b.prototype.constructor=b;return new b(a)}function C(a){var b={top:0,left:0};do b.left+=a.offsetLeft,b.top+=a.offsetTop;while(a=a.offsetParent);return b}var y,T,v=\"\",J=Math.PI,K=J/2,t=\"ontouchstart\"in\nwindow,q=t?{down:\"touchstart\",move:\"touchmove\",up:\"touchend\",over:\"touchstart\",out:\"touchend\"}:{down:\"mousedown\",move:\"mousemove\",up:\"mouseup\",over:\"mouseover\",out:\"mouseout\"},o={backward:[\"bl\",\"tl\"],forward:[\"br\",\"tr\"],all:\"tl bl tr br l r\".split(\" \")},U=[\"single\",\"double\"],V=[\"ltr\",\"rtl\"],W={acceleration:!0,display:\"double\",duration:600,page:1,gradients:!0,turnCorners:\"bl,br\",when:null},X={cornerSize:100},g={init:function(a){y=\"WebKitCSSMatrix\"in window||\"MozPerspective\"in document.body.style;var b;\nT=(b=/AppleWebkit\\/([0-9\\.]+)/i.exec(navigator.userAgent))?534.3<parseFloat(b[1]):!0;v=S();var c;b=0;var d=this.data(),e=this.children(),a=f.extend({width:this.width(),height:this.height(),direction:this.attr(\"dir\")||this.css(\"direction\")||\"ltr\"},W,a);d.opts=a;d.pageObjs={};d.pages={};d.pageWrap={};d.pageZoom={};d.pagePlace={};d.pageMv=[];d.zoom=1;d.totalPages=a.pages||0;d.eventHandlers={touchStart:f.proxy(g._touchStart,this),touchMove:f.proxy(g._touchMove,this),touchEnd:f.proxy(g._touchEnd,this),\nstart:f.proxy(g._eventStart,this)};if(a.when)for(c in a.when)n(c,a.when)&&this.bind(c,a.when[c]);this.css({position:\"relative\",width:a.width,height:a.height});this.turn(\"display\",a.display);\"\"!==a.direction&&this.turn(\"direction\",a.direction);y&&(!t&&a.acceleration)&&this.transform(E(0,0,!0));for(c=0;c<e.length;c++)\"1\"!=f(e[c]).attr(\"ignore\")&&this.turn(\"addPage\",e[c],++b);f(this).bind(q.down,d.eventHandlers.touchStart).bind(\"end\",g._eventEnd).bind(\"pressed\",g._eventPressed).bind(\"released\",g._eventReleased).bind(\"flip\",\ng._flip);f(this).parent().bind(\"start\",d.eventHandlers.start);f(document).bind(q.move,d.eventHandlers.touchMove).bind(q.up,d.eventHandlers.touchEnd);this.turn(\"page\",a.page);d.done=!0;return this},addPage:function(a,b){var c,d=!1,e=this.data(),h=e.totalPages+1;if(e.destroying)return!1;if(c=/\\bp([0-9]+)\\b/.exec(f(a).attr(\"class\")))b=parseInt(c[1],10);if(b)if(b==h)d=!0;else{if(b>h)throw p('Page \"'+b+'\" cannot be inserted');}else b=h,d=!0;1<=b&&b<=h&&(c=\"double\"==e.display?b%2?\" odd\":\" even\":\"\",e.done&&\nthis.turn(\"stop\"),b in e.pageObjs&&g._movePages.call(this,b,1),d&&(e.totalPages=h),e.pageObjs[b]=f(a).css({\"float\":\"left\"}).addClass(\"page p\"+b+c),-1!=navigator.userAgent.indexOf(\"MSIE 9.0\")&&e.pageObjs[b].hasClass(\"hard\")&&e.pageObjs[b].removeClass(\"hard\"),g._addPage.call(this,b),g._removeFromDOM.call(this));return this},_addPage:function(a){var b=this.data(),c=b.pageObjs[a];if(c)if(g._necessPage.call(this,a)){if(!b.pageWrap[a]){b.pageWrap[a]=f(\"<div/>\",{\"class\":\"page-wrapper\",page:a,css:{position:\"absolute\",\noverflow:\"hidden\"}});this.append(b.pageWrap[a]);b.pagePlace[a]||(b.pagePlace[a]=a,b.pageObjs[a].appendTo(b.pageWrap[a]));var d=g._pageSize.call(this,a,!0);c.css({width:d.width,height:d.height});b.pageWrap[a].css(d)}b.pagePlace[a]==a&&g._makeFlip.call(this,a)}else b.pagePlace[a]=0,b.pageObjs[a]&&b.pageObjs[a].remove()},hasPage:function(a){return n(a,this.data().pageObjs)},center:function(a){var b=this.data(),c=f(this).turn(\"size\"),d=0;b.noCenter||(\"double\"==b.display&&(a=this.turn(\"view\",a||b.tpage||\nb.page),\"ltr\"==b.direction?a[0]?a[1]||(d+=c.width/4):d-=c.width/4:a[0]?a[1]||(d-=c.width/4):d+=c.width/4),f(this).css({marginLeft:d}));return this},destroy:function(){var a=this,b=this.data(),c=\"end first flip last pressed released start turning turned zooming missing\".split(\" \");if(\"prevented\"!=s(\"destroying\",this)){b.destroying=!0;f.each(c,function(b,c){a.unbind(c)});this.parent().unbind(\"start\",b.eventHandlers.start);for(f(document).unbind(q.move,b.eventHandlers.touchMove).unbind(q.up,b.eventHandlers.touchEnd);0!==\nb.totalPages;)this.turn(\"removePage\",b.totalPages);b.fparent&&b.fparent.remove();b.shadow&&b.shadow.remove();this.removeData();b=null;return this}},is:function(){return\"object\"==typeof this.data().pages},zoom:function(a){var b=this.data();if(\"number\"==typeof a){if(0.0010>a||100<a)throw p(a+\" is not a value for zoom\");if(\"prevented\"==s(\"zooming\",this,[a,b.zoom]))return this;var c=this.turn(\"size\"),d=this.turn(\"view\"),e=1/b.zoom,h=Math.round(c.width*e*a),c=Math.round(c.height*e*a);b.zoom=a;f(this).turn(\"stop\").turn(\"size\",\nh,c);b.opts.autoCenter&&this.turn(\"center\");g._updateShadow.call(this);for(a=0;a<d.length;a++)d[a]&&b.pageZoom[d[a]]!=b.zoom&&(this.trigger(\"zoomed\",[d[a],d,b.pageZoom[d[a]],b.zoom]),b.pageZoom[d[a]]=b.zoom);return this}return b.zoom},_pageSize:function(a,b){var c=this.data(),d={};if(\"single\"==c.display)d.width=this.width(),d.height=this.height(),b&&(d.top=0,d.left=0,d.right=\"auto\");else{var e=this.width()/2,h=this.height();c.pageObjs[a].hasClass(\"own-size\")?(d.width=c.pageObjs[a].width(),d.height=\nc.pageObjs[a].height()):(d.width=e,d.height=h);if(b){var f=a%2;d.top=(h-d.height)/2;\"ltr\"==c.direction?(d[f?\"right\":\"left\"]=e-d.width,d[f?\"left\":\"right\"]=\"auto\"):(d[f?\"left\":\"right\"]=e-d.width,d[f?\"right\":\"left\"]=\"auto\")}}return d},_makeFlip:function(a){var b=this.data();if(!b.pages[a]&&b.pagePlace[a]==a){var c=\"single\"==b.display,d=a%2;b.pages[a]=b.pageObjs[a].css(g._pageSize.call(this,a)).flip({page:a,next:d||c?a+1:a-1,turn:this}).flip(\"disable\",b.disabled);g._setPageLoc.call(this,a);b.pageZoom[a]=\nb.zoom}return b.pages[a]},_makeRange:function(){var a,b;if(!(1>this.data().totalPages)){b=this.turn(\"range\");for(a=b[0];a<=b[1];a++)g._addPage.call(this,a)}},range:function(a){var b,c,d,e=this.data(),a=a||e.tpage||e.page||1;d=g._view.call(this,a);if(1>a||a>e.totalPages)throw p('\"'+a+'\" is not a valid page');d[1]=d[1]||d[0];1<=d[0]&&d[1]<=e.totalPages?(a=Math.floor(2),e.totalPages-d[1]>d[0]?(b=Math.min(d[0]-1,a),c=2*a-b):(c=Math.min(e.totalPages-d[1],a),b=2*a-c)):c=b=5;return[Math.max(1,d[0]-b),Math.min(e.totalPages,\nd[1]+c)]},_necessPage:function(a){if(0===a)return!0;var b=this.turn(\"range\");return this.data().pageObjs[a].hasClass(\"fixed\")||a>=b[0]&&a<=b[1]},_removeFromDOM:function(){var a,b=this.data();for(a in b.pageWrap)n(a,b.pageWrap)&&!g._necessPage.call(this,a)&&g._removePageFromDOM.call(this,a)},_removePageFromDOM:function(a){var b=this.data();if(b.pages[a]){var c=b.pages[a].data();i._moveFoldingPage.call(b.pages[a],!1);c.f&&c.f.fwrapper&&c.f.fwrapper.remove();b.pages[a].removeData();b.pages[a].remove();\ndelete b.pages[a]}b.pageObjs[a]&&b.pageObjs[a].remove();b.pageWrap[a]&&(b.pageWrap[a].remove(),delete b.pageWrap[a]);g._removeMv.call(this,a);delete b.pagePlace[a];delete b.pageZoom[a]},removePage:function(a){var b=this.data();if(\"*\"==a)for(;0!==b.totalPages;)this.turn(\"removePage\",b.totalPages);else{if(1>a||a>b.totalPages)throw p(\"The page \"+a+\" doesn't exist\");b.pageObjs[a]&&(this.turn(\"stop\"),g._removePageFromDOM.call(this,a),delete b.pageObjs[a]);g._movePages.call(this,a,-1);b.totalPages-=1;b.page>\nb.totalPages?(b.page=null,g._fitPage.call(this,b.totalPages)):(g._makeRange.call(this),this.turn(\"update\"))}return this},_movePages:function(a,b){var c,d=this,e=this.data(),h=\"single\"==e.display,f=function(a){var c=a+b,f=c%2,i=f?\" odd \":\" even \";e.pageObjs[a]&&(e.pageObjs[c]=e.pageObjs[a].removeClass(\"p\"+a+\" odd even\").addClass(\"p\"+c+i));e.pagePlace[a]&&e.pageWrap[a]&&(e.pagePlace[c]=c,e.pageWrap[c]=e.pageObjs[c].hasClass(\"fixed\")?e.pageWrap[a].attr(\"page\",c):e.pageWrap[a].css(g._pageSize.call(d,\nc,!0)).attr(\"page\",c),e.pages[a]&&(e.pages[c]=e.pages[a].flip(\"options\",{page:c,next:h||f?c+1:c-1})),b&&(delete e.pages[a],delete e.pagePlace[a],delete e.pageZoom[a],delete e.pageObjs[a],delete e.pageWrap[a]))};if(0<b)for(c=e.totalPages;c>=a;c--)f(c);else for(c=a;c<=e.totalPages;c++)f(c)},display:function(a){var b=this.data(),c=b.display;if(void 0===a)return c;if(-1==f.inArray(a,U))throw p('\"'+a+'\" is not a value for display');switch(a){case \"single\":b.pageObjs[0]||(this.turn(\"stop\").css({overflow:\"hidden\"}),\nb.pageObjs[0]=f(\"<div />\",{\"class\":\"page p-temporal\"}).css({width:this.width(),height:this.height()}).appendTo(this));this.addClass(\"shadow\");break;case \"double\":b.pageObjs[0]&&(this.turn(\"stop\").css({overflow:\"\"}),b.pageObjs[0].remove(),delete b.pageObjs[0]),this.removeClass(\"shadow\")}b.display=a;c&&(a=this.turn(\"size\"),g._movePages.call(this,1,0),this.turn(\"size\",a.width,a.height).turn(\"update\"));return this},direction:function(a){var b=this.data();if(void 0===a)return b.direction;a=a.toLowerCase();\nif(-1==f.inArray(a,V))throw p('\"'+a+'\" is not a value for direction');\"rtl\"==a&&f(this).attr(\"dir\",\"ltr\").css({direction:\"ltr\"});b.direction=a;b.done&&this.turn(\"size\",f(this).width(),f(this).height());return this},animating:function(){return 0<this.data().pageMv.length},corner:function(){var a,b,c=this.data();for(b in c.pages)if(n(b,c.pages)&&(a=c.pages[b].flip(\"corner\")))return a;return!1},data:function(){return this.data()},disable:function(a){var b,c=this.data(),d=this.turn(\"view\");c.disabled=\nvoid 0===a||!0===a;for(b in c.pages)n(b,c.pages)&&c.pages[b].flip(\"disable\",c.disabled?!0:-1==f.inArray(parseInt(b,10),d));return this},disabled:function(a){return void 0===a?!0===this.data().disabled:this.turn(\"disable\",a)},size:function(a,b){if(void 0===a||void 0===b)return{width:this.width(),height:this.height()};this.turn(\"stop\");var c,d,e=this.data();d=\"double\"==e.display?a/2:a;this.css({width:a,height:b});e.pageObjs[0]&&e.pageObjs[0].css({width:d,height:b});for(c in e.pageWrap)n(c,e.pageWrap)&&\n(d=g._pageSize.call(this,c,!0),e.pageObjs[c].css({width:d.width,height:d.height}),e.pageWrap[c].css(d),e.pages[c]&&e.pages[c].css({width:d.width,height:d.height}));this.turn(\"resize\");return this},resize:function(){var a,b=this.data();b.pages[0]&&(b.pageWrap[0].css({left:-this.width()}),b.pages[0].flip(\"resize\",!0));for(a=1;a<=b.totalPages;a++)b.pages[a]&&b.pages[a].flip(\"resize\",!0);g._updateShadow.call(this);b.opts.autoCenter&&this.turn(\"center\")},_removeMv:function(a){var b,c=this.data();for(b=\n0;b<c.pageMv.length;b++)if(c.pageMv[b]==a)return c.pageMv.splice(b,1),!0;return!1},_addMv:function(a){var b=this.data();g._removeMv.call(this,a);b.pageMv.push(a)},_view:function(a){var b=this.data(),a=a||b.page;return\"double\"==b.display?a%2?[a-1,a]:[a,a+1]:[a]},view:function(a){var b=this.data(),a=g._view.call(this,a);return\"double\"==b.display?[0<a[0]?a[0]:0,a[1]<=b.totalPages?a[1]:0]:[0<a[0]&&a[0]<=b.totalPages?a[0]:0]},stop:function(a,b){if(this.turn(\"animating\")){var c,d,e,h=this.data();h.tpage&&\n(h.page=h.tpage,delete h.tpage);for(c=0;c<h.pageMv.length;c++)h.pageMv[c]&&h.pageMv[c]!==a&&(e=h.pages[h.pageMv[c]],d=e.data().f.opts,e.flip(\"hideFoldedPage\",b),b||i._moveFoldingPage.call(e,!1),d.force&&(d.next=0===d.page%2?d.page-1:d.page+1,delete d.force))}this.turn(\"update\");return this},pages:function(a){var b=this.data();if(a){if(a<b.totalPages)for(var c=b.totalPages;c>a;c--)this.turn(\"removePage\",c);b.totalPages=a;g._fitPage.call(this,b.page);return this}return b.totalPages},_missing:function(a){var b=\nthis.data();if(!(1>b.totalPages)){for(var c=this.turn(\"range\",a),d=[],a=c[0];a<=c[1];a++)b.pageObjs[a]||d.push(a);0<d.length&&this.trigger(\"missing\",[d])}},_fitPage:function(a){var b=this.data(),c=this.turn(\"view\",a);g._missing.call(this,a);if(b.pageObjs[a]){b.page=a;this.turn(\"stop\");for(var d=0;d<c.length;d++)c[d]&&b.pageZoom[c[d]]!=b.zoom&&(this.trigger(\"zoomed\",[c[d],c,b.pageZoom[c[d]],b.zoom]),b.pageZoom[c[d]]=b.zoom);g._removeFromDOM.call(this);g._makeRange.call(this);g._updateShadow.call(this);\nthis.trigger(\"turned\",[a,c]);this.turn(\"update\");b.opts.autoCenter&&this.turn(\"center\")}},_turnPage:function(a){var b,c,d=this.data(),e=d.pagePlace[a],h=this.turn(\"view\"),i=this.turn(\"view\",a);if(d.page!=a){var j=d.page;if(\"prevented\"==s(\"turning\",this,[a,i])){j==d.page&&-1!=f.inArray(e,d.pageMv)&&d.pages[e].flip(\"hideFoldedPage\",!0);return}-1!=f.inArray(1,i)&&this.trigger(\"first\");-1!=f.inArray(d.totalPages,i)&&this.trigger(\"last\")}\"single\"==d.display?(b=h[0],c=i[0]):h[1]&&a>h[1]?(b=h[1],c=i[0]):\nh[0]&&a<h[0]&&(b=h[0],c=i[1]);e=d.opts.turnCorners.split(\",\");h=d.pages[b].data().f;i=h.opts;j=h.point;g._missing.call(this,a);d.pageObjs[a]&&(this.turn(\"stop\"),d.page=a,g._makeRange.call(this),d.tpage=c,i.next!=c&&(i.next=c,i.force=!0),this.turn(\"update\"),h.point=j,\"hard\"==h.effect?\"ltr\"==d.direction?d.pages[b].flip(\"turnPage\",a>b?\"r\":\"l\"):d.pages[b].flip(\"turnPage\",a>b?\"l\":\"r\"):\"ltr\"==d.direction?d.pages[b].flip(\"turnPage\",e[a>b?1:0]):d.pages[b].flip(\"turnPage\",e[a>b?0:1]))},page:function(a){var b=\nthis.data();if(void 0===a)return b.page;if(!b.disabled&&!b.destroying){a=parseInt(a,10);if(0<a&&a<=b.totalPages)return a!=b.page&&(!b.done||-1!=f.inArray(a,this.turn(\"view\"))?g._fitPage.call(this,a):g._turnPage.call(this,a)),this;throw p(\"The page \"+a+\" does not exist\");}},next:function(){return this.turn(\"page\",Math.min(this.data().totalPages,g._view.call(this,this.data().page).pop()+1))},previous:function(){return this.turn(\"page\",Math.max(1,g._view.call(this,this.data().page).shift()-1))},peel:function(a,\nb){var c=this.data(),d=this.turn(\"view\"),b=void 0===b?!0:!0===b;!1===a?this.turn(\"stop\",null,b):\"single\"==c.display?c.pages[c.page].flip(\"peel\",a,b):(d=\"ltr\"==c.direction?-1!=a.indexOf(\"l\")?d[0]:d[1]:-1!=a.indexOf(\"l\")?d[1]:d[0],c.pages[d]&&c.pages[d].flip(\"peel\",a,b));return this},_addMotionPage:function(){var a=f(this).data().f.opts,b=a.turn;b.data();g._addMv.call(b,a.page)},_eventStart:function(a,b,c){var d=b.turn.data(),e=d.pageZoom[b.page];a.isDefaultPrevented()||(e&&e!=d.zoom&&(b.turn.trigger(\"zoomed\",\n[b.page,b.turn.turn(\"view\",b.page),e,d.zoom]),d.pageZoom[b.page]=d.zoom),\"single\"==d.display&&c&&(\"l\"==c.charAt(1)&&\"ltr\"==d.direction||\"r\"==c.charAt(1)&&\"rtl\"==d.direction?(b.next=b.next<b.page?b.next:b.page-1,b.force=!0):b.next=b.next>b.page?b.next:b.page+1),g._addMotionPage.call(a.target));g._updateShadow.call(b.turn)},_eventEnd:function(a,b,c){f(a.target).data();var a=b.turn,d=a.data();if(c){if(c=d.tpage||d.page,c==b.next||c==b.page)delete d.tpage,g._fitPage.call(a,c||b.next,!0)}else g._removeMv.call(a,\nb.page),g._updateShadow.call(a),a.turn(\"update\")},_eventPressed:function(a){var a=f(a.target).data().f,b=a.opts.turn;b.data().mouseAction=!0;b.turn(\"update\");return a.time=(new Date).getTime()},_eventReleased:function(a,b){var c;c=f(a.target);var d=c.data().f,e=d.opts.turn,h=e.data();c=\"single\"==h.display?\"br\"==b.corner||\"tr\"==b.corner?b.x<c.width()/2:b.x>c.width()/2:0>b.x||b.x>c.width();if(200>(new Date).getTime()-d.time||c)a.preventDefault(),g._turnPage.call(e,d.opts.next);h.mouseAction=!1},_flip:function(a){a.stopPropagation();\na=f(a.target).data().f.opts;a.turn.trigger(\"turn\",[a.next]);a.turn.data().opts.autoCenter&&a.turn.turn(\"center\",a.next)},_touchStart:function(){var a=this.data(),b;for(b in a.pages)if(n(b,a.pages)&&!1===i._eventStart.apply(a.pages[b],arguments))return!1},_touchMove:function(){var a=this.data(),b;for(b in a.pages)n(b,a.pages)&&i._eventMove.apply(a.pages[b],arguments)},_touchEnd:function(){var a=this.data(),b;for(b in a.pages)n(b,a.pages)&&i._eventEnd.apply(a.pages[b],arguments)},calculateZ:function(a){var b,\nc,d,e,h=this,f=this.data();b=this.turn(\"view\");var i=b[0]||b[1],g=a.length-1,j={pageZ:{},partZ:{},pageV:{}},k=function(a){a=h.turn(\"view\",a);a[0]&&(j.pageV[a[0]]=!0);a[1]&&(j.pageV[a[1]]=!0)};for(b=0;b<=g;b++)c=a[b],d=f.pages[c].data().f.opts.next,e=f.pagePlace[c],k(c),k(d),c=f.pagePlace[d]==d?d:c,j.pageZ[c]=f.totalPages-Math.abs(i-c),j.partZ[e]=2*f.totalPages-g+b;return j},update:function(){var a,b=this.data();if(this.turn(\"animating\")&&0!==b.pageMv[0]){var c,d=this.turn(\"calculateZ\",b.pageMv),e=\nthis.turn(\"corner\"),h=this.turn(\"view\"),i=this.turn(\"view\",b.tpage);for(a in b.pageWrap)if(n(a,b.pageWrap)&&(c=b.pageObjs[a].hasClass(\"fixed\"),b.pageWrap[a].css({display:d.pageV[a]||c?\"\":\"none\",zIndex:(b.pageObjs[a].hasClass(\"hard\")?d.partZ[a]:d.pageZ[a])||(c?-1:0)}),c=b.pages[a]))c.flip(\"z\",d.partZ[a]||null),d.pageV[a]&&c.flip(\"resize\"),b.tpage?c.flip(\"hover\",!1).flip(\"disable\",-1==f.inArray(parseInt(a,10),b.pageMv)&&a!=i[0]&&a!=i[1]):c.flip(\"hover\",!1===e).flip(\"disable\",a!=h[0]&&a!=h[1])}else for(a in b.pageWrap)n(a,\nb.pageWrap)&&(d=g._setPageLoc.call(this,a),b.pages[a]&&b.pages[a].flip(\"disable\",b.disabled||1!=d).flip(\"hover\",!0).flip(\"z\",null));return this},_updateShadow:function(){var a,b,c=this.data(),d=this.width(),e=this.height(),h=\"single\"==c.display?d:d/2;a=this.turn(\"view\");c.shadow||(c.shadow=f(\"<div />\",{\"class\":\"shadow\",css:l(0,0,0).css}).appendTo(this));for(var i=0;i<c.pageMv.length&&a[0]&&a[1];i++)a=this.turn(\"view\",c.pages[c.pageMv[i]].data().f.opts.next),b=this.turn(\"view\",c.pageMv[i]),a[0]=a[0]&&\nb[0],a[1]=a[1]&&b[1];switch(a[0]?a[1]?3:\"ltr\"==c.direction?2:1:\"ltr\"==c.direction?1:2){case 1:c.shadow.css({width:h,height:e,top:0,left:h});break;case 2:c.shadow.css({width:h,height:e,top:0,left:0});break;case 3:c.shadow.css({width:d,height:e,top:0,left:0})}},_setPageLoc:function(a){var b=this.data(),c=this.turn(\"view\"),d=0;if(a==c[0]||a==c[1])d=1;else if(\"single\"==b.display&&a==c[0]+1||\"double\"==b.display&&a==c[0]-2||a==c[1]+2)d=2;if(!this.turn(\"animating\"))switch(d){case 1:b.pageWrap[a].css({zIndex:b.totalPages,\ndisplay:\"\"});break;case 2:b.pageWrap[a].css({zIndex:b.totalPages-1,display:\"\"});break;case 0:b.pageWrap[a].css({zIndex:0,display:b.pageObjs[a].hasClass(\"fixed\")?\"\":\"none\"})}return d},options:function(a){if(void 0===a)return this.data().opts;var b=this.data();f.extend(b.opts,a);a.pages&&this.turn(\"pages\",a.pages);a.page&&this.turn(\"page\",a.page);a.display&&this.turn(\"display\",a.display);a.direction&&this.turn(\"direction\",a.direction);a.width&&a.height&&this.turn(\"size\",a.width,a.height);if(a.when)for(var c in a.when)n(c,\na.when)&&this.unbind(c).bind(c,a.when[c]);return this},version:function(){return\"4.1.0\"}},i={init:function(a){this.data({f:{disabled:!1,hover:!1,effect:this.hasClass(\"hard\")?\"hard\":\"sheet\"}});this.flip(\"options\",a);i._addPageWrapper.call(this);return this},setData:function(a){var b=this.data();b.f=f.extend(b.f,a);return this},options:function(a){var b=this.data().f;return a?(i.setData.call(this,{opts:f.extend({},b.opts||X,a)}),this):b.opts},z:function(a){var b=this.data().f;b.opts[\"z-index\"]=a;b.fwrapper&&\nb.fwrapper.css({zIndex:a||parseInt(b.parent.css(\"z-index\"),10)||0});return this},_cAllowed:function(){var a=this.data().f,b=a.opts.page,c=a.opts.turn.data(),d=b%2;return\"hard\"==a.effect?\"ltr\"==c.direction?[d?\"r\":\"l\"]:[d?\"l\":\"r\"]:\"single\"==c.display?1==b?\"ltr\"==c.direction?o.forward:o.backward:b==c.totalPages?\"ltr\"==c.direction?o.backward:o.forward:o.all:\"ltr\"==c.direction?o[d?\"forward\":\"backward\"]:o[d?\"backward\":\"forward\"]},_cornerActivated:function(a){var b=this.data().f,c=this.width(),d=this.height(),\na={x:a.x,y:a.y,corner:\"\"},e=b.opts.cornerSize;if(0>=a.x||0>=a.y||a.x>=c||a.y>=d)return!1;var h=i._cAllowed.call(this);switch(b.effect){case \"hard\":if(a.x>c-e)a.corner=\"r\";else if(a.x<e)a.corner=\"l\";else return!1;break;case \"sheet\":if(a.y<e)a.corner+=\"t\";else if(a.y>=d-e)a.corner+=\"b\";else return!1;if(a.x<=e)a.corner+=\"l\";else if(a.x>=c-e)a.corner+=\"r\";else return!1}return!a.corner||-1==f.inArray(a.corner,h)?!1:a},_isIArea:function(a){var b=this.data().f.parent.offset(),a=t&&a.originalEvent?a.originalEvent.touches[0]:\na;return i._cornerActivated.call(this,{x:a.pageX-b.left,y:a.pageY-b.top})},_c:function(a,b){b=b||0;switch(a){case \"tl\":return j(b,b);case \"tr\":return j(this.width()-b,b);case \"bl\":return j(b,this.height()-b);case \"br\":return j(this.width()-b,this.height()-b);case \"l\":return j(b,0);case \"r\":return j(this.width()-b,0)}},_c2:function(a){switch(a){case \"tl\":return j(2*this.width(),0);case \"tr\":return j(-this.width(),0);case \"bl\":return j(2*this.width(),this.height());case \"br\":return j(-this.width(),\nthis.height());case \"l\":return j(2*this.width(),0);case \"r\":return j(-this.width(),0)}},_foldingPage:function(){var a=this.data().f;if(a){var b=a.opts;if(b.turn)return a=b.turn.data(),\"single\"==a.display?1<b.next||1<b.page?a.pageObjs[0]:null:a.pageObjs[b.next]}},_backGradient:function(){var a=this.data().f,b=a.opts.turn.data();if((b=b.opts.gradients&&(\"single\"==b.display||2!=a.opts.page&&a.opts.page!=b.totalPages-1))&&!a.bshadow)a.bshadow=f(\"<div/>\",l(0,0,1)).css({position:\"\",width:this.width(),height:this.height()}).appendTo(a.parent);\nreturn b},type:function(){return this.data().f.effect},resize:function(a){var b=this.data().f,c=b.opts.turn.data(),d=this.width(),e=this.height();switch(b.effect){case \"hard\":a&&(b.wrapper.css({width:d,height:e}),b.fpage.css({width:d,height:e}),c.opts.gradients&&(b.ashadow.css({width:d,height:e}),b.bshadow.css({width:d,height:e})));break;case \"sheet\":a&&(a=Math.round(Math.sqrt(Math.pow(d,2)+Math.pow(e,2))),b.wrapper.css({width:a,height:a}),b.fwrapper.css({width:a,height:a}).children(\":first-child\").css({width:d,\nheight:e}),b.fpage.css({width:d,height:e}),c.opts.gradients&&b.ashadow.css({width:d,height:e}),i._backGradient.call(this)&&b.bshadow.css({width:d,height:e})),b.parent.is(\":visible\")&&(c=C(b.parent[0]),b.fwrapper.css({top:c.top,left:c.left}),c=C(b.opts.turn[0]),b.fparent.css({top:-c.top,left:-c.left})),this.flip(\"z\",b.opts[\"z-index\"])}},_addPageWrapper:function(){var a=this.data().f,b=a.opts.turn.data(),c=this.parent();a.parent=c;if(!a.wrapper)switch(a.effect){case \"hard\":var d={};d[v+\"transform-style\"]=\n\"preserve-3d\";d[v+\"backface-visibility\"]=\"hidden\";a.wrapper=f(\"<div/>\",l(0,0,2)).css(d).appendTo(c).prepend(this);a.fpage=f(\"<div/>\",l(0,0,1)).css(d).appendTo(c);b.opts.gradients&&(a.ashadow=f(\"<div/>\",l(0,0,0)).hide().appendTo(c),a.bshadow=f(\"<div/>\",l(0,0,0)));break;case \"sheet\":var d=this.width(),e=this.height();Math.round(Math.sqrt(Math.pow(d,2)+Math.pow(e,2)));a.fparent=a.opts.turn.data().fparent;a.fparent||(d=f(\"<div/>\",{css:{\"pointer-events\":\"none\"}}).hide(),d.data().flips=0,d.css(l(0,0,\"auto\",\n\"visible\").css).appendTo(a.opts.turn),a.opts.turn.data().fparent=d,a.fparent=d);this.css({position:\"absolute\",top:0,left:0,bottom:\"auto\",right:\"auto\"});a.wrapper=f(\"<div/>\",l(0,0,this.css(\"z-index\"))).appendTo(c).prepend(this);a.fwrapper=f(\"<div/>\",l(c.offset().top,c.offset().left)).hide().appendTo(a.fparent);a.fpage=f(\"<div/>\",l(0,0,0,\"visible\")).css({cursor:\"default\"}).appendTo(a.fwrapper);b.opts.gradients&&(a.ashadow=f(\"<div/>\",l(0,0,1)).appendTo(a.fpage));i.setData.call(this,a)}i.resize.call(this,\n!0)},_fold:function(a){var b=this.data().f,c=b.opts.turn.data(),d=i._c.call(this,a.corner),e=this.width(),h=this.height();switch(b.effect){case \"hard\":a.x=\"l\"==a.corner?Math.min(Math.max(a.x,0),2*e):Math.max(Math.min(a.x,e),-e);var f,g,r,w,k,n=c.totalPages,l=b.opts[\"z-index\"]||n,p={overflow:\"visible\"},o=d.x?(d.x-a.x)/e:a.x/e,q=90*o,s=90>q;switch(a.corner){case \"l\":w=\"0% 50%\";k=\"100% 50%\";s?(f=0,g=0<b.opts.next-1,r=1):(f=\"100%\",g=b.opts.page+1<n,r=0);break;case \"r\":w=\"100% 50%\",k=\"0% 50%\",q=-q,e=-e,\ns?(f=0,g=b.opts.next+1<n,r=0):(f=\"-100%\",g=1!=b.opts.page,r=1)}p[v+\"perspective-origin\"]=k;b.wrapper.transform(\"rotateY(\"+q+\"deg)translate3d(0px, 0px, \"+(this.attr(\"depth\")||0)+\"px)\",k);b.fpage.transform(\"translateX(\"+e+\"px) rotateY(\"+(180+q)+\"deg)\",w);b.parent.css(p);s?(o=-o+1,b.wrapper.css({zIndex:l+1}),b.fpage.css({zIndex:l})):(o-=1,b.wrapper.css({zIndex:l}),b.fpage.css({zIndex:l+1}));c.opts.gradients&&(g?b.ashadow.css({display:\"\",left:f,backgroundColor:\"rgba(0,0,0,\"+0.5*o+\")\"}).transform(\"rotateY(0deg)\"):\nb.ashadow.hide(),b.bshadow.css({opacity:-o+1}),s?b.bshadow.parent()[0]!=b.wrapper[0]&&b.bshadow.appendTo(b.wrapper):b.bshadow.parent()[0]!=b.fpage[0]&&b.bshadow.appendTo(b.fpage),O(b.bshadow,j(100*r,0),j(100*(-r+1),0),[[0,\"rgba(0,0,0,0.3)\"],[1,\"rgba(0,0,0,0)\"]],2));break;case \"sheet\":var t=this,G=0,y,z,A,L,x,M,C,u=j(0,0),P=j(0,0),m=j(0,0),I=i._foldingPage.call(this);Math.tan(0);var N=c.opts.acceleration,Q=b.wrapper.height(),D=\"t\"==a.corner.substr(0,1),B=\"l\"==a.corner.substr(1,1),H=function(){var b=\nj(0,0),f=j(0,0);b.x=d.x?d.x-a.x:a.x;b.y=T?d.y?d.y-a.y:a.y:0;f.x=B?e-b.x/2:a.x+b.x/2;f.y=b.y/2;var g=K-Math.atan2(b.y,b.x),k=g-Math.atan2(f.y,f.x),k=Math.max(0,Math.sin(k)*Math.sqrt(Math.pow(f.x,2)+Math.pow(f.y,2)));G=180*(g/J);m=j(k*Math.sin(g),k*Math.cos(g));if(g>K&&(m.x+=Math.abs(m.y*b.y/b.x),m.y=0,Math.round(m.x*Math.tan(J-g))<h))return a.y=Math.sqrt(Math.pow(h,2)+2*f.x*b.x),D&&(a.y=h-a.y),H();if(g>K&&(b=J-g,f=Q-h/Math.sin(b),u=j(Math.round(f*Math.cos(b)),Math.round(f*Math.sin(b))),B&&(u.x=-u.x),\nD))u.y=-u.y;y=Math.round(m.y/Math.tan(g)+m.x);b=e-y;f=b*Math.cos(2*g);k=b*Math.sin(2*g);P=j(Math.round(B?b-f:y+f),Math.round(D?k:h-k));if(c.opts.gradients&&(x=b*Math.sin(g),b=i._c2.call(t,a.corner),b=Math.sqrt(Math.pow(b.x-a.x,2)+Math.pow(b.y-a.y,2))/e,C=Math.sin(K*(1<b?2-b:b)),M=Math.min(b,1),L=100<x?(x-100)/x:0,z=j(100*(x*Math.sin(g)/e),100*(x*Math.cos(g)/h)),i._backGradient.call(t)&&(A=j(100*(1.2*x*Math.sin(g)/e),100*(1.2*x*Math.cos(g)/h)),B||(A.x=100-A.x),!D)))A.y=100-A.y;m.x=Math.round(m.x);\nm.y=Math.round(m.y);return!0};f=function(a,d,f,g){var k=[\"0\",\"auto\"],m=(e-Q)*f[0]/100,l=(h-Q)*f[1]/100,d={left:k[d[0]],top:k[d[1]],right:k[d[2]],bottom:k[d[3]]},k={},n=90!=g&&-90!=g?B?-1:1:0,r=f[0]+\"% \"+f[1]+\"%\";t.css(d).transform(F(g)+E(a.x+n,a.y,N),r);b.fpage.css(d).transform(F(g)+E(a.x+P.x-u.x-e*f[0]/100,a.y+P.y-u.y-h*f[1]/100,N)+F((180/g-2)*g),r);b.wrapper.transform(E(-a.x+m-n,-a.y+l,N)+F(-g),r);b.fwrapper.transform(E(-a.x+u.x+m,-a.y+u.y+l,N)+F(-g),r);c.opts.gradients&&(f[0]&&(z.x=100-z.x),f[1]&&\n(z.y=100-z.y),k[\"box-shadow\"]=\"0 0 20px rgba(0,0,0,\"+0.5*C+\")\",I.css(k),O(b.ashadow,j(B?100:0,D?0:100),j(z.x,z.y),[[L,\"rgba(0,0,0,0)\"],[0.8*(1-L)+L,\"rgba(0,0,0,\"+0.2*M+\")\"],[1,\"rgba(255,255,255,\"+0.2*M+\")\"]],3,0),i._backGradient.call(t)&&O(b.bshadow,j(B?0:100,D?0:100),j(A.x,A.y),[[0.6,\"rgba(0,0,0,0)\"],[0.8,\"rgba(0,0,0,\"+0.3*M+\")\"],[1,\"rgba(0,0,0,0)\"]],3))};switch(a.corner){case \"tl\":a.x=Math.max(a.x,1);H();f(m,[1,0,0,1],[100,0],G);break;case \"tr\":a.x=Math.min(a.x,e-1);H();f(j(-m.x,m.y),[0,0,0,1],\n[0,0],-G);break;case \"bl\":a.x=Math.max(a.x,1);H();f(j(m.x,-m.y),[1,1,0,0],[100,100],-G);break;case \"br\":a.x=Math.min(a.x,e-1),H(),f(j(-m.x,-m.y),[0,1,1,0],[0,100],G)}}b.point=a},_moveFoldingPage:function(a){var b=this.data().f;if(b){var c=b.opts.turn,d=c.data(),e=d.pagePlace;a?(d=b.opts.next,e[d]!=b.opts.page&&(b.folding&&i._moveFoldingPage.call(this,!1),i._foldingPage.call(this).appendTo(b.fpage),e[d]=b.opts.page,b.folding=d),c.turn(\"update\")):b.folding&&(d.pages[b.folding]?(c=d.pages[b.folding].data().f,\nd.pageObjs[b.folding].appendTo(c.wrapper)):d.pageWrap[b.folding]&&d.pageObjs[b.folding].appendTo(d.pageWrap[b.folding]),b.folding in e&&(e[b.folding]=b.folding),delete b.folding)}},_showFoldedPage:function(a,b){var c=i._foldingPage.call(this),d=this.data(),e=d.f,f=e.visible;if(c){if(!f||!e.point||e.point.corner!=a.corner)if(c=\"hover\"==e.status||\"peel\"==e.status||e.opts.turn.data().mouseAction?a.corner:null,f=!1,\"prevented\"==s(\"start\",this,[e.opts,c]))return!1;if(b){var g=this,d=e.point&&e.point.corner==\na.corner?e.point:i._c.call(this,a.corner,1);this.animatef({from:[d.x,d.y],to:[a.x,a.y],duration:500,frame:function(b){a.x=Math.round(b[0]);a.y=Math.round(b[1]);i._fold.call(g,a)}})}else i._fold.call(this,a),d.effect&&!d.effect.turning&&this.animatef(!1);if(!f)switch(e.effect){case \"hard\":e.visible=!0;i._moveFoldingPage.call(this,!0);e.fpage.show();e.opts.shadows&&e.bshadow.show();break;case \"sheet\":e.visible=!0,e.fparent.show().data().flips++,i._moveFoldingPage.call(this,!0),e.fwrapper.show(),e.bshadow&&\ne.bshadow.show()}return!0}return!1},hide:function(){var a=this.data().f,b=a.opts.turn.data(),c=i._foldingPage.call(this);switch(a.effect){case \"hard\":b.opts.gradients&&(a.bshadowLoc=0,a.bshadow.remove(),a.ashadow.hide());a.wrapper.transform(\"\");a.fpage.hide();break;case \"sheet\":0===--a.fparent.data().flips&&a.fparent.hide(),this.css({left:0,top:0,right:\"auto\",bottom:\"auto\"}).transform(\"\"),a.wrapper.transform(\"\"),a.fwrapper.hide(),a.bshadow&&a.bshadow.hide(),c.transform(\"\")}a.visible=!1;return this},\nhideFoldedPage:function(a){var b=this.data().f;if(b.point){var c=this,d=b.point,e=function(){b.point=null;b.status=\"\";c.flip(\"hide\");c.trigger(\"end\",[b.opts,!1])};if(a){var f=i._c.call(this,d.corner),a=\"t\"==d.corner.substr(0,1)?Math.min(0,d.y-f.y)/2:Math.max(0,d.y-f.y)/2,g=j(d.x,d.y+a),l=j(f.x,f.y-a);this.animatef({from:0,to:1,frame:function(a){a=R(d,g,l,f,a);d.x=a.x;d.y=a.y;i._fold.call(c,d)},complete:e,duration:800,hiding:!0})}else this.animatef(!1),e()}},turnPage:function(a){var b=this,c=this.data().f,\nd=c.opts.turn.data(),a={corner:c.corner?c.corner.corner:a||i._cAllowed.call(this)[0]},e=c.point||i._c.call(this,a.corner,c.opts.turn?d.opts.elevation:0),f=i._c2.call(this,a.corner);this.trigger(\"flip\").animatef({from:0,to:1,frame:function(c){c=R(e,e,f,f,c);a.x=c.x;a.y=c.y;i._showFoldedPage.call(b,a)},complete:function(){b.trigger(\"end\",[c.opts,!0])},duration:d.opts.duration,turning:!0});c.corner=null},moving:function(){return\"effect\"in this.data()},isTurning:function(){return this.flip(\"moving\")&&\nthis.data().effect.turning},corner:function(){return this.data().f.corner},_eventStart:function(a){var b=this.data().f,c=b.opts.turn;if(!b.corner&&!b.disabled&&!this.flip(\"isTurning\")&&b.opts.page==c.data().pagePlace[b.opts.page]){b.corner=i._isIArea.call(this,a);if(b.corner&&i._foldingPage.call(this))return this.trigger(\"pressed\",[b.point]),i._showFoldedPage.call(this,b.corner),!1;b.corner=null}},_eventMove:function(a){var b=this.data().f;if(!b.disabled)if(a=t?a.originalEvent.touches:[a],b.corner){var c=\nb.parent.offset();b.corner.x=a[0].pageX-c.left;b.corner.y=a[0].pageY-c.top;i._showFoldedPage.call(this,b.corner)}else if(b.hover&&!this.data().effect&&this.is(\":visible\"))if(a=i._isIArea.call(this,a[0])){if(\"sheet\"==b.effect&&2==a.corner.length||\"hard\"==b.effect)b.status=\"hover\",b=i._c.call(this,a.corner,b.opts.cornerSize/2),a.x=b.x,a.y=b.y,i._showFoldedPage.call(this,a,!0)}else\"hover\"==b.status&&(b.status=\"\",i.hideFoldedPage.call(this,!0))},_eventEnd:function(){var a=this.data().f,b=a.corner;!a.disabled&&\nb&&\"prevented\"!=s(\"released\",this,[a.point||b])&&i.hideFoldedPage.call(this,!0);a.corner=null},disable:function(a){i.setData.call(this,{disabled:a});return this},hover:function(a){i.setData.call(this,{hover:a});return this},peel:function(a,b){var c=this.data().f;if(a){if(-1==f.inArray(a,o.all))throw p(\"Corner \"+a+\" is not permitted\");if(-1!=f.inArray(a,i._cAllowed.call(this))){var d=i._c.call(this,a,c.opts.cornerSize/2);c.status=\"peel\";i._showFoldedPage.call(this,{corner:a,x:d.x,y:d.y},b)}}else c.status=\n\"\",i.hideFoldedPage.call(this,b);return this}};window.requestAnim=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)};f.extend(f.fn,{flip:function(){return I(f(this[0]),i,arguments)},turn:function(){return I(f(this[0]),g,arguments)},transform:function(a,b){var c={};b&&(c[v+\"transform-origin\"]=b);c[v+\"transform\"]=a;return this.css(c)},animatef:function(a){var b=\nthis.data();b.effect&&b.effect.stop();if(a){a.to.length||(a.to=[a.to]);a.from.length||(a.from=[a.from]);for(var c=[],d=a.to.length,e=!0,g=this,i=(new Date).getTime(),j=function(){if(b.effect&&e){for(var f=[],k=Math.min(a.duration,(new Date).getTime()-i),l=0;l<d;l++)f.push(b.effect.easing(1,k,a.from[l],c[l],a.duration));a.frame(d==1?f[0]:f);if(k==a.duration){delete b.effect;g.data(b);a.complete&&a.complete()}else window.requestAnim(j)}},l=0;l<d;l++)c.push(a.to[l]-a.from[l]);b.effect=f.extend({stop:function(){e=\nfalse},easing:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c}},a);this.data(b);j()}else delete b.effect}});f.isTouch=t;f.mouseEvents=q;f.cssPrefix=S;f.cssTransitionEnd=function(){var a,b=document.createElement(\"fakeelement\"),c={transition:\"transitionend\",OTransition:\"oTransitionEnd\",MSTransition:\"transitionend\",MozTransition:\"transitionend\",WebkitTransition:\"webkitTransitionEnd\"};for(a in c)if(void 0!==b.style[a])return c[a]};f.findPos=C})(jQuery);\n" + scriptEnd;
    html += styleStart + styleEnd;
    html += "</head>\n<body>\n\t<div>\n\t\t<div id=\"flipbook\">\n\t\t<div class=\"hard\" style=\"line-height:2em\"> " + data[0] + "</div>\n\t\t<div class=\"hard\"></div>\n";

    for (var i = 1; i < data.length; i++) {
        html += "\t\t<div>\n\t\t\t" + data[i] + "\n\t\t</div>\n";
    }
    html += "\n<div class=\"hard\"></div>\n<div class=\"hard\"></div>\n</div>\n</div>\n<script type=\"text/javascript\">\n$(\"#flipbook\").turn({width: \"100%\",height: \"100%\",autoCenter: true});\n</script>\n</body>\n</html>";
    //socket.emit("saveAsHtml", html);
    download(html, "livro.html", "text/plain");
    //console.log(html);
}



