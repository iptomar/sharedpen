/**
 * Editor de Texto
 * @param {type} idpai      div do editor
 * @param {type} user       nome do utilizador
 * @param {type} cor        cor do utilizador
 * @param {type} numCreator numero do utilizador que criou o paragrafo
 * @param {type} userNum    numero do utilizador
 * @returns {TextEditor}
 */
var TextEditor = function (idpai, user, cor, numCreator, userNum) {
    this.idpai = idpai;
    this.user = user;
    this.cor = cor;
    this.userNum = userNum;
    this.valPId = 1;
    this.atualPara = "";
    this.creator = numCreator;

    if (typeof numCreator != "undefined") {
        $("#" + this.idpai).append('<p id="' + this.idpai + "-" + this.valPId++ + '" class="' + numCreator + '" contenteditable></p>');
    }

    this.key = {
        'ENTER': 13
    };
};

/**
 * Coloca a cor dos outro utilizadores diferente da do utilizador
 * @returns {undefined}
 */
TextEditor.prototype.changeColorPUsers = function () {
    $("#" + this.idpai + " > p:not(." + this.userNum + ")").css({
        "color": "blue"
    });
    $("#" + this.idpai + " > p." + this.userNum).css({
        "color": $("#" + this.idpai).css("color")
    });
};

/**
 * Constroi um paragrafo
 * @param {type} sckid
 * @param {type} idPara
 * @returns {undefined}
 */
TextEditor.prototype.createPara = function (sckid, idPara) {
    $('<p  id="' +
            this.idpai + "-" +
            this.valPId++ +
            '" class="' +
            sckid +
            '" contenteditable></p>').insertAfter("#" +
            this.idpai +
            " > #" + idPara);
    if (sckid == this.userNum) {
        $("#" + this.idpai + ' > p#' + this.idpai + "-" + (this.valPId - 1)).focus();
    }
};

/**
 * Coloca o texto no paragrafo do seu utilizador
 * @param {type} data
 * @returns {undefined}
 */
TextEditor.prototype.setTextEditor = function (data) {
    if (data.novoPara) {
        this.createPara(data.socketid, data.idPara);
    } else {
        $("#" + this.idpai + " > #" + data.idPara).html(data.textSinc);
        if (data.idPara == this.atualPara) {
            setCaretAtEditor(data.idPara, 0, data.textSinc.length);
        }
    }
    this.changeColorPUsers();
};

/**
 * Devolve o texto do editor
 * @returns {String}
 */
TextEditor.prototype.getTextEditor = function () {
    var alltextP = "";
    $('#' + this.idpai).children('p').each(function () {
        alltextP += $(this).text() + "\n";
    });
    return alltextP;
};

/**
 * Devolve o codigo html do editor
 * @returns {String}
 */
TextEditor.prototype.getTextEditorForHtml = function () {
    var alltextP = "";
    $('#' + this.idpai).children('p').each(function () {
        $(this).removeAttr("style");    
    });
    $('#' + this.idpai).each(function () {        
        alltextP += this.outerHTML;
    });
    this.changeColorPUsers();
    return alltextP;
};

/**
 * Calcula o tamanhos dos paragrafos criados
 * @returns {jQuery|Number}
 */
TextEditor.prototype.getSizePUtilizado = function () {
    var size = $('#' + this.idpai + "-" + 1).height() + 10;
    $('#' + this.idpai).children('p').each(function () {
        size += $(this).height() + 10;
    });
    return size;
};

/**
 * Coloca todo o texto rcebido no editor
 * @param {type} text
 * @returns {undefined}
 */
TextEditor.prototype.setTextToEditor = function (text) {
    var arrayTextp = text.split("</p>");
    if (arrayTextp.length > 1) {
        this.valPId = 1;
        $("#" + this.idpai + " > p").remove();
        for (var i in arrayTextp) {
            $("#" + this.idpai).append(arrayTextp[i] + "</p>");
            this.valPId++;
        }
        this.valPId--;
        this.changeColorPUsers();
    }
};

/**
 * Constrou um array com os contributos dos intervenientes no editor
 * @param {type} projId
 * @returns {Array|TextEditor.prototype.contributes.contri}
 */
TextEditor.prototype.contributes = function (projId) {
    var contri = [];
    var pai = this.idpai;
    $('#' + this.idpai).children('p').each(function () {
        contri.push({
            projecto: projId,
            tab: pai,
            editorPara: this.id,
            user: $(this).attr("class"),
            text: $(this).text()
        });
    });
    return contri;
};

/**
 * Configura o editor com os estilos defenidos
 * @param {type} estilos
 * @returns {undefined}
 */
TextEditor.prototype.styles = function (estilos) {
    if (typeof estilos != "undefined") {
        var estilosArray = estilos.split(";");
        var styles = "{";
        for (var i in estilosArray) {
            var sty = estilosArray[i].split(":");
            styles += '"' + sty[0] + '" : "' + sty[1] + '",';
        }
        styles = styles.slice(0, -1);
        styles += "}";
        $("body").find("#" + this.idpai).css(JSON.parse(styles));
    }
};

/**
 * Devolve a posicao do cursor
 * @param {type} editableDiv
 * @returns {range@call;duplicate.text.length|Number|range.endOffset}
 */
function getCaretPosition(editableDiv) {
    var caretPos = 0, sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
                caretPos = range.endOffset;
            }
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        if (range.parentElement() == editableDiv) {
            var tempEl = document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
        }
    }
    return caretPos;
}

/**
 * coloca o cursor na posicao pretendida
 * @param {type} editor
 * @param {type} linha
 * @param {type} coluna
 * @returns {undefined}
 */
function setCaretAtEditor(editor, linha, coluna) {
//    console.log(editor);
//    console.log(linha);
//    console.log(coluna);
    var el = document.getElementById(editor);
    if (typeof el.childNodes[linha] != "undefined") {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el.childNodes[linha], coluna);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        el.focus();
    }
}