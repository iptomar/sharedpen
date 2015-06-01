
var Tab = function (id, noElement, nomeModelo) {
    this.id = id;
    this.modelo = new Modelo(noElement);
    this.nomeModelo = nomeModelo;
    this.poema;
};

var Modelo = function (noElement) {

    this.arrayElem = {};
    this.noElement = noElement;

};

var Element = function (id, elementType) {
    this.id = id;
    this.conteudo = "";
    this.elementType = elementType;
    this.drawObj;
    this.editor;
};

Element.prototype.createCanvasObj = function (tabClass, page, id) {
    this.drawObj = new Draw(this.id, page, this.id);
};

Element.prototype.createTextEditor = function (elemento, username, userColor, socketid, socket) {
    this.editor = new TextEditor(elemento, username, userColor, socketid, socket);
};
