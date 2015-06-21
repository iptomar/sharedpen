/**
 * Desenho corporativo
 * @param {type} tabClass   class ende esta o canvas
 * @param {type} page       tab do canvas
 * @param {type} id
 * @param {type} counter
 * @returns {Draw}
 */
var Draw = function (tabClass, page, id, counter) {
    this.counter = counter;
    this.tabClass = tabClass;
    if (typeof tabClass !== "undefined") {
        this.tabNumber = tabClass.match(/\d+/)[0];
    }
    this.page = page;
    this.id = id;
    this.flag = false;
    this.color = "black";
    this.curSize = 1;
    this.apagar = false;
    this.ArrayCanvasClients = {};
    this.ArrayCanvasImage = {};
    this.bgImg = "";
    this.apagarTodos = false;
};

/**
 * Inicializa o canvas
 * @returns {undefined}
 */
Draw.prototype.init = function () {

    var widthPai = $("#tab" + this.tabNumber + "-canvasdr").parent().width();
    var heightPai = $("#tab" + this.tabNumber + "-canvasdr").parent().height();

    //cria o canavs onde vao ser colocadas as imagens de fundo
    var cnv = document.createElement("canvas");
    cnv.setAttribute("id", "tab" + this.tabNumber + "-background");
    cnv.width = widthPai;
    cnv.height = heightPai;
    cnv.style.zIndex = "0";
    $("#tab" + this.tabNumber + "-canvasdr").append(cnv);

    //cria o seu canvas (onde vai escrever)
    var cnv = document.createElement("canvas");
    cnv.setAttribute("id", "tab" + this.tabNumber + "-Mycanvas");
    cnv.width = widthPai;
    cnv.height = heightPai;
    cnv.style.zIndex = "2";
    $("#tab" + this.tabNumber + "-canvasdr").append(cnv);

    var ctx = cnv.getContext("2d");
    ctx.fillStyle = "solid";
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.curSize;
    ctx.lineCap = "round";

    this.ArrayCanvasClients = {};
};

/**
 * Devolve o canvas do utilizador
 * @param {type} socket
 * @returns {Draw.ArrayCanvasClients}
 */
Draw.prototype.VerificaUser = function (socket) {
    if (typeof this.ArrayCanvasClients[socket] === "undefined") {

        var canvas = document.getElementById(this.id);
        //var ctx = canvas.getContext("2d");

        var cnv = document.createElement("canvas");
        cnv.setAttribute("id", this.id + "" + socket);
        cnv.width = canvas.width;
        cnv.height = canvas.height;
        cnv.style.zIndex = "2";
        $("#tab" + this.tabNumber + "-canvasdr").append(cnv);

        this.ArrayCanvasClients[socket] = cnv;
    }
    return  this.ArrayCanvasClients[socket];
};

/**
 * devolve a cor pretendida
 * @returns {String}
 */
Draw.prototype.getColor = function () {
    return this.color;
};
/**
 * devolve o estado para apagar a imagem em todos os canvas
 * @returns {Boolean}
 */
Draw.prototype.getApagarTudo = function () {
    return this.apagarTodos;
};

/**
 * devolve o tamanho do cursor
 * @returns {Number}
 */
Draw.prototype.getSizeCursor = function () {
    return this.curSize;
};

Draw.prototype.getApagar = function () {
    return this.apagar;
};

/**
 * Devolve o canvas
 * @returns {Element}
 */
Draw.prototype.getCanvas = function () {
    var canvas = document.getElementById(this.id);
    return canvas;
};

/**
 * Desenha no canvas
 * @param {type} x
 * @param {type} y
 * @param {type} type
 * @param {type} sizecur
 * @returns {undefined}
 */
Draw.prototype.draw = function (x, y, type, sizecur) {

    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    if (!this.apagar) {
        this.paintThis(ctx, x, y, type, "source-over");
    } else {
        this.paint(canvas, ctx, x, y, type, "destination-out");
        if (this.apagarTodos) {
            for (var item in this.ArrayCanvasClients) {
                canvas = this.ArrayCanvasClients[item];
                ctx = canvas.getContext('2d');
                ctx.lineWidth = sizecur;
                this.paint(canvas, ctx, x, y, type, "destination-out");
            }
        }
    }

};

Draw.prototype.paint = function (canvas2, ctx, x, y, type, opt) {
    if (type === "mousedown" || type === "touchstart") {
        ctx.beginPath();
        ctx.globalCompositeOperation = opt;
        ctx.moveTo(x, y);
    } else if (type === "mousemove" || type === "touchmove") {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        ctx.closePath();
    }
};

Draw.prototype.paintThis = function (ctx, x, y, type, opt) {
    if (type === "mousedown" || type === "touchstart") {
        ctx.beginPath();
        ctx.globalCompositeOperation = opt;
        this.flag = true;
        ctx.moveTo(x, y);
    } else if ((type === "mousemove" || type === "touchmove") && this.flag) {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        this.flag = false;
        ctx.closePath();
    }
};

