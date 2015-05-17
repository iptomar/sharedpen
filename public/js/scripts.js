/**
 * 
 * Scrip com as Funçoes de autenticação, tabs e modelos, desenho, chat, e cor de background
 */


var users = [];             // array com os clientes ligado
var numUsers = 0;
var socket = "";            // socket de comunicacao
var username = "";          // nome do utilizador ligado
var userColor = "";
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

var LivroPoemas = new Array();

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
            userColor = hexToRgb(0, socket.id, username);
            var data = {
                folder: "html_Work_Models",
                idtab: "",
                idObj: ""
            };
            getFilesToFolder(socket, data);
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
        if (typeof hash["." + data.data.parent] !== "undefined") {
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
                    data.data.apagar
                    );
        }
    });
    /**
     * Eventos do mouse para desenhar no canvas
     */
    $("body").on('mousedown mousemove mouseup', "canvas", function (e) {
        var idToll = "." + $(this).parent().parent().parent().attr('class').split(' ')[1];
        var iddd = $(this).attr('id');
        var tabNumber = iddd.match(/\d+/)[0];
        var thisId = "tab" + tabNumber + "-Mycanvas";


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
                    parent: $(this).parent().parent().parent().attr('class').split(' ')[1]
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
                var idpai = data.parent;
                var html = data.html;

//                var idEditor = "note-editable_" + data.id;
//                if ($("#" + idEditor).is(":focus")) {
//                    var caret = showCaretPos(idEditor);
//                    var elem = getElementAtCaret(idEditor, caret);
//                    var posP = caret;
//                    setCaretAtEditor(idEditor, elem, posP);
//                }
                $("#" + id).code(html);
//                var id = data.id;
//                var str = $(id).val();
//                var str1 = "";
//                var posactual = $(id).getCursorPosition();
//                if (data.char === 8 /* backspace*/
//                        || data.char === 46 /* delete */) {
//
//                    if (data.char === 8) {
//
//                        if (data.pos > 0) {
//                            str1 = str.slice(0, data.pos - 1) + str.slice(data.pos);
//                        } else {
//                            str1 = str.slice(data.pos);
//                        }
//                    } else if (data.data === 46) {
//                        str1 = str.slice(0, data.pos) + str.slice(data.pos + 1);
//                    }
//                } else {
//                    str1 = [str.slice(0, data.pos), String.fromCharCode(data.char), str.slice(data.pos)].join('');
//                }
//                $(id).val(str1);
//                if (posactual < data.pos) {
//                    $(id).selectRange(posactual);
//                } else {
//                    $(id).selectRange(posactual - 1);
//                }
        }
    });
    /**
     * Evento gerado quando um utilizador se connecta, coloca as tabs
     */
    socket.on('NewTabs', function (data) {
        console.log(data.tabsHash);
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
    $("body").on('mousedown click', '.editable', function (e) {
        var edit;
        var tabContentor = $(this).parent().attr("id").split("-")[0];
        var listClass = $(this).attr("class").split(" ");
        for (var i = 0, max = listClass.length; i < max; i++) {
            if (listClass[i].indexOf(tabContentor) !== -1) {
                edit = getArrayElementObj(allTextEditor, listClass[i]);
                edit.txtObjEditor.setNewId($("." + listClass[i]).attr("id"));
            }
        }
        $(this).on("contextmenu", function () {
            return false;
        });
        switch (e.which) {
            case 1:
                //                alert('Left Mouse button pressed.');
                break;
            case 2:
                //                alert('Middle Mouse button pressed.');
                break;
            case 3:
                //                edit.txtObjEditor.showToolbar();
                //                console.log('Right Mouse button pressed.');
                break;
            default:
                //                alert('You have a strange Mouse!');
        }
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
    $("body").on('click', 'a[href="#add-page"]', function () {
        var data = {
            folder: "html_models",
            idtab: "",
            idObj: ""
        };
        getFilesToFolder(socket, data);
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
    //************************************************
    //****Esconder botoes do menu*********************
    //************************************************
    $('#bt_PDF').css({'visibility': "hidden"});
    $('#bt_PRE').css({'visibility': "hidden"});
    // *******************************************************************
    // Botao do pdf, Botao do Pre-visualizar
    // *******************************************************************

    $('#bt_PRE, #bt_PDF').click(function () {
        var textPdf = "";
        $('#tabs > li > a').each(function () {
            $($(this).attr("href")).children().children().children().each(function () {
                var idDiv = this.id;
                if (idDiv.indexOf("input") !== -1) {
                    var a = getArrayElementObj(allTextEditor, $(this).attr("id"));
                    textPdf += a.txtObjEditor.getTextEditor();
                } else if (idDiv.indexOf("image") !== -1) {
                    textPdf += "<div>" + $(this)[0].outerHTML + "</div>";
                } else if (idDiv.indexOf("canvas") !== -1) {
                    console.log($("#" + idDiv).parent().parent().attr('class').split(' ')[1] + " - " + hash["." + $("#" + idDiv).parent().parent().attr('class').split(' ')[1]]);
                    textPdf += "<div>" + "<img alt='' src=" + hash["." + $("#" + idDiv).parent().parent().attr('class').split(' ')[1]].modelo.arrayElem[this.id].drawObj.getImgCanvas() + "></div>";
                }
            });
            //            alert("New Page")
        });
        console.log(textPdf);
        socket.emit("convertToPdf", textPdf, "Livro.pdf");
        //       var a = getArrayElementObj(allTextEditor, "tab1-input1");
        //        alert(a.txtObjEditor.getTextEditor());
        //
        //        var doc = new jsPDF();
        //
        //        var specialElementHandlers = {
        //            'div': function (element, renderer) {
        //                return true;
        //            }
        //        };


        //        doc.fromHTML(textPdf, 15, 15, {
        //            'width': 170, 'elementHandlers': specialElementHandlers
        //        });
        //        if (this.id === "bt_PDF") {
        //            doc.save("Livro.pdf");
        //        } else {
        //            doc.output("dataurlnewwindow");
        //        }
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

    $("body").on("click", ".imageGaleria", function () {
        var Thid = $(this).attr('data-idpai').replace(".", "");
        var cnv = $(this).attr('data-idcnv');
        var imgSrc = $(this).children("img").attr("src");
        var imgData = getBase64Image(imgSrc);
        hash["." + Thid].modelo.arrayElem[cnv].drawObj.imageCanvas(imgData);
        socket.emit('drawClick', {
            id: cnv,
            type: "backgoundImage",
            color: hash["." + Thid].modelo.arrayElem[cnv].drawObj.getColor(),
            sizeCursor: hash["." + Thid].modelo.arrayElem[cnv].drawObj.getSizeCursor(),
            socket: socket.id,
            canvas: imgSrc,
            parent: Thid,
            image: imgData
        });
        $("#divGaleria").animate({
            "left": "-30%"
        }, 1000, function () {
            $("#divGaleria").css({"visibility": "hidden"});
        });
    });

    $("#homemenu").click(function () {
        $('#bt_PDF').css({'visibility': "hidden"});
        $('#bt_PRE').css({'visibility': "hidden"});
        var data = {
            folder: "html_Work_Models",
            idtab: "",
            idObj: ""
        };
        getFilesToFolder(socket, data);
    });

    //******************************************************************
    // Recebe a lista de ficheiros de uma determinada pasta
    //******************************************************************
    socket.on("files2folder", function (data, dataVals) {
        //Verifica se esta' a receber imagens de um certo tema
        switch (dataVals.folder) {
            case "galeria":
                if ($("#divGaleria").css("visibility") === "hidden") {
                    var imgList = '<div class="col-xs-12 col-sm-12 col-md-12">';
                    for (var i = 0, max = data.length; i < max; i++) {
                        imgList += '<div class="imageGaleria col-xs-4 col-sm-4 col-md-4 image" data-idpai="' + dataVals.idtab + '" data-idcnv="' + dataVals.idObj + '">';
                        imgList += '<img src="./' + dataVals.folder + '/' + data[i] + '" alt="">';
                        imgList += '</div>';
                    }
                    imgList += ' </div>';
                    $("#panelGaleria").html(imgList);

                    $("#divGaleria").css({"visibility": "visible"});
                    $("#divGaleria").animate({
                        "left": "1%"
                    }, 1000, "swing");
                } else {
                    $("#divGaleria").animate({
                        "left": "-30%"
                    }, 1000, function () {
                        $("#divGaleria").css({"visibility": "hidden"});
                    });
                }
                break;
            case "html_Work_Models":
                var allPages = '<div class="col-xs-12 col-sm-12 col-md-12">';
                for (var i = 0, max = data.length; i < max; i++) {
                    allPages += '<div class="col-xs-4 col-sm-4 col-md-4  menuBar" data-folder="' + dataVals.folder + '" data-layout="' + data[i] + '">';
                    allPages += '<figure class="image">';
                    allPages += '<img src="./img/' + data[i].split(".")[0] + '.png" alt="">';
                    allPages += '<figcaption> ' + data[i].split(".")[0] + ' </figcaption></figure></div>';
                }
                allPages += '</div>';
                $("#contentor").html(allPages);
                break;
            case "html_models":
                var htmlModel = "<div id='divchangemodel'>" +
                        "<div><div><input class='btn-primary btn-round' id='btncancelmodels' type='button' value='Cancel'></div><div><div>";
                for (var i = 0, max = data.length; i < max; i++) {
                    htmlModel += "<figure>" +
                            "<img class='btnmodels btnmodels-style' alt='' src='../img/" + data[i].split(".")[0] + ".png' data-model='" + data[i] + "'/>" +
                            "<figcaption> " + data[i].split(".")[0] + " </figcaption>" +
                            "</figure>";
                }
                htmlModel += "</div></div></div></div>";
                $("body").append(htmlModel);
                break;
            case "temaspoemas":
                //Temas para os poemas
                var htmlModel = "<div id='divchangemodel'>" +
                        "<div><div><input class='btn-primary btn-round' id='btncancelmodels' type='button' value='Cancel'></div><div><div>" +
                        "<h1 class='text-center'>Temas</h1>";
                for (var i = 0, max = data.length; i < max; i++) {
                    //se o nome retornado nao contem "." desduz-se que é uma pasta
                    if (data[i].indexOf(".") === -1) {
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
                //Teste para PErfil do utilizador
                var htmlModel = "<div id='divchangemodel'>" +
                        "<div><div><input class='btn-primary btn-round' id='btncancelmodels' type='button' value='Cancel'></div><div><div>" +
                        "<h1 class='text-center'>Bem-vindo ao teu Perfil," + username + "</h1>";
                for (var i = 0, max = data.length; i < max; i++) {
                    //se o nome retornado nao contem "." desduz-se que é uma pasta
                    if (data[i].indexOf(".") === -1) {
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
                if (typeof dataVals.imagensdotema !== "undefined" && dataVals.imagensdotema !== null) {
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
                        alert("Não existem imagens do tema " + dataVals.imagensdotema);
                }
                break;
        }
    });

    $(".fecharGaleria").click(function () {
        $("#divGaleria").animate({
            "left": "-30%"
        }, 1000, function () {
            $("#divGaleria").css({"visibility": "hidden"});
        });
    });

    $("body").on("click", ".menuBar", function () {
        addLayoutToDiv("#contentor", $(this).data("folder"), $(this).data("layout"), socket);
    });

    //Mostrar os temas disponíveis para o poema
    $("body").on("click", 'a[href="#add-poema"]', function () {
        var data = {
            folder: "temaspoemas",
            idtab: "",
            idObj: ""
        };
        getFilesToFolder(socket, data);
    });

    //Mostrar perfil do Utilizador
    $("body").on("click", 'a[href="#show-perfil"]', function () {
        var data = {
            folder: "showperfil",
            idtab: "",
            idObj: ""
        };
        getFilesToFolder(socket, data);
    });
    //Mostrar os imagens disponíveis para o tema
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
        $("body").find("#divchangemodel").remove();
        AddPoema(LivroPoemas, $(this).attr("src"));
    });

    /*
     * Fim Funçoes de logout -----------------------------------------------------------------------------------------------
     */

});
$(window).resize(function () {
    ajustElements();
});
/*
 * Funções relacionas com as Tabs e modelos --------------------------------------------------------------------------------
 */

// Code taken from MatthewCrumley (http://stackoverflow.com/a/934925/298479)
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


function getFilesToFolder(sckt, data) {
    sckt.emit("getFiles2Folder", data);
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
            if (hash[key].modelo.arrayElem[elemento].elementType === "IMG") {
                $("body").find("#" + hash[key].modelo.arrayElem[elemento].id).attr('src', hash[key].modelo.arrayElem[elemento].conteudo);

            } else if (hash[key].modelo.arrayElem[elemento].elementType === "CANVAS") {
                //cria o seu canvas!
                hash[key].modelo.arrayElem[elemento].drawObj.init();

                //se o array nao estiver vazio (se nao tiver clientes canvas)
                if (hash[key].modelo.arrayElem[elemento].drawObj.ArrayCanvasImage !== []) {
                    for (item in hash[key].modelo.arrayElem[elemento].drawObj.ArrayCanvasImage) {                        //cria as canvas dos outros clientes
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
                    if (hash[key].modelo.arrayElem[elemento].drawObj.bgImg !== "") {
                        var imgg = hash[key].modelo.arrayElem[elemento].drawObj.bgImg;
                        hash[key].modelo.arrayElem[elemento].drawObj.imageCanvas(imgg);
                    }
                }
            } else {
                if ($("#" + elemento).attr('class').match('editable')) {
                    $("#" + elemento).addClass(elemento);
                    var txtedit = new TextEditor(elemento, username, userColor, socket.id, socket);
                    var editTxt = {
                        id: elemento,
                        txtObjEditor: txtedit
                    };
                    allTextEditor.push(editTxt);
                }
                $("#" + hash[key].modelo.arrayElem[elemento].id).val(hash[key].modelo.arrayElem[elemento].conteudo);
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

        var tabNumber = thID.match(/\d+/)[0];

        var newElementID = "tab" + tabNumber + "-Mycanvas";

        if ($(this).attr("id").match("tab" + tabNumber + "-canvasdr")) {

            tabTest.modelo.arrayElem[newElementID] = new Element(newElementID, "CANVAS");
            tabTest.modelo.arrayElem[newElementID].createCanvasObj(".txtTab" + idNum, "#tab" + idNum + "-tabpage", this.id);
            tabTest.modelo.arrayElem[newElementID].drawObj.init();

        } else if ($(this).attr("class").match("editable")) {
            tabTest.modelo.arrayElem[thID] = new Element(thID, thType);
            var txtedit = new TextEditor($(this).attr("id"), username, userColor, socket.id, socket);
            $(this).addClass(thID);
            var editTxt = {
                id: thID,
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

function addLayoutToDiv(local, folder, layout, stk) {
    $(local).load("./" + folder + "/" + layout, function () {
        switch (layout) {
            case "Livro.html":
                stk.emit("getAllTabs");
                $('#bt_PDF').css({'visibility': "visible"});
                $('#bt_PRE').css({'visibility': "visible"});
                break;
            default:
                $('#bt_PDF').css({'visibility': "hidden"});
                $('#bt_PRE').css({'visibility': "hidden"});
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