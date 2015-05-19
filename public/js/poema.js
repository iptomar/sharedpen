/**
 * 
 * @param {type} titulo
 * @param {type} text
 * @param {type} img
 * @returns {Poema}
 */
var Poema = function (titulo, text, img) {
	this.titulo = titulo;
	this.text = text;
	this.img = img;
	this.palavras = ["Banana", "Orange", "Apple", "Mango"];
};

/**
 * retorna array com as palavras de ajuda
 */ 
Poema.prototype.getAjuda = function () {
	return this.palavras;
};

/**
 * retorna o caminho da imagem do poema
 */ 
Poema.prototype.getImg = function () {
	return this.img;
};

/**
 * retorna o titulo do poema
 */ 
Poema.prototype.getTitulo = function () {
	return this.text;
};

/**
 * retorna o texto do poema
 */ 
Poema.prototype.getTexto = function () {
	return this.text;
};

/**
 * Modifica o titulo do poema
 */ 
Poema.prototype.setTitulo = function (titulo) {
	this.titulo = titulo;
};

/**
 * Modifica o texto do poema
 */ 
Poema.prototype.setTexto = function (texto) {
	this.text = texto;
};

/**
 * Modifica a imagem do poema
 */ 
Poema.prototype.setImg = function (img) {
	this.img = img;
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
		((idNum) +1)+
		' <button type="button" id=' +
		(idNum) +
		' class="btn btn-warning btn-xs xpoema"><span>x</span></button></a>');
	// Adiciona a pÃ¡gina depois da Ãºltima pÃ¡gina (<div></div> markup after the last-child of the <div class="tab-content">)
	$('div.tab-content').append(
		'<div class="tab-pane fade" id="page' + idNum +
		'"><div class="PoemaImg txtTab' + idNum + '" style="float: left; width: 100%; height: 400px;">' +
		//'<img src="' + img + '"></div>' +
		'</div>');


	$(".txtTab" + idNum).append('<textarea id="txtText' + idNum + '" style="float: left; background-image: url(' + img + ');  background-size: 100% 100%; background-repeat:no-repeat; width: 60%; height: 500px; border:double 2px black; resize: none; font-weight:normal;color:#000000;letter-spacing:1pt;word-spacing:9pt;font-size:150%;text-align:left;font-family:verdana, sans-serif;line-height:2;" onKeyUp="checkhits(this)">' +
								'</textarea>');

	$(".txtTab" + idNum).children('textarea').each(function () {

		//vai buscar id atribuido
		var thID = $(this).attr("id");
		var thType = $(this).prop("tagName");
		var tabNumber = thID.match(/\d+/)[0];

		var txtedit = new TextEditor($(this).attr("id"), username, userColor, socket.id, socket);
		$(this).addClass(thID);
		var editTxt = {
			id: thID,
			txtObjEditor: txtedit
		};
		allTextEditor.push(editTxt);

	});

	$("#note-editable_txtText"+idNum).css({"background": 'url('+img+') no-repeat',"background-size": "100% 100%","background-repeat":"no-repeat"});
	//.attr("onKeyUp",checkhits(idNum,$("#note-editable_txtText"+idNum)[0]));

	
	//evento que coloca 'a escuta o texto introduzido no editor 
	$("#note-editable_txtText"+idNum).keyup(function (event) {
        checkhits(idNum, $(this).text());
    });


	var ajudas = livro[idNum].palavras;

	if (ajudas.length > 0) {
		var wordshelp = '<div class="help" class="center-block" style="float: left; border:dashed 5px black; width: 40%; height: 150px; overflow-y: scroll;"> ' +
			'<h1 class="text-center"> AJUDA </h1>' +
			'<p>';
		for (var i in ajudas) {
			wordshelp += '<h3><span class="label label-info" style="float:left; margin: 3px;">' + ajudas[i] + '</span></h3>';
		}
		wordshelp += '</p></div>';
		$("body").find(".txtTab" + idNum).append(wordshelp);
	}
}

/**
 * 
 * @param {type} myfield
 * @returns {undefined}
 */
function checkhits(idTexto, myfield) {
	var hits = myfield.split(" ");
	LivroPoemas[idTexto].setTexto(myfield);
	$('.txtTab' + idTexto + ' span').removeClass("label-success").addClass("label-info").css({"text-decoration": "none"});
	for (var i = 0; i < hits.length; i++) {
		$('.txtTab' + idTexto + ' span').filter(function () {
			return $(this).text().toUpperCase()== hits[i].toUpperCase().trim() ;
		}).removeClass("label-info").addClass("label-success").css({"text-decoration": "line-through"});
	}
};




