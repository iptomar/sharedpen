var TextEditor = function (id, user, cor, socketId, socket) {
    this.id = id;
    this.newId;
    this.user = user;
    this.cor = cor;
    this.socketId = socketId;
    this.socket = socket;
    $('#' + id).summernote({
        lang: "pt-PT",
        height: $("#" + this.id).height(),
        tabsize: 5,
        idEdit: this.socketId,
        idinput: this.id,
        focus: true, //
        toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            // ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            //['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            //['table', ['table']],
            ['insert', ['link', 'picture', 'hr']]//,
                    //['view', ['fullscreen', 'codeview']],
                    //['help', ['help']]
        ],
//        airMode: true,
//        onInit: function () {
//            console.log('init', arguments, $('.summernote')[0] === this);
//        },
//        onFocus: function () {
//            console.log('focus', arguments, $('.summernote')[0] === this);
//        },
//        onBlur: function () {
//            console.log('blur', arguments, $('.summernote')[0] === this);
//        },
//        onKeydown: function () {
//            var caret = showCaretPos();
//            console.log(caret);
//            console.log(getElementAtCaret(caret));
//            console.log("before");
        // console.log('keydown', arguments, $('.summernote')[0] === this);

//        }
//        onKeyup: function () {
//            console.log('keyup', arguments, $('.summernote')[0] === this);
//        },
//        onEnter: function () {
//            console.log('enter', arguments, $('.summernote')[0] === this);
//        },
//        onMousedown: function () {
//            console.log('onMousedown', arguments, $('.summernote')[0] === this);
//        },
//        onMouseup: function () {
//            console.log('onMouseup', arguments, $('.summernote')[0] === this);
//        },
//        onScroll: function () {
//            console.log('onscroll', arguments, $('.summernote')[0] === this);
//        },
//        onPaste: function () {
//            console.log('paste', arguments, $('.summernote')[0] === this);
//        },
//        onBeforeCommand: function () {
//            console.log("before");
//        },
        onChange: function ($editable, sHtml) {
//            console.log($editable, sHtml);
//            console.log('onChange', arguments, $('.summernote')[0] === this);

            socket.emit('msgappend', {
                'parent': $("#" + this.id).parent().parent().attr('class').split(' ')[1],
                'id': this.id,
                'html': $('#' + id).code()
            });

        }//,
//        onImageUpload: function () {
//            console.log('onImageUpload', arguments, $('.summernote')[0] === this);
//        },
//        onImageUploadError: function () {
//            console.log('onImageUploadError', arguments, $('.summernote')[0] === this);
//        }
//    }).on('summernote.init', function () {
//        console.log('summernote.init', arguments, $('.summernote')[0] === this);
//    }).on('summernote.focus', function () {
//        console.log('summernote.focus', arguments, $('.summernote')[0] === this);
//    }).on('summernote.blur', function () {
//        console.log('summernote.blur', arguments, $('.summernote')[0] === this);
//    }).on('summernote.keydown', function () {
//        console.log('summernote.keydown', arguments, $('.summernote')[0] === this);
//    }).on('summernote.keyup', function () {
//        console.log('summernote.keyup', arguments, $('.summernote')[0] === this);
//    }).on('summernote.enter', function () {
//        console.log('summernote.enter', arguments, $('.summernote')[0] === this);
//    }).on('summernote.mousedown', function () {
//        console.log('summernote.mousedown', arguments, $('.summernote')[0] === this);
//    }).on('summernote.mouseup', function () {
//        console.log('summernote.mouseup', arguments, $('.summernote')[0] === this);
//    }).on('summernote.scroll', function () {
//        console.log('summernote.scroll', arguments, $('.summernote')[0] === this);
//    }).on('summernote.paste', function () {
//        console.log('summernote.paste', arguments, $('.summernote')[0] === this);
//    }).on('summernote.before.command', function () {
//        console.log('summernote.before.command', arguments, $('.summernote')[0] === this);
//    }).on('summernote.change', function () {
//        console.log('summernote.change', arguments, $('.summernote')[0] === this);
//    }).on('summernote.image.upload', function () {
//        console.log('summernote.image.upload', arguments, $('.summernote')[0] === this);
//    }).on('summernote.image.upload.error', function () {
//        console.log('summernote.image.error', arguments, $('.summernote')[0] === this);
    });


    $('.note-editable').css('font-size', '18px');
//    this.key = key;
//    this.firepadRef = "";
//    this.codeMirror = "";
//    this.firepad = "";
//    this.toolbarShow = false;
};

TextEditor.prototype.setNewId = function (val) {
    this.newId = val;
};

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    if (typeof window.getSelection != "undefined") {
        var range = window.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
    } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
        var textRange = document.selection.createRange();
        var preCaretTextRange = document.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

function showCaretPos(idEditor) {
//    var el = document.getElementsByClassName("note-editable")[0];
    var el = document.getElementById(idEditor);
    return getCaretCharacterOffsetWithin(el);
}

function getElementAtCaret(idEditor, caret) {
    var element;
    var counter = 0;
    var buffer;
    var ps = $('p', "#" + idEditor + '.note-editable');
    if (ps.length > 0) {
        for (var paragrafo = 0; paragrafo < ps.length; paragrafo++) {
            element = $(ps[paragrafo]);
            var aux = element.contents();
            for (var i = 0; i < aux.length; i++) {
                counter += $(aux[i]).text().length;
                if (counter >= caret) {
                    return element;
                }
            }
        }
    } else {
        //criar p correctamente
//        var p = document.createElement('p');
//        
//        $('.note-editable:first').append(p);
//        
//        $('p', '.note-editable:first')[0].focus();
    }
}

function setCaretAtEditor(editor, linha, coluna) {
    var el = document.getElementById(editor);
    var range = document.createRange();
    var sel = window.getSelection();
    range.setStart(el.childNodes[(linha % 2 === 0) ? linha : linha + 1], (linha === 0) ? coluna + 3 : coluna);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus();
}

