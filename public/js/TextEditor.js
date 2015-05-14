var TextEditor = function (id, user, cor) {
    this.id = id;
    this.newId;
    this.user = user;
    this.cor = cor;
    $('#' + id).summernote({
        lang: "pt-PT",
        height: "auto",
        tabsize: 5,
        idEdit: this.user,
        focus: true//,
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
        , onKeydown: function () {  
            console.log("before");
           // console.log('keydown', arguments, $('.summernote')[0] === this);
           var idpai= $("#"+id).parent().parent().attr('class').split(' ')[1];
            
            //var html = $("#"+id).next().find('note-editable').html;
            var html = $('#' + id).code();
            //console.log(html);
            
            
            
           // hash["."+idpai].modelo.arrayElem[id].conteudo = html;
            //console.log(idpai);
           // console.log(id);

            socket.emit('msgappend', {
                'parent': idpai,
                'id': id,
                'html': html
            });
        }
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
//        onChange: function ($editable, sHtml) {
//            console.log($editable, sHtml);
//            console.log('onChange', arguments, $('.summernote')[0] === this);
//        },
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
      
    
//    $('.note-editable').css('font-size','18px');
//    this.key = key;
//    this.firepadRef = "";
//    this.codeMirror = "";
//    this.firepad = "";
//    this.toolbarShow = false;
};

TextEditor.prototype.setNewId = function (val) {
  this.newId = val;  
};

TextEditor.prototype.showToolbar = function () {
//    $('#note-popover-' + this.newId.substr(this.newId.length - 1)).find(".note-air-popover").css('display', 'block');
};
