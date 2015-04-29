var Tab = function (id, noElement, nomeModelo) {
    this.id = id;
    this.modelo = new Modelo(noElement);
    this.nomeModelo = nomeModelo;
};

var Modelo = function (noElement) {
    this.arrayElem = {};
    this.noElement = noElement;
};

var Element = function (id, elementType, keyEditor) {
    this.id = id;
    this.elementType = elementType;
    this.conteudo = "";
    this.keyEditor = keyEditor;
};