var TextEditor = function (idpai, user, cor, socketCreator, socket) {
    this.idpai = idpai;
    this.user = user;
    this.cor = cor;
    this.socketId = socket.id;
    this.valPId = 1;
    this.atualPAra = "";
    this.socket = socket;

    $("#" + this.idpai).append('<p id="' + this.idpai + "-" + this.valPId++ + '" class="' + socketCreator + '" contenteditable></p>');


    $("#" + this.idpai + " > p").css({
        margin: "0 0 0 0 !important"
    });
    $("#" + this.idpai).css({
        "font-size": "20px"
    });

    this.key = {
        'BACKSPACE': 8,
        'TAB': 9,
        'ENTER': 13,
        'SPACE': 32,
        // Number: 0-9
        'NUM0': 48,
        'NUM1': 49,
        'NUM2': 50,
        'NUM3': 51,
        'NUM4': 52,
        'NUM5': 53,
        'NUM6': 54,
        'NUM7': 55,
        'NUM8': 56,
        // Alphabet: a-z
        'B': 66,
        'E': 69,
        'I': 73,
        'J': 74,
        'K': 75,
        'L': 76,
        'R': 82,
        'S': 83,
        'U': 85,
        'Y': 89,
        'Z': 90,
        'SLASH': 191,
        'LEFTBRACKET': 219,
        'BACKSLASH': 220,
        'RIGHTBRACKET': 221
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
                    'html': $(evt.target).text(),
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
            'html': $(evt.target).text(),
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

    console.log(sckid + "=== " + this.socketId);
    if (sckid === this.socketId) {
        console.log("passou");
        $("#" + this.idpai + ' > p#' + this.idpai + "-" + (this.valPId - 1)).focus();
    }
};

TextEditor.prototype.setTextEditor = function (data) {
    if (data.novoPara) {
        this.createPara(data.socketid, data.idPara);
    } else {
        $("#" + this.idpai + " > #" + data.idPara).html(data.html);
        if (data.idPara === this.atualPAra) {
            setCaretAtEditor(data.idPara, 0, data.html.length);
        }
    }
    this.changeColorPUsers();
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

//
/////**
// * 
// * @param {type} id
// * @param {type} user
// * @param {type} cor
// * @param {type} socketId
// * @param {type} socket
// * @returns {TextEditor}
// */
//var TextEditor = function (id, user, cor, socketId, socket) {
//    this.id = id;
//    this.newId;
//    this.user = user;
//    this.cor = cor;
//    this.socketId = socketId;
//    this.socket = socket;
//    $('#' + id).summernote({
//        lang: "pt-PT",
//        width: $("#" + this.id).width(), // set editor width
//        height: $("#" + this.id).height(),
//        minHeight: $("#" + this.id).height(), // set minimum height of editor
//        maxHeight: $("#" + this.id).height(), // set maximum height of editor
//        tabsize: 5,
////        styleWithSpan: true, // style with span (Chrome and FF only)
////        disableLinkTarget: true, // hide link Target Checkbox
////        disableDragAndDrop: false, // disable drag and drop event
//        disableResizeEditor: true, // disable resizing editor
////        shortcuts: false, // enable keyboard shortcuts
////        placeholder: false, // enable placeholder text
////        prettifyHtml: true, // enable prettifying html while toggling codeview
//        idEdit: this.socketId,
//        idinput: this.id,
//        focus: true, //
//        toolbar: [
//            ['style', ['style']],
//            ['font', ['bold', 'italic', 'underline', 'clear']],
//            // ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
//            ['fontname', ['fontname']],
//            ['fontsize', ['fontsize']],
//            //['color', ['color']],
//            ['para', ['ul', 'ol', 'paragraph']],
//                    //['height', ['height']],
//                    //['table', ['table']],
//                    //['insert', ['link', 'picture', 'hr']]//,
//                    //['view', ['fullscreen', 'codeview']],
//                    //['help', ['help']]
//        ],
//        onChange: function ($editable, sHtml) {
////            console.log($editable, sHtml);
////            console.log('onChange', arguments, $('.summernote')[0] === this);
//            if ((this.id).indexOf("Poema") === -1) {                
//                socket.emit('msgappend', {
//                    'parent': $("#" + this.id).parent().parent().attr('class').split(' ')[1],
//                    'id': this.id,
//                    'html': $editable
//                });  
//            }
//        }
//    });
////    alert($('#note-editable_' + this.id).parent().attr("id"));
////    alert($("#" + this.id).css('font-family'));
//    $('#note-editable_' + this.id).css({
//        'font-size': $("#" + this.id).css('font-size'),
//        'text-align': $("#" + this.id).css('text-align')
//    });
//};
//
///**
// * 
// * @param {type} val
// * @returns {undefined}
// */
//TextEditor.prototype.setNewId = function (val) {
//    this.newId = val;
//};
//
///**
// * 
// * @param {type} text
// * @returns {undefined}
// */
//TextEditor.prototype.setTextToEditor = function (text) {
//    $('#' + this.id).code(text);
//};
//
///**
// * 
// * @returns {unresolved}
// */
//TextEditor.prototype.getTextEditor = function () {
//    return  $('#note-editable_' + this.id).code();
//};
///**
// * 
// * @param {type} element
// * @returns {Number|document.body@call;createTextRange.text.length}
// */
//function getCaretCharacterOffsetWithin(element) {
//    var caretOffset = 0;
//    if (typeof window.getSelection != "undefined") {
//        var range = window.getSelection().getRangeAt(0);
//        var preCaretRange = range.cloneRange();
//        preCaretRange.selectNodeContents(element);
//        preCaretRange.setEnd(range.endContainer, range.endOffset);
//        caretOffset = preCaretRange.toString().length;
//    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
//        var textRange = document.selection.createRange();
//        var preCaretTextRange = document.body.createTextRange();
//        preCaretTextRange.moveToElementText(element);
//        preCaretTextRange.setEndPoint("EndToEnd", textRange);
//        caretOffset = preCaretTextRange.text.length;
//    }
//    return caretOffset;
//}
//
///**
// * 
// * @param {type} idEditor
// * @returns {Number|document.body@call;createTextRange.text.length}
// */
//function showCaretPos(idEditor) {
////    var el = document.getElementsByClassName("note-editable")[0];
//    var el = document.getElementById(idEditor);
//    return getCaretCharacterOffsetWithin(el);
//}
//
///**
// * 
// * @param {type} idEditor
// * @param {type} caret
// * @returns {getElementAtCaret.element|jQuery|$|@exp;_$|Window.$}
// */
//function getElementAtCaret(idEditor, caret) {
//    var element;
//    var counter = 0;
//    var buffer;
//    var ps = $('p', "#" + idEditor + '.note-editable');
//    if (ps.length > 0) {
//        for (var paragrafo = 0; paragrafo < ps.length; paragrafo++) {
//            element = $(ps[paragrafo]);
//            var aux = element.contents();
//            for (var i = 0; i < aux.length; i++) {
//                counter += $(aux[i]).text().length;
//                if (counter >= caret) {
//                    return {
//                        element: element,
//                        paragrafo: paragrafo,
//                        pos: i
//                    };
//                }
//            }
//        }
//    }
//}
//
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
//
//// ----------------------  Exemplos de callbacks -------------------------
////        airMode: true,
////        onInit: function () {
////            console.log('init', arguments, $('.summernote')[0] === this);
////        },
////        onFocus: function () {
////            console.log('focus', arguments, $('.summernote')[0] === this);
////        },
////        onBlur: function () {
////            console.log('blur', arguments, $('.summernote')[0] === this);
////        },
////        onKeydown: function () {
////            var caret = showCaretPos();
////            console.log(caret);
////            console.log(getElementAtCaret(caret));
////            console.log("before");
//// console.log('keydown', arguments, $('.summernote')[0] === this);
//
////        }
////        onKeyup: function () {
////            console.log('keyup', arguments, $('.summernote')[0] === this);
////        },
////        onEnter: function () {
////            console.log('enter', arguments, $('.summernote')[0] === this);
////        },
////        onMousedown: function () {
////            console.log('onMousedown', arguments, $('.summernote')[0] === this);
////        },
////        onMouseup: function () {
////            console.log('onMouseup', arguments, $('.summernote')[0] === this);
////        },
////        onScroll: function () {
////            console.log('onscroll', arguments, $('.summernote')[0] === this);
////        },
////        onPaste: function () {
////            console.log('paste', arguments, $('.summernote')[0] === this);
////        },
////        onBeforeCommand: function () {
////            console.log("before");
////        },
////        onChange: function ($editable, sHtml) {
////            console.log($editable, sHtml);
////            console.log('onChange', arguments, $('.summernote')[0] === this);
////        },
////        onImageUpload: function () {
////            console.log('onImageUpload', arguments, $('.summernote')[0] === this);
////        },
////        onImageUploadError: function () {
////            console.log('onImageUploadError', arguments, $('.summernote')[0] === this);
////        }
////    }).on('summernote.init', function () {
////        console.log('summernote.init', arguments, $('.summernote')[0] === this);
////    }).on('summernote.focus', function () {
////        console.log('summernote.focus', arguments, $('.summernote')[0] === this);
////    }).on('summernote.blur', function () {
////        console.log('summernote.blur', arguments, $('.summernote')[0] === this);
////    }).on('summernote.keydown', function () {
////        console.log('summernote.keydown', arguments, $('.summernote')[0] === this);
////    }).on('summernote.keyup', function () {
////        console.log('summernote.keyup', arguments, $('.summernote')[0] === this);
////    }).on('summernote.enter', function () {
////        console.log('summernote.enter', arguments, $('.summernote')[0] === this);
////    }).on('summernote.mousedown', function () {
////        console.log('summernote.mousedown', arguments, $('.summernote')[0] === this);
////    }).on('summernote.mouseup', function () {
////        console.log('summernote.mouseup', arguments, $('.summernote')[0] === this);
////    }).on('summernote.scroll', function () {
////        console.log('summernote.scroll', arguments, $('.summernote')[0] === this);
////    }).on('summernote.paste', function () {
////        console.log('summernote.paste', arguments, $('.summernote')[0] === this);
////    }).on('summernote.before.command', function () {
////        console.log('summernote.before.command', arguments, $('.summernote')[0] === this);
////    }).on('summernote.change', function () {
////        console.log('summernote.change', arguments, $('.summernote')[0] === this);
////    }).on('summernote.image.upload', function () {
////        console.log('summernote.image.upload', arguments, $('.summernote')[0] === this);
////    }).on('summernote.image.upload.error', function () {
////        console.log('summernote.image.error', arguments, $('.summernote')[0] === this);
//
