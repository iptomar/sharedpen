/**
 *
 * Scrip com as FunÃ§oes de autenticação, tabs e modelos, desenho, chat, e cor de background
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
var hash = {};
var tabTest;
var LivroPoemas = new Array();
var listapages = [];
var backArray = ["home"];
var folderArray = [listapages];
var tmpArrayProj = [];
var tmpModels = [];
var currentPosition = 1;
$(document).ready(function () {

//--------------------------BACKOFFICE----------------------------------------
//fazer update a aluno
        $("body").on('click', "#guardarEditAluno", function (e) {
                  validacaoFormAll();
                  $("body").find('.validForm').on('success.form.bv', function (e) {
                      e.stopPropagation();
                      e.preventDefault();
                      $.ajax({
                          type: "POST",
                          url: "/updateAluno",
                          data: {
                              image: $("#userImage").attr('src'),
                              id: $("#Id_aluno_edit").val(),
                              username: $("#username_aluno_edit").val(),
                              nomeAluno: $("#nome_aluno_edit").val(),
                              numAluno: $("#numero_aluno_edit").val(),
                              password: stringToMd5($("#password_aluno_edit").val()),
                              turma: $("#turma_aluno_edit option:selected").val(),
                              ano: $("#ano_aluno_edit option:selected").val(),
                              id_escola: $("#escola_aluno_edit option:selected").val()
                          },
                          dataType: 'json',
                          success: function (data) {
                              $(".voltarLayout").click();
                          },
                          error: function (error) {
                              console.log(JSON.stringify(error));
                          }
                      });
                  });
 });
//fazer update a professor

    $("body").on('click', "#guardarEditProfessor", function (e) {
    validacaoFormAll();
         $("body").find('.validForm').on('success.form.bv', function (e) {
             e.stopPropagation();
             e.preventDefault();
             $.ajax({
                 type: "POST",
                 url: "/updateProfessores",
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
                     if(data==='false'){
                         alert("Este Utilizador ja existe!!");
                         
                     }
                     else{
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
    validacaoFormAll();
    $("body").find('.validForm').on('success.form.bv', function (e) {


        e.stopPropagation();
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/updateEscolas",
            data: {
                id: $("#Id_Escola_edit").val(),
                nome: $("#Nome_Escola_edit").val(),
                morada: $("#Morada_Escola_edit").val(),
                contacto: $("#Contacto_Escola_edit").val(),
                id_agrupamento: $("#Agrupamento_Escola_edit option:selected").val(),
            },
            dataType: 'json',
            success: function (data) {
                $(".voltarLayout").click();
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            }
        });
    });

});

//fazer update a agrupamento
$("body").on('click', "#guardarEditAgrupamento", function (e) {
    validacaoFormAll();
    $("body").find('.validForm').on('success.form.bv', function (e) {

        e.stopPropagation();
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/updateAgrupamentos",
            data: {
                id: $("#Id_Agrupamento_edit").val(),
                nome: $("#Nome_Agrupamento_edit").val(),
            },
            dataType: 'json',
            success: function (data) {
                $(".voltarLayout").click();
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
    var type = $(this).data("type");
    switch (type) {
    case "aluno":
        addLayoutToDiv("#contentor", "html", "EditarAluno.html", socket);
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
            url: "/getAllEscolas",
            dataType: 'json',
            success: function (data) {
                var htmlVar = "";
                for (var i = 0, max = data.length; i < max; i++) {
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
        $.ajax({
            type: "GET",
            url: "/getAluno/" + $(this).attr("rel"),
            dataType: 'json',
            success: function (data) {
                $("#Id_aluno_edit").val(data[0].id_user);
                $("#userImage").attr("src", data[0].avatar),
                    $("#username_aluno_edit").val(data[0].username);
                $("#nome_aluno_edit").val(data[0].nome_aluno);
                $("#numero_aluno_edit").val(data[0].num_aluno);
                $("#turma_aluno_edit").val(data[0].turma);
                $("#ano_aluno_edit").val(data[0].ano);
                $("#escola_aluno_edit").val(data[0].id_escola);
                $("#password_aluno_edit").val(data[0].password);
                $("body").find("#loading").remove();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                console.log(JSON.stringify(error));
            }
        });
        break;

    case "professor":
        addLayoutToDiv("#contentor", "html", "EditarProfessor.html", socket);
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
            type: "GET",
            url: "/getProfessores/" + $(this).attr("rel"),
            dataType: 'json',
            success: function (data) {
                var htmlVar;
                $("#userImage").attr("src", data[0].avatar),
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
                alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                console.log(JSON.stringify(error));
            }
        });
        break;

    case "escola":
        addLayoutToDiv("#contentor", "html", "EditarEscola.html", socket);
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
                //$("#userImage").attr('src', data[0].avatar);
                $("#Id_Escola_edit").val(data[0].id);
                $("#Nome_Escola_edit").val(data[0].nome);
                $("#Morada_Escola_edit").val(data[0].morada);
                $("#Contacto_Escola_edit").val(data[0].contacto);
                $("#Agrupamento_Escola_edit").val(data[0].id_agrupamento);
                $("body").find("#loading").remove();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar os dados para paginas.\nTente Novamente.")
                console.log(JSON.stringify(error));
            }
        });
        break;

    case "agrupamento":
        addLayoutToDiv("#contentor", "html", "EditarAgrupamento.html", socket);
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
    validacaoFormAll()
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
                        addLayoutToDiv("#contentor", "html", "GerirAluno.html", socket);
                        break;
                    case "professor":
                        addLayoutToDiv("#contentor", "html", "GerirProfessor.html", socket);
                        break;
                }
            },
            error: function (error) {
            }
        });
    });

//criar aluno
    $("body").on('click', "#btnAdicionarEntity_aluno", function (e) {
        validacaoFormAll();
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
            // contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {

                addLayoutToDiv("#contentor", "html", "GerirAluno.html", socket);
            },
            error: function (error) {
            }
        });
    });
    });

//criar professor
    $("body").on('click', "#btnAdicionarEntity_professor", function (e) {
         validacaoFormAll();
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
            // contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {

                $(".voltarLayout").click();
                //addLayoutToDiv("#contentor", "html", "GerirProfessor.html", socket);
            },
            error: function (error) {
            }
        });
    });
});
    //criar escola
    $("body").on('click', "#btnAdicionarEntity_escola", function (e) {
         validacaoFormAll();
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
            // contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {

                $(".voltarLayout").click();
                //addLayoutToDiv("#contentor", "html", "GerirProfessor.html", socket);
            },
            error: function (error) {
            }
        });
    });
});
    //criar escola
    $("body").on('click', "#btnAdicionarEntity_agrupamento", function (e) {
        validacaoFormAll();
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
            // contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {

                $(".voltarLayout").click();
                //addLayoutToDiv("#contentor", "html", "GerirProfessor.html", socket);
            },
            error: function (error) {
            }
        });
    });
        });
// procurar por Username de no aluno
    $("body").on('input', "#inputSearch", function (e) {
        var type = $(this).data("type");
        switch (type) {
            case "aluno":
                $("body").append(wait);
                if ($("#inputSearch").val() == "") {
                    addLayoutToDiv("#contentor", "html", "GerirAluno.html", socket);
                    $("#inputSearch").focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/searchAluno/" + $("#inputSearch").val(),
                        dataType: 'json',
                        success: function (data) {
                            var htmlVar;
                            $('#gerirEntitiesTable tbody').empty();
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
                if ($("#inputSearch").val() == "") {
                    addLayoutToDiv("#contentor", "html", "GerirProfessor.html", socket);
                    $("#inputSearch").focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/searchProfessor/" + $("#inputSearch").val(),
                        dataType: 'json',
                        success: function (data) {
                            var htmlVar;
                            $('#gerirEntitiesTable tbody').empty();
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
                if ($("#inputSearch").val() == "") {
                    addLayoutToDiv("#contentor", "html", "GerirEscolas.html", socket);
                    $("#inputSearch").focus();
                } else {
                    e.stopPropagation();
                    e.preventDefault();
                    $.ajax({
                        type: "GET",
                        url: "/searchEscola/" + $("#inputSearch").val(),
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

            case "agrupamento":
                $("body").append(wait);
                if ($("#inputSearch").val() == "") {
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
        }
    });
//--------------------------BACKOFFICE-END---------------------------------------


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


    // cria a ligaÃ§Ã£o com o servidor que disponibiliza o socket
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
     * FunÃ§Ãµes relacionadas com a autenticaÃ§Ã£o --------------------------------------------------------------------
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
                            "User = c, pass = c => Professor")
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
     * FunÃ§Ãµes relacionadas com o desenho -------------------------------------------------------------------------
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
                        case "corTudo":
                            hash[idToll].modelo.arrayElem[thisId].drawObj.setApagarTudo(selectedMenu.data("cor"));
                            //                                alert(selectedMenu.data("cor"));
                            break;
                        case "cor":
                            hash[idToll].modelo.arrayElem[thisId].drawObj.setColor(selectedMenu.data("cor"));
                            //                                alert(selectedMenu.data("cor"));
                            break;
                        case "size":
                            hash[idToll].modelo.arrayElem[thisId].drawObj.setSizePensil(selectedMenu.data("size"));
                            //                                alert(selectedMenu.data("size"));
                            break;
                        case "img":
                            $("#LoadImageCanvas").click();
                            //                                alert(selectedMenu.data("tipo"));
                            break;
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
    $("body").on('change', '#LoadImageCanvas', function (e) {
        var Thid = $("#LoadImageCanvas").attr('data-idpai');
        var parent = "txtTab" + Thid.match(/^\d+|\d+\b|\d+(?=\w)/);
        var cnv = $("#LoadImageCanvas").attr('data-idcnv');
        var input = e.target;
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
                image: dataURL
            });
        };
        reader.readAsDataURL(input.files[0]);
    });
    /*
     * FunÃ§oes relacionadas com as cores ----------------------------------------------------------------------
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
     * FunÃ§Ãµes relacionas com as Tabs e modelos --------------------------------------------------------------------------------
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
        if (backArray[backArray.length - 1] != "MenuCriarProjectos.html") {
            var listClass = $(this).attr("id");
            var listClassPAI = $(this).parent().parent().attr('class').split(' ')[1];
            // console.log(listClassPAI);
            var edit = hash["." + listClassPAI].modelo.arrayElem[listClass].editor;
            if ($("#" + edit.idpai + " > #" + e.target.id).attr("class") != edit.userNum) {
                if (e.handleObj.type.charAt(0) == 'm' || e.handleObj.type.charAt(0) == 'c') {
                    setCaretAtEditor(e.target.id, 0, $("#" + edit.idpai + " > #" + e.target.id).text().length);
                } else {
                    if (e.keyCode == edit.key.ENTER) {
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
                        } else {
                            alert("Não pode colocar mais nenhum paragrafo.\nSe for necessário crie uma nova folha.");
                        }
                    } else {
                        e.preventDefault();
                    }
                }
            } else {
                var newPara = false;
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
        }
    });
    /**
     * Evento gerado quando ha alteraÃ§oes nas tabs
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
        var hashtoSave;
        var kk = Object.keys(hash);
        socket.emit('reqHashToSave', {
            id: hash[kk[0]].projID
        });

        socket.on('getHashToSave', function (data) {
            hashtoSave = data.hashh

            for (item in hashtoSave) {
                for (elem in hashtoSave[item].modelo.arrayElem) {
                    if (hashtoSave[item].modelo.arrayElem[elem].conteudo != "") {
                        var conteudo = hashtoSave[item].modelo.arrayElem[elem].conteudo;

                        var newchar = '\\"'
                        conteudo = conteudo.split('"').join(newchar);
                        newchar = '\\/'
                        conteudo = conteudo.split('/').join(newchar);
                        hashtoSave[item].modelo.arrayElem[elem].conteudo = conteudo

                    }
                }
            }


            $.ajax({
                type: "POST",
                url: "/setArray",
                data: {
                    arrayy: JSON.stringify(hashtoSave)
                },
                // contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (data) {
                    //alert(data);

                },
                error: function (error) {
                    // alert("ERRO HASH");
                    //console.log(JSON.stringify(error));
                }
            });

        });

    })

    $("body").on('click', "#bt_getHash", function () {
        //alert(hash);
        $.ajax({
            type: "GET",
            url: "/getArray/" + 9,
            dataType: 'json',
            success: function (data) {
                console.log(data[0]);
                //var ola =   JSON.parse('[object Object]');
                // console.log(ola);

                var test = JSON.parse('' + data[0].array + '');

                console.log(test);
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

    })

    $("body").on('click', ".btnmodels", function () {

        var modelo = $(this).data('idmodel');
        var idNum = (Object.keys(hash).length + 1);
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getCodModel/" + modelo,
            contentType: "application/json; charset=utf-8",
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
     * Evento onClik que gera a criaÃ§ao de uma nova Tab e respectivo modelo
     */
    $("body").on('click', 'a[href="#add-page"]', function () {

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
    });
    /**
     * FunÃ§ao que remove tabs
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


    $("body").on('click', '#btncancelmodels', function () {
        $("body").find("#divchangemodel").remove();
    });
    /*
     * FunÃ§Ãµes relacionas com o Chat ---------------------------------------------------------------------------------------
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
     * FunÃ§Ã£o para enviar uma mensagem no chat
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
     * FunÃ§Ã£o para enviar mensagem com o enter
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
    /*
     * Fim FunÃ§Ãµes relacionas com o Chat -------------------------------------------------------------------------------
     */



    //Click para ver os meus projectos atravÃ©s do data-layout
    $("body").on('click', "#contentor > div > div[data-layout='MenuGerirProjectos.html']", function () {
        var myID = userNumber;
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getProjects/" + myID,
            async: true,
            contentType: "application/json; charset=utf-8",
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



    $("body").on('click', 'a[href="#AbrirProj"]', function () {
        var idProj = $(this).data("idproj");
        tmpArrayProj[idProj] = tmpArrayProj[idProj].replace(/'/g, "");

        //verificar se o projecto existe no server
        socket.emit('reqHash', {
            id: idProj,
            username: username
        });

        hash = null;

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
            if (imgId != "userImage" && imgId != "image" && imgId != "add-Entity-Image") {
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
                if (idImg != "userImage" && idImg != "image") {
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

    /**
     * FunÃ§oes de logout -----------------------------------------------------------------------------------------------
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
    //************************************************
    //****Esconder botoes do menu*********************
    //************************************************
    $('#bt_PDF, #bt_PRE, #bt_HTML').css({
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
                    console.log($(this)[0].src);

                    socket.emit('user image', {
                        imageData: $(this)[0].src
                    });


                    textPdf += '<img src="http://localhost:8080/imgupload/img.jpg" >';
                    socket.emit('removeimage');

                    textPdf += "<div>" + $(this)[0].outerHTML + "</div>";
                    //teste imagem
                    //textPdf='<img src="https://valerianakamura.files.wordpress.com/2011/05/oti_imagem.jpg"/>';
                } else if (idDiv.indexOf("canvas") != -1) {
                    console.log($("#" + idDiv).parent().parent().attr('class').split(' ')[1] + " - " + hash["." + $("#" + idDiv).parent().parent().attr('class').split(' ')[1]]);

                    textPdf += "<div>" + hash["." + $("#" + idDiv).parent().parent().attr('class').split(' ')[1]].modelo.arrayElem[this.id].drawObj.getImgCanvas() + "</div>";

                }
            });
            //alert("PDF Criado")
        });

        // var doc =jsPDF();
        //  doc.output("./Livro.pdf")

        console.log(textPdf);

        //PDF NO SERVIDOR
        socket.emit("convertToPdf", textPdf, "Livro.pdf");
    });


    // *******************************************************************
    // BotÃ£o de HTML
    // *******************************************************************

    $('#bt_HTML').click(function () {
        var textPdf = "";
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
                    socket.emit("reqCanvasIMG", {
                        Pid: hash[kk[0]].projID,
                        parent: idToll,
                        id: "tab" + tabNumber + "-Mycanvas"
                    });
                    socket.on("getCanvasIMG", function (data) {
                        var canvas = document.createElement("canvas");
                        var ctx = canvas.getContext("2d");
                        var image = new Image();

                        console.log("ola");
                        console.log(data.canvas);

                        //  Draw imgCnv = data.canvas;
                        var imgCnv = data.canvas;
                        if (typeof this.ArrayCanvasImage != "undefined") {
                            //desenha o fundo
                            ctx.drawImage(imgCnv.bgImg, 0, 0);
                            //percorre todos os canvas e desenha num unico canvas
                            for (var i in  imgCnv.ArrayCanvasImage) {
                                var canvas2 = imgCnv.ArrayCanvasImage[i];
                                ctx.drawImage(canvas2.toDataURL("image/png"), 0, 0);
                            }
                            image.src = canvas2.toDataURL("image/png");
                            console.log(image);
                        }
                    });
                    page += "<div>" + drawCanvas.drawObj.getImgCanvas() + "</div>";
                }
            });
            pages.push(page);
        });
        pages.pop();
//        console.log(usercontributes);
        $("body").append(wait);
        $.ajax({
            type: "POST",
            url: "/saveContributes",
            data: {
                list: usercontributes
            },
            dataType: 'json',
            success: function (data) {
//                console.log(data);
                var tableusers = "<table>";
                tableusers += "<tr><th>Imagem</th><th>Nome</th></tr>";
                for (var i in data) {
                    tableusers += "<tr><td><img alt='' src='" + data[i].avatar + "'></td><td>" + data[i].nome + "</td></tr>";
                }
                tableusers += "</table>";
                pages.push("<div>" + tableusers + "</div>");
                socket.emit("saveAsHtml", pages);
                window.open("./livro/Livro.html");
                $("body").find("#loading").remove();
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar o modelo selecionado.\n\Tente novamente.");
                console.log(JSON.stringify(error));
            }
        });
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

    $("#homemenu").click(function () {
        backArray.push("home");
        folderArray.push(listapages);
        currentPosition += 1;
        console.log(backArray);
        $('#bt_PDF, #bt_PRE, #bt_HTML').css({
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

    $(".fecharGaleria").click(function () {
        $("#divGaleria").animate({
            "left": "-30%"
        }, 1000, function () {
            $("#divGaleria").css({
                "visibility": "hidden"
            });
        });
    });

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
                $('#bt_PDF, #bt_PRE, #bt_HTML').css({
                    'visibility': "hidden"
                });
                LivroPoemas = new Array();
                carregarPaginasLogin(listapages);

            } else if (aux != "home" && aux != "") {
                addLayoutToDiv("#contentor", folderArray[currentPosition - 1], aux, socket);
            }
            console.log(backArray + " " + currentPosition);
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
        var formatText = JSON.stringify({
            "font-family": fontName,
            "font-size": $("body").find(".textResultado").css("font-size"),
            "text-align": $("body").find(".textResultado").css("text-align"),
            "color": $("body").find(".textResultado").css("color"),
            "background-color": $("body").find(".textResultado").css("background-color")
        });

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
                    $("body").find("#nomeProjeto").val("");
                    $("body").find("#ModeloSelectCapa").attr("src", "");
                    $("body").find("#ModeloSelectCapa").attr("data-model", "");
                    $("body").find("#ModeloSelectPagina").attr("src", "");
                    $("body").find("#ModeloSelectPagina").attr("data-model", "");
                    $("body").find("#textAjudaLivro").html("");
                    $("body").find(".textResultado").css({
                        "font-family": "Times New Roman",
                        "font-size": "14px",
                        "text-align": "left",
                        "color": "black",
                        "background-color": "transparent"
                    });
                } else {
                    alert("O nome do livro já existe na base da dados.")
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



    // carregar lista de alunos
    $("body").on("click", "#contentor > div > div[data-layout='MenuCriarProjectos.html']", function () {
        tmpModels = [];
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getAllAluno",
            contentType: "application/json; charset=utf-8",
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
            contentType: "application/json; charset=utf-8",
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

        //retirar a opcao por defeio
        //users = users.splice(1);

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
        console.log("Nome do novo Projeto:" + nomeProj + "\n id users:" + users + "\n ID do modelo:" + idmodel + "\nCapa:" + numCapa + "\t Pagina:" + numPagina);

        //Limpar hash local e do server
        hash = {};
        socket.emit('storedhash', {
            storedhash: hash
        });


        addLayoutToDiv("#contentor", "html_Work_Models", "Livro.html", null);

        var idNum = (Object.keys(hash).length + 1);
        $("body").append(wait);
        $.ajax({
            type: "GET",
            url: "/getCodTwoModels/" + numCapa + "/" + numPagina + "/" + idmodel,
            async: true,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {
                $("body").find("#loading").remove();
                for (var i in data) {
                    if (data[i].id == numCapa) {
                        Addtab(numCapa, idNum);
                        $(".txtTab" + idNum).html(data[i].htmltext);
                        refactorTab(numCapa, idNum, data[0].texto);
                        addtohash(idNum);

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
            },
            error: function (error) {
                $("body").find("#loading").remove();
                alert("Erro ao tentar carregar o modelo selecionado.\n\Tente novamente.");
                console.log(JSON.stringify(error));
            }
        });
    });


    $("body").on("click", "#btGuardarProjeto", function () {

        $("body").append(wait);
        var nomeP = $("#contentor").attr("NomeProj");
        var usersP = $("#contentor").attr("projuser").split(",");
        var idmodel = $("#contentor").attr("idmodel");
        var idTmp = userNumber;
        var textHelp = $("#divTxtAjuda").text();
        var typeP = $("#contentor").attr("tipoproj");
        var hashtoSave;


        hashtoSave = hash;

        for (var item in hashtoSave) {
            for (var elem in hashtoSave[item].modelo.arrayElem) {
                if (hashtoSave[item].modelo.arrayElem[elem].conteudo != "") {
                    var conteudo = hashtoSave[item].modelo.arrayElem[elem].conteudo;
                    var newchar = '\\"'
                    conteudo = conteudo.split('"').join(newchar);
                    newchar = '\\/'
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

                    console.log("id proj: " + data.toString().split("Ok")[1]);
                } else {
                    $("body").find("#loading").remove();
                    alert("O nome do livro já existe na base da dados.");
                }

                var data = {
                    folder: "Menu_Navegacao",
                    idtab: "",
                    idObj: ""
                };
//                    console.log("before getfiles2folderfunction");
                getFilesToFolder(socket, data);
            },
            error: function (error) {
                $("body").find("#loading").remove();
                console.log(JSON.stringify(error));
            }
        });
    });






    /*
     * Fim FunÃ§oes de logout -----------------------------------------------------------------------------------------------
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
 *
 
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
        contentType: "application/json; charset=utf-8",
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
 * @returns {undefined} */

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
        if ($(this).attr("id").match("tab" + tabNumber + "-canvasdr")) {

            tabTest.modelo.arrayElem[newElementID] = new Element(newElementID, "CANVAS");
            tabTest.modelo.arrayElem[newElementID].createCanvasObj(".txtTab" + idNum, "#tab" + idNum + "-tabpage", this.id);
            tabTest.modelo.arrayElem[newElementID].drawObj.init();

        } else if ($(this).attr("class").match("editable")) {
            tabTest.modelo.arrayElem[thID] = new Element(thID, thType);
            var txtedit = new TextEditor($(this).attr("id"), username, userColor, userNumber, userNumber);
            txtedit.styles(tabTest.styles);
            $(this).addClass(thID);
            tabTest.modelo.arrayElem[thID].editor = txtedit;
            tabTest.modelo.arrayElem[thID].editor.styles(tabTest.styles);

        } else {
            tabTest.modelo.arrayElem[thID] = new Element(thID, thType);
        }

    });
    hash[tabTest.id] = tabTest;
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
                        contentType: "application/json; charset=utf-8",
                        dataType: 'json',
                        success: function (data) {
                            if (data[0].tipo == "Livro" || data[0].tipo == "Poema") {
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


                                ///////////////////////
//                                if (ajudas.length > 0) {
//                                    var wordshelp = '<div class="help col-xs-4 col-sm-4 col-md-4 altura-poema" class="center-block" style="overflow-y: scroll;"> ' +
//                                            '<h1 class="text-center"> AJUDA </h1>' +
//                                            '<p>';
//                                    for (var i in ajudas) {
//                                        wordshelp += '<h3><span class="label label-info" style="float:left; margin: 3px;">' + ajudas[i] + '</span></h3>';
//                                    }
//                                    wordshelp += '</p></div>';
//                                    $("body").find("#page" + idNum).append(wordshelp);
//                                }
                                //////////////////////7

                                $(".containerTxtAjuda").animate({
                                    opacity: 1,
                                }, 1000, function () {
                                    // Animation complete.
                                });
                            }

                        },
                        error: function (error) {
                            console.log(JSON.stringify(error));
                        }
                    });
                }

                $('#bt_PDF').css({
                    'visibility': "visible"
                });
                $('#bt_PRE').css({
                    'visibility': "visible"
                });
                $('#bt_HTML').css({
                    'visibility': "visible"
                });
                break;
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
            case "CriarPoema.html":

                break;


                /**
                 * -----------------------------------------------------------BACKOFFICE--------------------------------------------------------------
                 */

                //-------------------------------GERIR-----------------------------------------

            case "GerirAluno.html":
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
                break;

            case "GerirProfessor.html":
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
                                    '<td class="image"><img class="text-center image" rel=' + data[i].id + ' src="../img/delete_40.png"></td>' +
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
                                    '<td class="image"><img class="text-center image" rel=' + data[i].id + ' src="../img/delete_40.png"></td>' +
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
                break;

            default:
                $('#bt_PDF').css({
                    'visibility': "hidden"
                });
                $('#bt_PRE').css({
                    'visibility': "hidden"
                });
                $('#bt_HTML').css({
                    'visibility': "hidden"
                });
                break;
        }
    });
}



