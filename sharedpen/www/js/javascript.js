
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

/**
 * 
 * @param {type} val1
 * @param {type} val2
 * @returns {undefined}
 */
$.fn.addNewText = function (val1, val2) {
    this.append(
            "<div class='p_msg_chat'>" +
            "<p class = 'user_chat' > " +
            val1 +
            "</p> : <p class='msg_chat'>" +
            val2 +
            "</p></div>");
};

/**
 * 
 * @param {type} lista
 * @returns {undefined}
 */
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
    bigint = 100 * bigint;
    var r = ((bigint >> 16) & 255);
    var g = (bigint >> 8) & 255;
    var b = (bigint & 255);

    if (g !== undefined) {
        return Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1);
    }
    else {
        return Number(0x1000000 + r[0] * 0x10000 + r[1] * 0x100 + r[2]).toString(16).substring(1);
    }
}


function textToNumber(nome){
	var result="";
	for (var i = 0, max = nome.length; i < max; i++) {
        result += nome[i].charCodeAt(0);
    }
	return result;
	
}

$.fn.contextMenu = function (settings) {

    return this.each(function () {

        // Open context menu
        $(this).on("contextmenu", function (e) {
            // return native menu if pressing control
            if (e.ctrlKey)
                return;

            //open menu
            $(settings.menuSelector)
                    .data("invokedOn", $(e.target))
                    .show()
                    .css({
                        position: "absolute",
                        left: getMenuPosition(e.clientX, 'width', 'scrollLeft'),
                        top: getMenuPosition(e.clientY, 'height', 'scrollTop')
                    })
                    .off('click')
                    .on('click', function (e) {
                        $(this).hide();

                        var $invokedOn = $(this).data("invokedOn");
                        var $selectedMenu = $(e.target);

                        settings.menuSelected.call(this, $invokedOn, $selectedMenu);
                    });

            return false;
        });

        //make sure menu closes on any click
        $(document).click(function () {
            $(settings.menuSelector).hide();
        });
    });

    function getMenuPosition(mouse, direction, scrollDir) {
        var win = $(window)[direction](),
                scroll = $(window)[scrollDir](),
                menu = $(settings.menuSelector)[direction](),
                position = mouse + scroll;

        // opening menu would pass the side of the page
        if (mouse + menu > win && menu < mouse)
            position -= menu;

        return position;
    }

};