/**
 * Desenha a imagem dos outros utilizadores
 * @param {type} cor
 * @param {type} sizecur
 * @param {type} x
 * @param {type} y
 * @param {type} type
 * @param {type} socket
 * @param {type} image
 * @param {type} apagar
 * @param {type} apagarTudo
 * @returns {undefined}
 */
Draw.prototype.drawOtherUser = function (cor, sizecur, x, y, type, socket, image, apagar, apagarTudo) {

    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");

    var canvas2 = this.VerificaUser(socket);

    var ctx2 = canvas2.getContext('2d');

    ctx2.fillStyle = "solid";
    ctx2.strokeStyle = cor;
    ctx2.lineWidth = sizecur;
    ctx2.lineCap = "round";
    if (!apagar) {
        this.paint(canvas2, ctx2, x, y, type, "source-over");
    } else {
        this.paint(canvas2, ctx2, x, y, type, "destination-out");
        if (apagarTudo) {
            this.tabNumber
            for (var item in this.ArrayCanvasClients) {
                console.log(item);
                canvas2 = this.ArrayCanvasClients[item];
                ctx2 = canvas2.getContext('2d');
                ctx2.strokeStyle = cor;
                ctx2.lineWidth = sizecur;
                this.paint(canvas2, ctx2, x, y, type, "destination-out");
            }
            //Apaga o canvas do cliente!
            var canvas2 = document.getElementById("tab" + this.tabNumber + "-Mycanvas");
            var ctx2 = canvas2.getContext('2d');
            ctx2.lineWidth = sizecur;
            this.paint(canvas2, ctx2, x, y, type, "destination-out");
        }
    }
    if (type === "backgoundImage") {
        this.imageCanvas(image);
    }
};

/**
 * Altera a imagem de fundo do canvas
 * @param {type} dataURL
 * @returns {undefined}
 */
Draw.prototype.imageCanvas = function (dataURL) {
    $("#tab" + this.tabNumber + "-background").css({
        "background": "url(" + dataURL + ")  no-repeat center center",
        "background-size": "100% auto"
    });
};

/**
 * Adiciona a palete de selecaoao canvas
 * @param {type} id
 * @param {type} cnv
 * @returns {undefined}
 */
Draw.prototype.setPallet = function (id, cnv) {
    $.get("./../html/pallet.html", function (data) {
        $(document.body).append(data);
        $("#LoadImageCanvas").attr('data-idPai', id);
        $("#LoadImageCanvas").attr('data-idcnv', cnv);
    });
};

/**
 * altera o tamanho do crsor
 * @param {type} val
 * @returns {undefined}
 */
Draw.prototype.setSizePensil = function (val) {
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    this.curSize = val;
    ctx.lineWidth = val;
};

/**
 * altera a cor do cursor
 * @param {type} obj
 * @returns {undefined}
 */
Draw.prototype.setColor = function (obj) {
    if (obj === "apagar") {
        this.apagar = true;
    } else {
        this.color = obj;
        this.apagar = false;
    }
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.color;
};

/**
 * Ativa a funcionalidade de apagar em todos os canvas
 * @param {type} obj
 * @returns {undefined}
 */
Draw.prototype.setApagarTudo = function (obj) {
    console.log(obj);
    if (obj) {
        this.apagar = true;
        this.apagarTodos = true;
    } else {
        this.color = "apagar";
        this.apagarTodos = false;
        this.apagar = true;
    }
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = this.color;
};

Draw.prototype.getImgCanvas = function () {
//    var canvas = document.getElementById(this.id);
//    var ctx = canvas.getContext("2d");
//    var image = new Image();
//    var img = new Image();
//    var a = "data:image/png;base64,";
//    if (typeof this.ArrayCanvasClients !== "undefined") {
//        for (var i in   this.ArrayCanvasClients) {
//            var canvas2 = this.VerificaUser(i);
//            var ctx2 = canvas2.getContext('2d');
//            img.src = canvas2.toDataURL("image/png");
//           console.log(img.src);
//            
//        }
//    }
////    console.log(a);
////    image.src = canvas.toDataURL("image/png");
////    return canvas.
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return canvas.toDataURL("image/png");
};
//var canvas = document.getElementById('canvas');
//var context = canvas.getContext('2d');
//Image img1 = new Image();
//Image img2 = new Image();
//
//img1.onload = function() {
//    canvas.width = img1.width;
//    canvas.height = img1.height;
//    img2.src = 'imgfile2.png';
//};
//img2.onload = function() {
//    context.globalAlpha = 1.0;
//    context.drawImage(img1, 0, 0);
//    context.globalAlpha = 0.5; //Remove if pngs have alpha
//    context.drawImage(img2, 0, 0);
//};        
//
//img1.src = 'imgfile1.png';
