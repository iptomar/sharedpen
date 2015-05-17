var Poema = function (titulo, text, img) {
    this.titulo = titulo;
    this.text = text;
    this.img = img;
    this.palavras = ["Banana", "Orange", "Apple", "Mango"];
};


/**
 * 
 * @param {type} livro
 * @param {type} img
 * @returns {undefined}
 */
function AddPoema(livro, img) {

    var idNum = livro.length;
    livro[idNum] = new Poema("", "", img);
    //var idNum = (Object.keys(hash).length + 1);
    // Adiciona um separador antes do Ãºltimo (linha <li></li> antes do last-child)

    $('ul#poemas li:last-child').before(
            '<li id="li' +
            (idNum) +
            '"><a href="#page' +
            (idNum) +
            '" role="tab" data-toggle="tab">Poema ' +
            (idNum) +
            ' <button type="button" id=' +
            (idNum) +
            ' class="btn btn-warning btn-xs xtab"><span>x</span></button></a>');
    // Adiciona a pÃ¡gina depois da Ãºltima pÃ¡gina (<div></div> markup after the last-child of the <div class="tab-content">)
    $('div.tab-content').append(
            '<div class="tab-pane fade" id="page' + idNum +
            '"><div class="PoemaImg txtTab' + idNum + '" style="float: left; width: 100%; height: 400px;">' +
            //'<img src="' + img + '"></div>' +
            '</div>');

    $(".txtTab" + idNum).append('<textarea id="txtText' + idNum + '" style="float: left; background-image: url(' + img + ');  background-size: 100% 100%; background-repeat:no-repeat; width: 60%; height: 500px; border:double 2px black; resize: none; font-weight:normal;color:#000000;letter-spacing:1pt;word-spacing:9pt;font-size:150%;text-align:left;font-family:verdana, sans-serif;line-height:2;" onKeyUp="checkhits(this)">' +
            '</textarea>');

    var ajudas = livro[idNum].palavras;

    if (ajudas.length > 0) {
        var wordshelp = '<div class="help class="" style="float: left; border:dashed 5px black; width: 40%; height: 150px;"> ' +
                '<h1 class="text-center">AJUDA </h1>' +
                '<p>';
        for (var i in ajudas) {
            wordshelp += '<span class="badge">' + ajudas[i] + '</span> ';
        }
        wordshelp += '</p>' +
                '</div>';

        $(".txtTab" + idNum).append(wordshelp);
    }
}


function checkhits(myfield) {
    var hits = myfield.value.split(" ");
    for (var i = 0; i < hits.length; i++) {
        $('span').filter(function () {
            return $(this).text() == hits[i];
        }).css("text-decoration", "line-through", "color", "green");
    }
}
;