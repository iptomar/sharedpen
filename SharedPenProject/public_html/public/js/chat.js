var users = [];
var numUsers = 0;
var socket = "";
var username = "";
var listaColor = [
    ["default", "Default"],
    ["white", "Branco"],
    ["red", "Vermelho"],
    ["yellow", "Amarelo"],
    ["blue", "Azul"],
    ["pink", "Rosa"],
    ["green", "Verde"]
];

var tabsID = [];
var tabsTxt = [];

$(document).ready(function () {

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


    // cria a ligação com o servidor que disponibiliza o socket
    socket = io.connect(window.location.href);

    // Carrega o dropdown com a liosta das cores
    $('#colorpicker').addAllColors(listaColor);

    // coloca o cursor para introduzir o nome do utilizador
    $("#username").focus();

    // ao carregar em enter no nome do utilizador carrega no button
    $("#username").keydown(function (event) {
        if (event.keyCode === 13) {
            $("#startlogin").click();
        }
    });

    // evento de carregar no button para fazer o login
    $("#startlogin").click(function () {
        username = $("#username").val();
        if ($.trim(username) !== "") {
            $("#div-login").css({
                display: "none"
            });
            $("#contentor").css({
                display: "block"
            });
            $("#atualuser").html(
                    "Utilizador <u><i><b>" +
                    username +
                    "</b></i></u>");
            // envia o nome do utilizdore a posicao do mouse
            socket.emit('mouseMove', {
                'user': username,
                'x': 10000,
                'y': 10000
            });
            $("#msg1").focus();
        } else {
            $("#erro_name").html("Nome Incorreto!");
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
    });

    ajustElements();

    // *******************************************************************
    // dados enviadas pelo socket para o servidor
    // *******************************************************************
    // evia as cordenados do ponteiro do rato e do nome do utilizador
    $(window).on("mousemove", function (event) {
        socket.emit('mouseMove', {
            'user': username,
            'x': event.pageX,
            'y': event.pageY
        });
    });

    // envia o codigo ASCII do backspace e do delete
    $(document.body).on('keydown', '.txtTab', function (event) {
        if (event.which === 8 || event.which === 46) {
            socket.emit('msgappend', {
                'data': event.which,
                'pos': $("#" + $(this).attr('id')).getCursorPosition(),
                'id': "#" + $(this).attr('id')
            });
        }
    });

    // envia o codigo ASCII das teclas carregadas
    $(document.body).on('keypress', '.txtTab', function (event) {
        socket.emit('msgappend', {
            'char': event.which,
            'pos': $("#" + $(this).attr('id')).getCursorPosition(),
            'id': "#" + $(this).attr('id')
        });
    });

    // *******************************************************************
    // dados recebidos pelo socket para o browser
    // *******************************************************************
    // recebe o codigo ASCII da tecla recebida, converte-a para
    // carater e adiciona-o na posicao coreta
    socket.on('msgappend', function (data) {
        var id = data.id;
        var posactual = $(id).getCursorPosition();
        var str = $(id).val();
        var str1 = "";
        if (data.char === 8 /* backspace*/
                || data.char === 46 /* delete */) {
            if (data.char === 8) {
                if (data.pos > 0) {
                    str1 = str.slice(0, data.pos - 1) + str.slice(data.pos);
                } else {
                    str1 = str.slice(data.pos);
                }
            } else if (data.data === 46) {
                str1 = str.slice(0, data.pos) + str.slice(data.pos + 1);
            }
        } else {
            str1 = [str.slice(0, data.pos), String.fromCharCode(data.char), str.slice(data.pos)].join('');
        }
        $(id).val(str1);
        if (posactual < data.pos) {
            $(id).selectRange(posactual);
        } else {
            $(id).selectRange(posactual - 1);
        }
    });

// Recebe as Tabs quando se connecta
    socket.on('NewTabs', function (data) {
        tabsID = data.id;
        tabsTxt = data.txt;
        actulizaTabs(tabsTxt, tabsID);
    });

// envia o codigo ASCII do backspace e do delete
    $(document.body).on('keydown', '.txtTab', function (event) {
        if (event.which === 8 || event.which === 46) {
            socket.emit('msgappend', {
                'char': event.which,
                'pos': $("#" + $(this).attr('id')).getCursorPosition(),
                'id': "#" + $(this).attr('id')
            });
        }
    });

    // recebe as cordenadas dos outros utilizadores e movimenta a label dele
    // conforme as coordenadas recebidas
    socket.on('mouseMove', function (data, port, socketid) {
        if (data.user !== "") {
            if (typeof users[socketid] === "undefined") {
//                $("body").append(
//                        '<div id="' +
//                        socketid +
//                        '" class="div-main ' +
//                        socketid +
//                        '"><p class="name-user"></p></div>');
                users[socketid] = new Client($("#" + socketid), data.user, port, socketid);
                $("#listaUsers").append(
                        "<p class='" +
                        socketid +
                        "'><img class='imguser' src='./img/user.png'>" +
                        data.user +
                        "</p>");

                toastr.success(data.user, 'Online');
                users[socketid].setName(data.user);
            } else {
                users[socketid].setSocketId(socketid);
                users[socketid].setPosition(data.x, data.y);
            }
        }
    });

    // devolve para o servidor de todo o texto da textarea e da
    // posicao do mouse
    socket.on("requestOldText", function () {
        for (i = 0; i < tabsID.length; i++) {
            tabsTxt[i] = $("#" + tabsID[i]).val();
        }
        socket.emit('returnOldText', {
            id: tabsID,
            data: tabsTxt
        });
    });

    // atualiza a textarea com o texto ja existente na textarea dos
    // outro utilizadores
    socket.on("returnOldText", function (data) {
        $("#msg").html("");
        $("#msg").val(data.data);
    });

    socket.on("TabsChanged", function (data) {
        if ($.trim(username) !== "") {
            if (data.op === "remover") {
                removeTab(tabsID, data.id);
            } else {
                Addtab(tabsID);
            }
        }
    });


    socket.on("OldmsgChat", function (data) {
        $("#panelChat").html("");
        var aux = data.split(",");
        if (typeof aux[0] !== "undefined" && aux.length > 0) {
            for (var i = 0, max = aux.length; i < max; i++) {
                var aux2 = aux[i].split(":");
                if (typeof aux2[1] !== "undefined") {
                    $('#panelChat').addNewText(aux2[0], aux2[1].replace(",", ""));
                }
            }
        }
        $('#panelChat').animate({
            scrollTop: $('#panelChat').prop("scrollHeight")
        }, 500);
    });

    // Apaga a informacao referente ao utilizador que se desconectou
    socket.on('diconnected', function (socketid) {
        for (var item in users) {
            if (users[item].getSocketId() === socketid) {
                var numid = users[item].getdivid();
                toastr.warning(users[item].getUsername(), 'Offline');
                users.splice(users[item], 1);
                $("." + numid).remove();
            }
        }
    });

    //Para Chat
    socket.on('message', function (data) {
        $('#panelChat').addNewText(data.user, data.data);

//        $('#panelChat').val($('#panelChat').val() + data.user + " : " + data.data + '\n');
        $('#panelChat').animate({
            scrollTop: $('#panelChat').prop("scrollHeight")
        }, 500);
    });

    socket.on('getcolor', function (data) {
        if (data.cor === "default") {
            $('body').css('background-image', 'url(../img/bg.jpg)');
        } else {
            $("body").css('background-image', 'none');
            switch (data.cor) {
                case "white":
                    $("h1, h3").css({
                        color: "black"
                    });
                    break;
                default :
                    $("h1, h3").css({
                        color: "white"
                    });
                    break;
            }
            $("body").css("background-color", data.cor);
        }
        $("#colorpicker").val(data.cor);
    });

    // Recebe as Tabs quando se connecta
    socket.on('Tabs', function (data) {
        tabsID = data.id;
        tabsTxt = data.txt;
        actulizaTabs(tabsTxt, tabsID);
    });



    $('#btnSendChat').click(function () {
        var chatMessage = $('#msgChat').val();
        //limpa input
        if (chatMessage !== "")
            socket.emit('message', {
                'data': chatMessage,
                'user': username
            });
        $('#msgChat').val('');
    });

    $('#msgChat').keydown(function (e) {
        if (e.keyCode === 13) {
            $('#btnSendChat').click();
        }
    });

    $("#colorpicker").change(function () {
        socket.emit('setcolor', {
            cor: $(this).find('option:selected').val()
        });
    });

    // Evento "click" no separador "+ PÃ¡g."
    $('#tabs a[href="#add-page"]').on('click', function () {
        // Conta quantos <li>(separadores) hÃ¡ (menos 1 por causa do separador "+ PÃ¡g")
        Addtab(tabsID);
        $("#li-last").attr('class', '');
        socket.emit('TabsChanged', {
            //remover ou adicionar
            op: "adicionar",
            //id
            id: "msg" + (tabsID.length),
            pos: tabsID.length
        });
    });

    $(document.body).on('click', '.xtab', function (event) {
        liElem = $(this).attr('id');
        if (confirm("Tem a certeza que quer apagar?")) { // Mostra "Tem a certeza que quer apagar?" e espera que se carregue em "Ok"
            removeTab(tabsID, liElem);
            socket.emit('TabsChanged', {
                //remover ou adicionar
                op: "remover",
                //id
                id: liElem
            });
        }
        return false;
    });
});

$(window).resize(function () {
    ajustElements();
});
