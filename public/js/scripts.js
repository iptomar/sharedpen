/**
 * 
 * Scrip com as Funçoes de autenticação, tabs e modelos, desenho, chat, e cor de background
 */


var users = [];             // array com os clientes ligado
var numUsers = 0;
var socket = "";            // socket de comunicacao
var username = "";          // nome do utilizador ligado
var objectCanvas = null;    // canvas atual em utilizacao
var canvasObj = [];         // array com os carios canvas
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

$(document).ready(function () {

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
    $("body").on('click', '#closePallet', function () {
        var idToll = $("body").find("#toolbar").attr("data-idPai");
        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(canvasObj, idToll);
        } else {
            if (objectCanvas.id === idToll) {
                objectCanvas.drawpbj.setPalletOff();
                $("body").find("#toolbar").remove();
            }
            else {
                objectCanvas = getArrayDrawObj(canvasObj, idToll);

            }
        }
    });

    /**
     * Evento de selecao da cor para desenhar no canvas
     */
    $("body").on('click', '.color_canvas', function () {
        var idToll = $("body").find("#toolbar").attr("data-idPai");
        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(canvasObj, idToll);
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
                objectCanvas = getArrayDrawObj(canvasObj, idToll);
            }
        }
    });

    /**
     * evento do socket para desenhar o que recebe pelo socket
     */
    socket.on('draw', function (data) {

        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(canvasObj, data.data.id);
        } else {
            if (objectCanvas.id === data.data.id) {
                objectCanvas.drawpbj.drawOtherUser(
                        data.data.color,
                        data.data.sizeCursor,
                        data.data.x,
                        data.data.y,
                        data.data.type);
            } else {
                objectCanvas = getArrayDrawObj(canvasObj, data.data.id);
            }
        }
    });

    /**
     * Eventos do mouse para desenhar no canvas
     */
    $("body").on('mousedown mousemove mouseup', "canvas", function (e) {
        $(this).on("contextmenu", function () {
            return false;
        });
        if (objectCanvas === null) {
            objectCanvas = getArrayDrawObj(canvasObj, this.id);
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
                        socket.emit('drawClick', {
                            id: this.id,
                            x: x,
                            y: y,
                            type: type,
                            color: objectCanvas.drawpbj.getColor(),
                            sizeCursor: objectCanvas.drawpbj.getSizeCursor()
                        });
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
                objectCanvas = getArrayDrawObj(canvasObj, this.id);
            }
        }
    });

    /*
     * Funçoes relacionadas com as cores --------------------------------------------------------------------------------
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
        hash = data.tabsHash;

        var i = 0;
        for (var key in hash) {
            i++;
            Addtab(hash[key].nomeModelo, i);

            updateTab(i, key);
        }
    });

    /**
     *  envia o codigo ASCII do backspace e do delete
     */

    // *******************************************************************
    // dados enviadas pelo socket para o servidor
    // *******************************************************************
    // envia o codigo ASCII do backspace e do delete
    $("body").on('keydown', '.editable', function (event) {
        if (event.which === 8 || event.which === 46) {
            socket.emit('msgappend', {
                'char': event.which,
                'pos': $("#" + $(this).attr('id')).getCursorPosition(),
                'id': "#" + $(this).attr('id'),
                'parent': $(this).parent().parent().attr('class').split(' ')[1]
            });
        }
    });
    // envia o codigo ASCII das teclas carregadas
    $("body").on('keypress', '.editable', function (event) {
        socket.emit('msgappend', {
            'char': event.which,
            'pos': $("#" + $(this).attr('id')).getCursorPosition(),
            'id': "#" + $(this).attr('id'),
            'parent': $(this).parent().parent().attr('class').split(' ')[1]
        });
    });

    /**
     * Evento gerado quando ha alteraçoes nas tabs
     */
    socket.on("TabsChanged", function (data) {
        if ($.trim(username) !== "") {
            if (data.op === "remover") {
                removeTab(data.id);
            } else {
                Addtab(data.modelo, data.pos);
                $(".txtTab" + data.pos).load("./html_models/" + data.modelo, function () {
                    refactorTab(data.modelo, data.pos);
                    addtohash(data.pos);

                });
            }
        }
    });
    /**
     * Evento que determina qual e o modelo escolhido
     */
    $("body").on('click', ".btnmodels", function () {

        var modelo = $(this).data('model');
        var idNum = (Object.keys(hash).length + 1);
        //cria uma nova tab e adaciona-a ao array       
        Addtab(modelo, idNum);

        $(".txtTab" + idNum).load("./html_models/" + modelo, function () {

            refactorTab(modelo, idNum);
            addtohash(idNum);

            socket.emit('TabsChanged', {
                //remover ou adicionar
                op: "adicionar",
                //tab
                tab: tabTest,
                //posiçao
                pos: (Object.keys(hash).length),
                //modelo
                modelo: modelo,
                //numero de elementos do modelo
                noEl: $(".txtTab" + (hash.length + 1)).children('div').children().length
            });
            $("body").find("#divchangemodel").remove();
            // Foco na ultima pagina adicionada
            $("body").find("a[href^='#page']:last").click();
        });
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
    $("body").on('click', '.xtab', function (event) {
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

    $("body").on('click', '#btncancelmodels', function () {
        $("body").find("#divchangemodel").remove();
    });

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
     * Funcoes para drag and drop de imagens -----------------------------------------
     */

    $("body").on('change', 'input[type=file]', function (e) {
        var imgId = $(this).next().attr("id");
        var file = e.originalEvent.target.files[0],
                reader = new FileReader(file);
        reader.onload = function (evt) {
            $("body").find('#' + imgId).attr('src', evt.target.result);
            // envia as informacoes da nova imagem para os outros clientes
            socket.emit('user image', {
                id: imgId,
                name: file.name,
                'imageData': evt.target.result
            });
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
                }
                else if (errMessage == 1) {
                    alert('Stop it! Images only!');
                    ++errMessage
                }
                else if (errMessage == 2) {
                    alert("Can't you read?! Images only!");
                    ++errMessage
                }
                else if (errMessage == 3) {
                    alert("Fine! Keep dropping non-images.");
                    errMessage = 0;
                }
                return false;
            }

            var reader = new FileReader(file);
            reader.onload = function (evt) {
                // envia as informacoes da nova imagem para os outros clientes
                socket.emit('user image', {
                    id: idImg,
                    name: file.name,
                    'imageData': evt.target.result
                });
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
     * Funçoes de logout -----------------------------------------------------------------------------------------------
     */
    /**
     * recebe o evento do socket com o socket id do cliente que se desligou
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

/*
 * Funções relacionas com as Tabs e modelos --------------------------------------------------------------------------------
 */

/**
 * Poe o modelo no Html
 
 * @param {type} i
 * @param {type} key
 * @returns {undefined} */
function updateTab(i, key) {
    $(".txtTab" + i).load("./html_models/" + hash[key].nomeModelo, function () {
        refactorTab(hash[key].nomeModelo, i);
        for (var elemento in hash[key].modelo.arrayElem) {
            $("#" + hash[key].modelo.arrayElem[elemento].id).val(hash[key].modelo.arrayElem[elemento].conteudo);
        }
    });
}


/**
 *  Adiciona a tab ao Html
 * @param {type} html
 * @param {type} idNum
 * @returns {undefined} */
function Addtab(html, idNum) {
    //var idNum = (Object.keys(hash).length + 1);
    // Adiciona um separador antes do Ãºltimo (linha <li></li> antes do last-child)
    $('ul#tabs li:last-child').before(
            '<li id="li' +
            (idNum) +
            '"><a href="#page' +
            (idNum) +
            '" role="tab" data-toggle="tab">Página ' +
            (idNum) +
            ' <button type="button" id=' +
            (idNum) +
            ' class="btn btn-warning btn-xs xtab"><span>x</span></button></a>');

    // Adiciona a pÃ¡gina depois da Ãºltima pÃ¡gina (<div></div> markup after the last-child of the <div class="tab-content">)
    $('div.tab-content').append(
            '<div class="tab-pane fade" id="page' + idNum +
            '"><div class="txtTab txtTab' + idNum + '"></div>' +
            '</div>');



    // refactorTab(html, idNum);
}

/**
 * Função que carrega o modelo para a tab e altera os id's de toda a tab 
 * para id's relacionados com o numero da tab
 
 * @param {type} html   pagina html a ser carregada
 * @param {type} idNum  numeor da tab para alterar os id's da tab
 * @returns {undefined} */

function refactorTab(html, idNum) {
    //depois de carregar o html, vai buscar o numero de filhos q a div tem
    var numElements = $(".txtTab" + (idNum)).children('div').children().length;
    //cria tab no array
    tabTest = new Tab(".txtTab" + (idNum), numElements, html);
    var i = 0;
    $(".txtTab" + idNum).children('div').attr("id", "tab" + idNum + "-" + $(".txtTab" + idNum).children('div').attr('id'));

    $(".txtTab" + idNum).children('div').children().each(function () {

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
        i++;
    });
    $(".txtTab" + idNum).css({
        height: $("#contentor").height() * 0.82
    });
      //  TinyMCE -- Incialização
    tinymce.init({
        selector: "div#tab"+idNum+"-tabpage",
        menubar:false
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
        tabTest.modelo.arrayElem[thID] = new Element(thID);
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
        if ($(this).attr('id') !== $('div.tab-content div#page' + liElem)) {
            $(this).attr('id', "page" + (i + 1));

            var classs = $(this).children('div').attr('class').replace(/[0-9]/, (i + 1));
            ;
            $(this).children('div').attr('class', classs);
            $(this).children('div').children().find('*').each(function () {
                //muda o id
                var id = $(this).attr('id').replace(/[0-9]/, (i + 1));
                //coloca outro id
                $(this).attr('id', id);

            });
            $(this).children('textarea').attr('id', "msg" + (i + 1));
            i++;
        }

    });

    // activa a tab anterior no caso de a actual ser eliminada
    if (liElem > 1 && $("#li" + liElem).attr('class') === "active") {
        $("body").find("a[href='#page" + (liElem - 1) + "']:last").click();
    }
    refactorHash(liElem);

}


/**
 * Função para reorganizar o hash
 
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
            if ((i + 1) >= id)
                delete hash1[newId].modelo.arrayElem[elemento];
        }
        i++;
    }
    hash = hash1;
    for (var key in hash) {
        console.log(hash[key].modelo.arrayElem);
    }
}
/**
 * Função que recebe um array a uma chave e devolve o objeto dessa posição se 
 * existir e não nulkl
 
 * @param {type} array  array para a pesquisa
 * @param {type} id     valor a ser encontrado
 * @returns {value} */
function getArrayDrawObj(array, id) {
    var a = null;
    $.each(array, function (index, value) {
        if (value.id === id) {
            a = value;
        }
    });
    return a;
}

/**
 * Ajusta os elementos do ecram principal
 
 * @returns {undefined} */
function ajustElements() {
    $("#contentor").css({
        height: $(window).height() * 0.90
    });
}