/**
 * 
 * Scrip com as Funçoes de autenticação, tabs e modelos, desenho, chat, e cor de background
 */


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


    /**
     * Funções relacionadas com a autenticação --------------------------------------------------------------------
     */

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












    
    /**
     * Funções relacionadas com o desenho -------------------------------------------------------------------------
     */
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

    






    /*
     * Funçoes relacionadas com as cores --------------------------------------------------------------------------------
     */

     /**
      * Evento onChange a cor de fundo
      */
    $("#colorpicker").change(function () {
        socket.emit('setcolor', {
            cor: $(this).find('option:selected').val()
        });
    });
    
    /**
     * Evento gerado quando recebe uma alteraçao de cores
     */
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

     /*
     * Funções relacionas com as Tabs e modelos --------------------------------------------------------------------------------
     */
    
    function actulizaTabs(tabsTxt, tabsID) {
    var tamanho = tabsID.length;
    for (i = 0; i < tamanho; i++) {
        var idd = "#" + Addtab(tabsID);
        $(idd).val(tabsTxt[i]);
    }
}
function Addtab(tabsID, html) {

    // Conta quantos <li>(separadores) hÃ¡ (menos 1 por causa do separador "+ PÃ¡g")
    tabsID.length = ($('ul#tabs li').length) - 1;

    // Adiciona um separador antes do Ãºltimo (linha <li></li> antes do last-child)
    $('ul#tabs li:last-child').before(
            '<li id="li' +
            (tabsID.length + 1) +
            '"><a href="#page' +
            (tabsID.length + 1) +
            '" role="tab" data-toggle="tab">Página ' +
            (tabsID.length + 1) +
            ' <button type="button" id=' +
            (tabsID.length + 1) +
            ' class="btn btn-warning btn-xs xtab"><span>x</span></button></a>');

    var idNum = (tabsID.length + 1);
    // Adiciona a pÃ¡gina depois da Ãºltima pÃ¡gina (<div></div> markup after the last-child of the <div class="tab-content">)
    $('div.tab-content').append(
            '<div class="tab-pane fade" id="page' + idNum +
            '"><div class="txtTab txtTab' + idNum + '"></div>' +
            '</div>');

    refactorTab(html, idNum);

    $(".txtTab" + idNum).css({
        height: $("#contentor").height() * 0.82
    });

    return tabsID[tabsID.length] = "msg" + (tabsID.length + 1);
}

function refactorTab(html, idNum) {
    $.get("./html_models/" + html, function (data) {
        $(".txtTab" + idNum).html(data);

        $(".txtTab" + idNum).children('div').each(function () {
            $(this).attr("id", "tab" + idNum + "-" + this.id);
            $(this).children().each(function () {
                $(this).attr("id", "tab" + idNum + "-" + this.id);
                if ($(this).get(0).tagName === "CANVAS") {
                    var drawimg = new Draw(".txtTab" + idNum, "#tab" + idNum + "-tabpage", this.id);
                    drawimg.init();
                    var obj = {
                        id: this.id,
                        drawpbj: drawimg
                    };
                    canvasObj.push(obj);
                }
            });
        });
    });
}

function removeTab(tabsID, liElem) { // FunÃ§Ã£o que remove separador com o numero de <li>

    $('ul#tabs > li#li' + liElem).fadeOut(1000, function () {
        $(this).remove(); // Apaga o <li></li>(separador) com um efeito fadeout
    });
    // TambÃ©m apaga o <div>(pÃ¡gina) correta dentro de <div class="tab-content">
    $('div.tab-content div#page' + liElem).remove();
    var i = 1;

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
    var i = 0;
    $('.tab-content').children('div').each(function () {

        if ($(this).attr('id') != $('div.tab-content div#page' + liElem)) {
            $(this).attr('id', "page" + (i + 1));
            $(this).children('textarea').attr('id', "msg" + (i + 1));
            i++;
        }
    });


    // activa a tab anterior no caso de a actual ser eliminada
    if (liElem > 1 && $("#li" + liElem).attr('class') === "active") {
        $(document.body).find("a[href='#page" + (liElem - 1) + "']:last").click();
    }

    delete tabsID[tabsID.indexOf("msg" + liElem)];
}
    
    
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
/**
 * Evento gerado quando um utilizador se connecta, coloca as tabs
 */
    socket.on('NewTabs', function (data) {
        tabsID = data.id;
        tabsTxt = data.txt;
        actulizaTabs(tabsTxt, tabsID);
    });
    
    /**
     *  envia o codigo ASCII do backspace e do delete
     */

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
    
    /**
     * Evento gerado quando ha alteraçoes nas tabs
     */
    socket.on("TabsChanged", function (data) {
        if ($.trim(username) !== "") {
            if (data.op === "remover") {
                removeTab(tabsID, data.id);
            } else {
                Addtab(tabsID, data.id);
            }
        }
    });
    
   /**
    * Recebe as Tabs quando se connecta
    */ 
    socket.on('Tabs', function (data) {
        tabsID = data.id;
        tabsTxt = data.txt;
        actulizaTabs(tabsTxt, tabsID);
    });
    
    /**
     * Evento que determina qual e o modelo escolhido
     */
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
    
    /**
     * Evento onClik que gera a criaçao de uma nova Tab e respectivo modelo
     */
    $('#tabs a[href="#add-page"]').on('click', function () {
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

    /**
     * Funçao que remove tabs
     */
    $(document.body).on('click', '.xtab', function (event) {
        liElem = $(this).attr('id');
        // Mostra "Tem a certeza que quer apagar?" e espera que se carregue em "Ok"
        if (confirm("Tem a certeza que quer apagar?")) { 
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
    
    $(document.body).on('click', '#btncancelmodels', function () {
        $(document.body).find("#divchangemodel").remove();
    });
     /*
     * Fim Funções relacionas com as Tabs ----------------------------------------------------------------------------------
     */   
    
    /*
     * Funções relacionas com o Chat ---------------------------------------------------------------------------------------
     */
    
    /**
     * Evento gerado quando um utilizador manda mensagem no chat
     */
    socket.on('message', function (data) {
        $('#panelChat').addNewText(data.user, data.data);
        $('#panelChat').animate({
            scrollTop: $('#panelChat').prop("scrollHeight")
        }, 500);
    });
    /**
     * Função para enviar uma mensagem no chat
     */
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
    /**
     * Função para enviar mensagem com o enter
     */
    $('#msgChat').keydown(function (e) {
        if (e.keyCode === 13) {
            $('#btnSendChat').click();
        }
    });   
    /**
     * Evento gerado quando um utilizador se liga, recebe todas as mensagens do chat
     */
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
    
     /*
     * Fim Funções relacionas com o Chat -------------------------------------------------------------------------------
     */  
    
    
    /**
     * Funçoes de logout -----------------------------------------------------------------------------------------------
     */
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
    /**
     * Fim Funçoes de logout -----------------------------------------------------------------------------------------------
     */  
    
});

$(window).resize(function () {
    ajustElements();
});
