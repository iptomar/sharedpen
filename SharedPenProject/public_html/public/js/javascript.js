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
function Addtab(tabsID) {

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

    // Adiciona a pÃ¡gina depois da Ãºltima pÃ¡gina (<div></div> markup after the last-child of the <div class="tab-content">)
    $('div.tab-content div:last-child').after(
            '<div class="tab-pane fade" id="page' +
            (tabsID.length + 1) +
            '"><textarea class="txtTab form-control" id="msg' +
            (tabsID.length + 1) +
            '" rows=15></textarea></div>');

    $("#msg" + (tabsID.length + 1)).css({
        height: $("#contentor").height() * 0.82
    });

    return tabsID[tabsID.length] = "msg" + (tabsID.length + 1);
}

function removeTab(tabsID, liElem) { // FunÃ§Ã£o que remove separador com o numero de <li>
    $('ul#tabs > li#li' + liElem).fadeOut(1000, function () {
        $(this).remove(); // Apaga o <li></li>(separador) com um efeito fadeout
    });
    // TambÃ©m apaga o <div>(pÃ¡gina) correta dentro de <div class="tab-content">
    $('div.tab-content div#page' + liElem).remove();
    
    // Seleciona todos os <li> excepto o Ãºltimo (que Ã© o "+ PÃ¡g.") e sem o que foi apagado
    $('ul#tabs > li').not('#last').not('#li' + liElem).each(function (i) {
        
        // ObtÃ©m-se o atributo <li> div (numero)
        var getAttr = $(this).attr('id').split('li');
        
        // We change the div attribute of all <li>: the first is 1, then 2, then 3...    
        $('ul#tabs li#li' + getAttr[1]).attr('id', 'li' + (i + 1));
        var tabContent = 'Página ' + (getAttr + 1); // 
        
        tabContent += ' <button type="button" class="btn btn-warning btn-xs xtab" id=' + (tabsID.length + 1) + '><span >x</span></button>';
        
        // tabContent variable, inside the <li>. We change the number also, 1, then 2, then3...
        $('#tabs a[href="#page' + getAttr[1] + '"]').html(tabContent).attr('href', '#page' + (i + 1));
        
        // We do the same for all <div> from <div class="tab-content">: we change the number: 1, then 2, then 3...    
        $('div.tab-content div#page' + getAttr[1]).html('<textarea class="form-control" id="msg' + (i + 1) + '" rows=15>').attr('id', 'page' + (i + 1));
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

