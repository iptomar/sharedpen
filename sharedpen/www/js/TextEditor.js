var TextEditor = function (idpai, user, cor, socketCreator, socket) {
    this.idpai = idpai;
    this.user = user;
    this.cor = cor;
    this.socketId = socket.id;
    this.valPId = 1;
    this.atualPAra = "";
    this.socket = socket;
    if (typeof socketCreator !== "undefined") {
        $("#" + this.idpai).append('<p id="' + this.idpai + "-" + this.valPId++ + '" class="' + socketCreator + '" contenteditable></p>');
    }

    $("#" + this.idpai + " > p").css({
        margin: "0 0 0 0 !important"
    });
    $("#" + this.idpai).css({
        "font-size": "20px"
    });

    this.key = {
        'ENTER': 13
    };

};

TextEditor.prototype.allOperation = function (type, evt) {
    if ($("#" + this.idpai + " > #" + event.target.id).attr("class") !== this.socketId) {
        if (type.charAt(0) === 'm' || type.charAt(0) === 'c') {
            setCaretAtEditor(event.target.id, 0, $("#" + this.idpai + " > #" + event.target.id).text().length);
        } else {
            if (evt.keyCode === this.key.ENTER) {
                evt.preventDefault(); //Prevent default browser behavior
                this.createPara(this.socketId, event.target.id);
                this.socket.emit('msgappend', {
                    'html': $("#" + this.idpai).html(),
                    textSinc: $(evt.target).text(),
                    'pos': 0,
                    "socketid": this.socketId,
                    'id': this.idpai,
                    novoPara: true,
                    'idPara': event.target.id,
                    'parent': $("#" + this.idpai).parent().parent().attr('class').split(' ')[1]
                });
            } else {
                evt.preventDefault();
            }
        }
    } else {
        var newPara = false;
        if (type.charAt(0) === 'k' && evt.keyCode === this.key.ENTER) {
            if (type === 'keypress') {
                this.createPara(this.socketId, event.target.id);
                newPara = true;
            }
            evt.preventDefault(); //Prevent default browser behavior
        }
        this.atualPAra = event.target.id;
        this.socket.emit('msgappend', {
            'html': $("#" + this.idpai).html(),
            textSinc: $(evt.target).text(),
            'pos': 0,
            "socketid": this.socketId,
            'id': this.idpai,
            novoPara: newPara,
            'idPara': event.target.id,
            'parent': $("#" + this.idpai).parent().parent().attr('class').split(' ')[1]
        });
        newPara = false;
    }
    this.changeColorPUsers();
};

TextEditor.prototype.changeColorPUsers = function () {
    $("#" + this.idpai + " > p:not(." + this.socketId + ")").css({
        "color": "blue"
    });
    $("#" + this.idpai + " > p." + this.socketId).css({
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
    if (sckid === this.socketId) {
        $("#" + this.idpai + ' > p#' + this.idpai + "-" + (this.valPId - 1)).focus();
    }
};

TextEditor.prototype.setTextEditor = function (data) {
    if (data.novoPara) {
        this.createPara(data.socketid, data.idPara);
    } else {
        $("#" + this.idpai + " > #" + data.idPara).html(data.textSinc);
        if (data.idPara === this.atualPAra) {
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

function getCaretPosition(editableDiv) {
    var caretPos = 0,
            sel, range;
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
    var el = document.getElementById(editor);
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[linha], coluna);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
}