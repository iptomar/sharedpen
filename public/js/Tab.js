var Tab = function (id, noElement, nomeModelo) {
    this.id = id;
    this.modelo = new Modelo(noElement);
    this.nomeModelo = nomeModelo;

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
    //this.allClientCanvas={};
};

Element.prototype.createCanvasObj = function (tabClass, page, id) {
    this.drawObj = new Draw(this.id, page, this.id);
};

