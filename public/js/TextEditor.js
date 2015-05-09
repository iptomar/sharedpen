var TextEditor = function (idpai, key, user, cor) {
    $('#' + idpai).summernote({
        lang: "pt-PT",
        height: 300,
        tabsize: 5,
        airMode: true
    });

//    this.idpai = idpai;
//    this.key = key;
//    this.user = user;
//    this.cor = cor;
//    this.firepadRef = "";
//    this.codeMirror = "";
//    this.firepad = "";
//    this.toolbarShow = false;
};

//TextEditor.prototype.init = function () {
//    //// Initialize Firebase.
//    this.firepadRef = this.getExampleRef();
//    // TODO: Replace above line with:
//    // var firepadRef = new Firebase('<YOUR FIREBASE URL>');
//
//    //// Create CodeMirror (with lineWrapping on).
//    this.codeMirror = CodeMirror(document.getElementById(this.idpai), {
//        lineWrapping: true
//    });
//
//    //// Create Firepad (with rich text toolbar and shortcuts enabled).
//    this.firepad = Firepad.fromCodeMirror(this.firepadRef, this.codeMirror, {
//        richTextToolbar: true,
//        richTextShortcuts: true
//    });
//
////    Available Options:
////    richTextToolbar (default: false) - Adds a toolbar with buttons for bold, italic, etc.
////    richTextShortcuts (default: false) - Maps Ctrl-B to bold, etc.
////    userId (default: random) - The user ID for the person editing.
////    userColor (default: generated from userId) - A css color (e.g. "#ccc") for this user's cursor.
////    defaultText (default: null) - Text to initialize the Firepad with if history is empty.
//
//    this.firepad.setUserId(this.user);
//    this.firepad.setUserColor("#" + this.cor);
//
//    //// Initialize contents.
//    this.firepad.on('ready', function () {
////        if (this.firepad.isHistoryEmpty()) {
////            this.firepad.setHtml('');
////        }
//    });
//
//    // An example of a complex custom entity.
//    this.firepad.registerEntity('checkbox', {
//        render: function (info, entityHandler) {
//            var inputElement = document.createElement('input');
//            inputElement.setAttribute('type', 'checkbox');
//            if (info.checked) {
//                inputElement.checked = 'checked';
//            }
//            inputElement.addEventListener('click', function () {
//                entityHandler.replace({checked: this.checked});
//            });
//            return inputElement;
//        }.bind(this),
//        fromElement: function (element) {
//            var info = {};
//            if (element.hasAttribute('checked')) {
//                info.checked = true;
//            }
//            return info;
//        },
//        update: function (info, element) {
//            if (info.checked) {
//                element.checked = 'checked';
//            } else {
//                element.checked = null;
//            }
//        },
//        export: function (info) {
//            var inputElement = document.createElement('checkbox');
//            if (info.checked) {
//                inputElement.setAttribute('checked', true);
//            }
//            return inputElement;
//        }
//    });
//};
//
//// Helper to get hash from end of URL or generate a random one.
//TextEditor.prototype.getExampleRef = function () {
//    var ref = new Firebase('https://sharedpentest.firebaseio.com/');
//    var hash = this.key;
//    if (hash) {
//        ref = ref.child("-" + hash.split("/-")[1]);
//    } else {
//        ref = ref.push(); // generate unique location.
//    }
//    if (typeof console !== 'undefined') {
//        console.log('Firebase data: ', ref.toString());
//    }
//    this.key = ref;
//    return ref;
//};
//
//TextEditor.prototype.getKey = function () {
//    return this.key;
//};
//
//TextEditor.prototype.getTextEditor = function () {
//    return this.firepad.getHtml();
//};