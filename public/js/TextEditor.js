var TextEditor = function (idpai, key) {
    this.idpai = idpai;
    this.key = key;
};

TextEditor.prototype.init = function () {
    //// Initialize Firebase.
    var firepadRef = this.getExampleRef();
    // TODO: Replace above line with:
    // var firepadRef = new Firebase('<YOUR FIREBASE URL>');

    //// Create CodeMirror (with lineWrapping on).
    var codeMirror = CodeMirror(document.getElementById(this.idpai), {
        lineWrapping: true
    });

    //// Create Firepad (with rich text toolbar and shortcuts enabled).
    var firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, {
        richTextToolbar: true,
        richTextShortcuts: true
    });


    //// Initialize contents.
    firepad.on('ready', function () {
        if (firepad.isHistoryEmpty()) {
            firepad.setHtml('');
        }
    });

    // An example of a complex custom entity.
    firepad.registerEntity('checkbox', {
        render: function (info, entityHandler) {
            var inputElement = document.createElement('input');
            inputElement.setAttribute('type', 'checkbox');
            if (info.checked) {
                inputElement.checked = 'checked';
            }
            inputElement.addEventListener('click', function () {
                entityHandler.replace({checked: this.checked});
            });
            return inputElement;
        }.bind(this),
        fromElement: function (element) {
            var info = {};
            if (element.hasAttribute('checked')) {
                info.checked = true;
            }
            return info;
        },
        update: function (info, element) {
            if (info.checked) {
                element.checked = 'checked';
            } else {
                element.checked = null;
            }
        },
        export: function (info) {
            var inputElement = document.createElement('checkbox');
            if (info.checked) {
                inputElement.setAttribute('checked', true);
            }
            return inputElement;
        }
    });
};

// Helper to get hash from end of URL or generate a random one.
TextEditor.prototype.getExampleRef = function () {
    var ref = new Firebase('https://sharedpentest.firebaseio.com/');
    var hash = this.key
    if (hash) {
        ref = ref.child("-" + hash.split("-")[1]);
    } else {
        ref = ref.push(); // generate unique location.
    }
    if (typeof console !== 'undefined') {
        console.log('Firebase data: ', ref.toString());
    }
    this.key = ref;
    return ref;
};

TextEditor.prototype.getKey = function () {
    return this.key;
};

