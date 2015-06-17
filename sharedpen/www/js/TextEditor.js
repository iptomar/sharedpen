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
    $("#" + this.idpai).css({
        "font-size": "20px"
    });

    this.key = {
        'ENTER': 13
    };
};


TextEditor.prototype.changeColorPUsers = function () {
    $("#" + this.idpai + " > p:not(." + this.userNum + ")").css({
        "color": "blue"
    });
    $("#" + this.idpai + " > p." + this.userNum).css({
        "color": "black"
    });
};

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

TextEditor.prototype.getTextEditor = function () {
    var alltextP = "";
    $('#' + this.idpai).children('p').each(function () {
        alltextP += $(this).text() + "\n";
    });
    return alltextP;
};

TextEditor.prototype.getTextEditorForHtml = function () {
    var alltextP = "";
    $('#' + this.idpai).each(function () {
        alltextP += this.outerHTML;
    });
    return alltextP;
};

TextEditor.prototype.getSizePUtilizado = function () {
    var size = $('#' + this.idpai + "-" + 1).height() + 10;
    $('#' + this.idpai).children('p').each(function () {
        size += $(this).height() + 10;
    });
    return size;
};

TextEditor.prototype.setTextToEditor = function (text) {
    var arrayTextp = text.split("</p>");
    if (arrayTextp.length > 1) {
        for (var i in arrayTextp) {
            $("#" + this.idpai).append(arrayTextp[i] + "</p>");
            this.valPId++;
        }
        this.valPId--;
        this.changeColorPUsers();
    }
};

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

TextEditor.prototype.styles = function (estilos) {
    alert(estilos);
   return;
};

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
 * 
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