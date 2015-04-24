var users = [];
var numUsers = 0;
var socket = "";
var username = "";
var objectCanvas = null;
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
            socket.emit("myname", username);
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

    $(document.body).on('click', '#closePallet', function () {
        var idToll = $(document.body).find("#toolbar").attr("data-idPai");
        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(idToll);
        } else {
            if (objectCanvas.id === idToll) {
                objectCanvas.drawpbj.setPalletOff();
                $(document.body).find("#toolbar").remove();
            }
            else {
                objectCanvas = getArrayDrawObj(idToll);

            }
        }
    });

    $(document.body).on('click', '.color_canvas', function (e) {
        var idToll = $("body").find("#toolbar").attr("data-idPai");
        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(idToll);
        } else {
            if (objectCanvas.id === idToll) {
                if ($(this).attr("id") !== "sizecur") {
                    objectCanvas.drawpbj.setColor($(this).attr("id"));
                    objectCanvas.drawpbj.setPalletOff();
                    $("body").find("#toolbar").remove();
                } else if ($(this).attr("id") === "sizecur") {
                    objectCanvas.drawpbj.setSizePensil($("#sizecur option:selected").text());

//                    $("body").find("#toolbar").remove();
                }

            }
            else {
                objectCanvas = getArrayDrawObj(idToll);
            }
        }
    });


    $(document.body).on('mousedown mousemove mouseup', "canvas", function (e) {
        $(this).on("contextmenu", function () {
            return false;
        });
        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(this.id);
        } else {
            if (objectCanvas.id === this.id) {
                switch (event.which) {
                    case 1:
                        var offset, type, x, y;
                        type = e.handleObj.type;
                        offset = $(this).offset();
                        e.offsetX = e.clientX - offset.left;
                        e.offsetY = e.clientY - offset.top;
                        x = e.offsetX;
                        y = e.offsetY;
                        objectCanvas.drawpbj.draw(x, y, type);
                        if (objectCanvas.drawpbj.getFlag()) {
                            socket.emit('drawClick', {
                                id: this.id,
                                x: x,
                                y: y,
                                type: type
                            });
                        }
//                        alert('Left Mouse button pressed.');
                        break;
                    case 2:
//                        alert('Middle Mouse button pressed.');
                        break;
                    case 3:
                        objectCanvas.drawpbj.setPallet(e.pageX, e.pageY, this.id);
//                        alert('Right Mouse button pressed.');
                        break;
                    default:
//                        alert('You have a strange Mouse!');
                }

            } else {
                objectCanvas = getArrayDrawObj(this.id);
            }
        }
    });

    socket.on('draw', function (data) {
        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(this.id);
        } else {
            if (objectCanvas.id === data.id) {
                console.log(" X: " + data.x + " Y: " + data.y + " type: " + data.type);
                objectCanvas.drawpbj.draw(data.x, data.y, data.type);
            } else {
                objectCanvas = getArrayDrawObj(this.id);
            }
        }
    });

    // recebe as cordenadas dos outros utilizadores e movimenta a label dele
    // conforme as coordenadas recebidas
    socket.on('useron', function (data, port, socketid) {
        if (data !== "") {
            if (typeof users[socketid] === "undefined") {
                users[socketid] = new Client($("#" + socketid), data, port, socketid);
                $("#listaUsers").append(
                        "<p class='" +
                        socketid +
                        "'><img class='imguser' src='./img/user.png'>" +
                        data +
                        "</p>");
                toastr.success(data, 'Online');
                users[socketid].setName(data);
            } else {
                users[socketid].setSocketId(socketid);
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
                Addtab(tabsID, data.id);
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
    $(document.body).on('click', ".btnmodels", function () {
        Addtab(tabsID, $(this).data('model'));
        $("#li-last").attr('class', '');
        socket.emit('TabsChanged', {
            //remover ou adicionar
            op: "adicionar",
            //id
            id: "msg" + (tabsID.length),
            pos: tabsID.length
        });
        $(document.body).find("#divchangemodel").remove();
        // Foco na ultima pagina adicionada
        $(document.body).find("a[href^='#page']:last").click();
    });
    // Evento "click" no separador "+ Pág."
    $('#tabs a[href="#add-page"]').on('click', function () {
// Conta quantos <li>(separadores) hÃ¡ (menos 1 por causa do separador "+ PÃ¡g")
// Conta quantos <li>(separadores) hÃ¡ (menos 1 por causa do separador "+ PÃ¡g")

        $.ajax({
            url: "/models", // this is just a url that is responsible to return files list 
            success: function (data) {
                var htmlModel = "<div id='divchangemodel'>" +
                        "<div><div><input id='btncancelmodels' type='button' value='Cancel'></div><div>";

                for (var i = 0, max = data.length; i < max; i++) {
                    var file = data[i];
                    htmlModel += "<figure>" +
                            "<img class='btnmodels' alt='Capa' src='../img/" + file.split(".")[0] + ".png' data-model='" + file + "'/>" +
                            "<figcaption> " + file.split(".")[0] + " </figcaption>" +
                            "</figure>";
                }
                htmlModel += "</div></div></div>";
                $("body").append(htmlModel);
            }
        });

    });
    $(document.body).on('click', '#btncancelmodels', function () {
        $(document.body).find("#divchangemodel").remove();
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
