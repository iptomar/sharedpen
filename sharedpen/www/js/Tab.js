var Tab = function (id, noElement, numModelo) {
    this.id = id;
    this.modelo = new Modelo(noElement);
    this.numModelo = numModelo;
    this.poema;
    this.projID;
    this.projtipo;
    this.styles;
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