function validacaoFormAll(){
    
     $("body").find('.validForm').bootstrapValidator({
             feedbackIcons: {
                 valid: 'glyphicon glyphicon-ok',
                 invalid: 'glyphicon glyphicon-remove',
                 validating: 'glyphicon glyphicon-refresh'
             },
             locale: 'pt_PT',
             fields: {
                 input_username: {
                     validators: {
                         stringLength: {
                             min: 3,
                             max: 20,
                         },
                         notEmpty: {}
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
                         notEmpty: {},
                         regexp: {
                             regexp: /^[a-z\s]+$/i,
                         }
                     }
                 },
                 input_email: {
                      validators: {
                         emailAddress: {},
                         notEmpty: {}
                      }
                 },
                 input_numero: {
                     validators: {
                         notEmpty: {},
                         between : {
                             min: 2,
                             max: 50
                         }
                     }
                 },
                 input_morada: {
                     validators: {
                         notEmpty: {},
                         stringLength : {
                             min: 3,
                             max: 30
                         }
                     }
                 },
                 input_contacto: {
                     validators: {
                         notEmpty: {},
                         numeric : {},
                         between : {
                             min: 210000000,
                             max: 999999999
                         }
                     }
                 }, 
                 select_choise: {
                     validators: {
                         notEmpty: {}
                     }
                 }
             }
         })
}


/**
 * Ajusta os elementos do ecram principal
 
 * @returns {undefined} */
function ajustElements() {
    $("#contentor").css({
        height: $(window).height() * 0.89
    });
}