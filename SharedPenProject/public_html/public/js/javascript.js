// devolve a posicao do cursor no elemento invocado
$.fn.getCursorPosition = function () {
    var el = $(this).get(0);
    var pos = 0;
    if ('selectionStart' in el) {
        pos = el.selectionStart;
    } else if ('selection' in document) {
        el.focus();
        var Sel = document.selection.createRange();
        var SelLength = document.selection.createRange().text.length;
        Sel.moveStart('character', -el.value.length);
        pos = Sel.text.length - SelLength;
    }
    return pos;
};

$.fn.addNewText = function (val1, val2) {
    this.append(
            "<div class='p_msg_chat'>" +
            "<p class = 'user_chat' > " +
            val1 +
            "</p> : <p class='msg_chat'>" +
            val2 +
            "</p></div>");
};

$.fn.addAllColors = function (lista) {
    for (var i = 0, max = lista.length; i < max; i++) {
        $(this).append('<option value="' +
                lista[i][0] + '" style="background:' + lista[i][0] + '">' +
                lista[i][1] + '</option>');
    }
};

/**
 * coloca o curso na posicao especificada
 * @param {type} start Posicao inicial
 * @param {type} end posicao final
 * @returns {$.fn@call;each}
 */
//$('#elem').selectRange(3, 5); // select a range of text
//$('#elem').selectRange(3); // set cursor position
$.fn.selectRange = function (start, end) {
    if (!end)
        end = start;
    return this.each(function () {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

function ajustElements() {
    $("#contentor").css({
        height: $(window).height() * 0.90
    });
//    $(".txtTab").css({
//        height: $("#contentor").height() * 0.895
//    });
}

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
    var newElem = "";
    $.get("./html_models/" + html, function (data) {
        var a = data.split("\n");
        $.each(a, function () {
            if (this.indexOf("id=") >= 0) {
                newElem += [this.slice(0, this.indexOf('"') + 1), "tab" + idNum + "-", this.slice(this.indexOf('"') + 1)].join('');
            } else {
                newElem += this;
            }
        });

        $(".txtTab" + idNum).html(newElem);
        drawimg = new Draw($(".txtTab" + idNum), "tab1-canvas1");
        drawimg.init();
    });
}
var drawimg;
function getDrawObj () {
    return drawimg;
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

    delete tabsID[tabsID.indexOf("msg" + liElem)];
}
/**
 * Faz o calculo para de uma cor em RGB 
 * @param {type} hex
 * @param {type} s
 * @param {type} n
 * @returns {String}
 */
function hexToRgb(hex, s, n) {
    for (var i = 0, max = s.length; i < max; i++) {
        hex += s[i].charCodeAt(0);
    }
    for (var i = 0, max = n.length; i < max; i++) {
        hex += n[i].charCodeAt(0);
    }
    var bigint = parseInt(hex.toString(16), 16);
    var r = ((bigint >> 16) & 255);
    var g = (bigint >> 8) & 255;
    var b = (bigint & 255);

    return r + "," + g + "," + b;
}

function changecolordraw(id){
    drawimg.color(id);
}

//var canvas,
//        ctx,
//        flag = false,
//        prevX = 0,
//        currX = 0,
//        prevY = 0,
//        currY = 0,
//        dot_flag = false;
//
//var x = "black",
//        y = 2;
//
//function init(id) {
////    canvas = $(document.body).find(id);
//    canvas = document.getElementById(id);
//    ctx = canvas.getContext('2d');
//    w = canvas.width;
//    h = canvas.height;
//
//    canvas.addEventListener("mousemove", function (e) {
//        findxy('move', e);
//    }, false);
//    canvas.addEventListener("mousedown", function (e) {
//        findxy('down', e);
//    }, false);
//    canvas.addEventListener("mouseup", function (e) {
//        findxy('up', e);
//    }, false);
//    canvas.addEventListener("mouseout", function (e) {
//        findxy('out', e);
//    }, false);
//}
//
//function color(obj) {
//    switch (obj) {
//        case "green":
//            x = "green";
//            break;
//        case "blue":
//            x = "blue";
//            break;
//        case "red":
//            x = "red";
//            break;
//        case "yellow":
//            x = "yellow";
//            break;
//        case "orange":
//            x = "orange";
//            break;
//        case "black":
//            x = "black";
//            break;
//        case "white":
//            x = "white";
//            break;
//    }
//    if (x == "white")
//        y = 14;
//    else
//        y = 2;
//
//}
//
//function draw() {
//    ctx.beginPath();
//    ctx.moveTo(prevX, prevY);
//    ctx.lineTo(currX, currY);
//    ctx.strokeStyle = x;
//    ctx.lineWidth = y;
//    ctx.stroke();
//    ctx.closePath();
//}
//
//function erase() {
//    var m = confirm("Want to clear");
//    if (m) {
//        ctx.clearRect(0, 0, w, h);
////        document.getElementById("canvasimg").style.display = "none";
//    }
//}
//
//function save() {
//    document.getElementById("canvasimg").style.border = "2px solid";
//    var dataURL = canvas.toDataURL();
//    document.getElementById("canvasimg").src = dataURL;
//    document.getElementById("canvasimg").style.display = "inline";
//}
//
//function findxy(res, e) {
//    if (res === 'down') {
//        prevX = currX;
//        prevY = currY;
//        currX = e.clientX - canvas.offsetLeft;
//        currY = e.clientY - canvas.offsetTop;
//
//        flag = true;
//        dot_flag = true;
//        if (dot_flag) {
//            ctx.beginPath();
//            ctx.fillStyle = x;
//            ctx.fillRect(currX, currY, 2, 2);
//            ctx.closePath();
//            dot_flag = false;
//        }
//    }
//    if (res == 'up' || res == "out") {
//        flag = false;
//    }
//    if (res == 'move') {
//        if (flag) {
//            prevX = currX;
//            prevY = currY;
//            currX = e.clientX - canvas.offsetLeft;
//            currY = e.clientY - canvas.offsetTop;
//            draw();
//        }
//    }
//}