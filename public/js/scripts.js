/**
 * 
 * Scrip com as Funçoes de autenticação, tabs e modelos, desenho, chat, e cor de background
 */


var users = [];             // array com os clientes ligado
var numUsers = 0;
var socket = "";            // socket de comunicacao
var username = "";          // nome do utilizador ligado
var allTextEditor = [];     // array com todos os editores de texto
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
                    "<u><i><b>" +
                    username +
                    "</b></i></u>");
            socket.emit("myname", username);
            addLayoutToDiv("MenuPrincipal.html");
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
    /**
     * evento do socket para desenhar o que recebe pelo socket
     */
    socket.on('draw', function (data) {

        var cmvv = hash["." + data.data.parent].modelo.arrayElem[data.data.id].drawObj;
        cmvv.drawOtherUser(
                data.data.color,
                data.data.sizeCursor,
                data.data.x,
                data.data.y,
                data.data.type,
                data.data.socket,
                //envia a imagem 
                data.data.image
                );
    });

    /**
     * Eventos do mouse para desenhar no canvas
     */
    $("body").on('mousedown mousemove mouseup', "canvas", function (e) {
        var idToll = "." + $(this).parent().parent().attr('class').split(' ')[1];
        var thisId = $(this).attr('id');
        switch (e.which) {
            case 1:
                var offset, type, x, y;
                type = e.handleObj.type;
                offset = $(this).offset();
                e.offsetX = e.clientX - offset.left;
                e.offsetY = e.clientY - offset.top;
                x = e.offsetX;
                y = e.offsetY;
                var cmv = hash[idToll].modelo.arrayElem[thisId].drawObj;
                cmv.draw(x, y, type);
                // var ctx = c.getContext('2d');
                //var img = ctx.getImageData

                socket.emit('drawClick', {
                    id: this.id,
                    x: x,
                    y: y,
                    type: type,
                    color: hash[idToll].modelo.arrayElem[thisId].drawObj.getColor(),
                    sizeCursor: hash[idToll].modelo.arrayElem[thisId].drawObj.getSizeCursor(),
                    socket: socket.id,
                    canvas: hash[idToll].modelo.arrayElem[thisId].drawObj.getCanvas().toDataURL(),
                    parent: $(this).parent().parent().attr('class').split(' ')[1]
                });
//                        alert('Left Mouse button pressed.');
                break;
            case 2:
//                        alert('Middle Mouse button pressed.');
                break;
            case 3:
                $(this).contextMenu({
                    menuSelector: "#toolbar",
                    menuSelected: function (invokedOn, selectedMenu) {
                        switch (selectedMenu.data("tipo")) {
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
                            default:
                                break;
                        }
                    }
                });

                hash[idToll].modelo.arrayElem[thisId].drawObj.setPallet(idToll.replace(".", ""), thisId);
//                        alert('Right Mouse button pressed.');
                break;
            default:
//                        alert('You have a strange Mouse!');
        }

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
     * Funçoes relacionadas com as cores ----------------------------------------------------------------------
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
            $('body').css('background-image', 'url(../img/background.png)');
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

        switch (data.tipo) {
            case "IMG":
                $("body").find('#' + data.id).attr('src', data.imageData);
                break;
            default :
                var id = data.id;
                var str = $(id).val();
                var str1 = "";
                var posactual = $(id).getCursorPosition();
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
    $("body").on('keydown', '.editablee', function (event) {
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
    $("body").on('keypress', '.editablee', function (event) {
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
                hash[".txtTab" + data.pos] = castTab(data.tab);

                $(".txtTab" + data.pos).load("./html_models/" + data.modelo, function () {
                    updateTab(data.pos, ".txtTab" + data.pos);
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
            var firepadID = addtohash(idNum, false);
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
    $("body").on('click', '#tabs a[href="#add-page"]', function () {
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
    var countMsg = 0;
    socket.on('message', function (data) {
        $('#panelChat').addNewText(data.user, data.data);
        $('#panelChat').animate({
            scrollTop: $('#panelChat').prop("scrollHeight")
        }, 500);
        if ($("#divUsers").css("visibility") === "hidden") {
            $("#numMsg").html(++countMsg);
            $("#numMsg").css({
                visibility: "visible"
            });
        }
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
                    if ($("#divUsers").css("visibility") === "hidden") {
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
     * Fim Funções relacionas com o Chat -------------------------------------------------------------------------------
     */


    /**
     * Funcoes para drag and drop de imagens -----------------------------------------
     */

    $(".container-fluid").on('change', 'input[type=file]', function (e) {
        var imgId = $(this).next().attr("id");
        var file = e.originalEvent.target.files[0],
                reader = new FileReader(file);
        reader.onload = function (evt) {
            $("body").find('#' + imgId).attr('src', evt.target.result);
            // envia as informacoes da nova imagem para os outros clientes
            socket.emit('msgappend', {
                id: imgId,
                name: file.name,
                'imageData': evt.target.result,
                'tipo': $("body").find('#' + imgId).prop("tagName"),
                'parent': $("#" + imgId).parent().parent().attr('class').split(' ')[1]

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
                socket.emit('msgappend', {
                    id: idImg,
                    name: file.name,
                    'imageData': evt.target.result,
                    'tipo': $("body").find('#' + idImg).prop("tagName"),
                    'parent': $("#" + idImg).parent().parent().attr('class').split(' ')[1]
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



    // *******************************************************************
    // botao chat
    // *******************************************************************
    $('#bt_Chat').click(function () {
        if ($("#divUsers").css("visibility") === "hidden") {
            $("#divUsers").css({'visibility': "visible"});
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
                $("#divUsers").css({'visibility': "hidden"});
            });
        }

    });

    /**
     * 
     * 
     */

    $("body").on("click", ".menuBar", function () {
        addLayoutToDiv($(this).data("layout"), socket);
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


function castTab(tabToCast) {
    //Faz o cast da Tab, e todos os seus elementos
    var tab = $.extend(new Tab(), tabToCast);
    tab.modelo = $.extend(new Modelo(), tabToCast.modelo);
    for (var item in tabToCast.modelo.arrayElem) {
        tab.modelo.arrayElem[item] = $.extend(new Element(), tabToCast.modelo.arrayElem[item]);
        if (tab.modelo.arrayElem[item].elementType === "CANVAS") {
            tab.modelo.arrayElem[item].drawObj = $.extend(new Draw(), tabToCast.modelo.arrayElem[item].drawObj);
        }
    }
    return tab;
}


/**
 * Poe o modelo no Html
 
 * @param {type} i
 * @param {type} key
 * @returns {undefined} */
function updateTab(i, key) {
    $(".txtTab" + i).load("./html_models/" + hash[key].nomeModelo, function () {
        refactorTab(hash[key].nomeModelo, i);


        for (var elemento in hash[key].modelo.arrayElem) {

            switch (hash[key].modelo.arrayElem[elemento].elementType) {
                case "IMG":
                    $("body").find("#" + hash[key].modelo.arrayElem[elemento].id).attr('src', hash[key].modelo.arrayElem[elemento].conteudo);
                    break;
                case "CANVAS":
                    var cmv = $("#" + hash[key].modelo.arrayElem[elemento].id)[0];
                    var ctx = cmv.getContext('2d');
                    var img = document.createElement('img');
                    hash[key].modelo.arrayElem[elemento].drawObj.init();
                    if (typeof hash[key].modelo.arrayElem[elemento].canvas !== "undefined") {
                        img.src = hash[key].modelo.arrayElem[elemento].canvas;
                    }
                    ctx.drawImage(img, 0, 0);
                    break;
                default:
                    if ($("#" + elemento).attr('class').match('editable')) {
                        var txtedit = new TextEditor(elemento, hash[key].modelo.arrayElem[elemento].keyEditor);
                        txtedit.init();
                    }
                    $("#" + hash[key].modelo.arrayElem[elemento].id).val(hash[key].modelo.arrayElem[elemento].conteudo);
                    break;
            }

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

        if (thType === 'CANVAS') {
            tabTest.modelo.arrayElem[thID] = new Element(thID, thType);
            tabTest.modelo.arrayElem[thID].createCanvasObj(".txtTab" + idNum, "#tab" + idNum + "-tabpage", this.id);
            tabTest.modelo.arrayElem[thID].drawObj.init();

        } else if ($(this).attr("class").match("editable")) {
            var txtedit = new TextEditor($(this).attr("id"), "");
            txtedit.init();
            tabTest.modelo.arrayElem[thID] = new Element(thID, thType, txtedit.getKey() + "");
            var editTxt = {
                id: $(this).attr("id"),
                txtObjEditor: txtedit
            };
            allTextEditor.push(editTxt);
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
        if ($(this).attr('id') !== $('div.tab-content div#page' + liElem)) {
            $(this).attr('id', "page" + (i + 1));

            var classs = $(this).children('div').attr('class').replace(/[0-9]/, (i + 1));

            $(this).children('div').attr('class', classs);
            $(this).children('div').children().find('*').each(function () {
                //muda o id
                if (typeof $(this).attr('id') !== "undefined") {
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
            if (hash[key].modelo.arrayElem[elemento].elementType === "CANVAS") {
                hash1[newId].modelo.arrayElem[idd].drawObj.tabClass = hash[key].modelo.arrayElem[elemento].drawObj.tabClass.replace(/[0-9]/, (i + 1));
                hash1[newId].modelo.arrayElem[idd].drawObj.page = hash[key].modelo.arrayElem[elemento].drawObj.page.replace(/[0-9]/, (i + 1));
                hash1[newId].modelo.arrayElem[idd].drawObj.id = hash[key].modelo.arrayElem[elemento].drawObj.id.replace(/[0-9]/, (i + 1));
            }
            if ((i + 1) >= id)
                delete hash1[newId].modelo.arrayElem[elemento];
        }
        i++;
    }
    hash = hash1;
}

/**
 * Função que recebe um array a uma chave e devolve o objeto dessa posição se 
 * existir e não nulkl
 
 * @param {type} array  array para a pesquisa
 * @param {type} id     valor a ser encontrado
 * @returns {value} */
function getArrayElementObj(array, id) {
    var a = null;
    $.each(array, function (index, value) {
        if (value.id === id) {
            a = value;
        }
    });
    return a;
}

function addLayoutToDiv(layout, stk) {
    $("#contentor").load("./html_Work_Models/" + layout, function () {
        switch (layout) {
            case "Livro.html":
                stk.emit("getAllTabs");
                break;

            default:

                break;
        }
    });
}

/**
 * Ajusta os elementos do ecram principal
 
 * @returns {undefined} */
function ajustElements() {
    $("#contentor").css({
        height: $(window).height() * 0.91
    });
}