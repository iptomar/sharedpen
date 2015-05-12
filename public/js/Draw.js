var Draw = function (tabClass, page, id) {
    this.tabClass = tabClass;
    this.page = page;
    this.id = id;
    this.flag = false;
    this.color = "black";
    this.curSize = 1;
    this.resizeCanvas = false;
    this.apagar = false;
    this.ArrayCanvasClients = [];
    this.canvasArray = [];
    this.isWriting = false;
    this.x = 0;
    this.y = 0;
    this.x1 = 0;
    this.y1 = 0;
};

Draw.prototype.init = function () {
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "solid";
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.curSize;
    ctx.lineCap = "round";

    canvas.width = 700;
    canvas.height = 700;

    this.ArrayCanvasClients = {};
};

Draw.prototype.VerificaUser = function (socket) {
    if (typeof this.ArrayCanvasClients[socket] === "undefined") {
        var canvas = document.getElementById(this.id);
        //var ctx = canvas.getContext("2d");

        var cnv = document.createElement("canvas");
        cnv.width = canvas.width;
        cnv.height = canvas.height;
        this.ArrayCanvasClients[socket] = cnv;
    }
    return  this.ArrayCanvasClients[socket];
};

Draw.prototype.getColor = function () {
    return this.color;
};

Draw.prototype.getSizeCursor = function () {
    return this.curSize;
};

Draw.prototype.getApagar = function () {
    return this.apagar;
};

Draw.prototype.getCanvas = function () {
    var canvas = document.getElementById(this.id);
    return canvas;
};

Draw.prototype.resize = function () {
    if (!this.resizeCanvas) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.resizeCanvas = true;
    }
};

Draw.prototype.draw = function (x, y, type) {
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    if (!this.apagar) {
        this.paintThis(ctx, x, y, type, "source-over");
    } else {
        this.paintThis(ctx, x, y, type, "destination-out");
    }
};

Draw.prototype.paintThis = function (ctx, x, y, type, opt) {
    if (type === "mousedown") {
        this.isWriting = true;
        ctx.beginPath();
        ctx.globalCompositeOperation = opt;
        this.flag = true;
        ctx.moveTo(x, y);
    } else if (type === "mousemove" && this.flag) {
        if (this.x1 != 0)
            ctx.moveTo(this.x1, this.y1);
        else
            ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
        this.x1 = x;
        this.y1 = y;
    } else {
        this.flag = false;
        ctx.closePath();
        this.isWriting = false;
        this.CheckDrawOtherUser();
        this.x1 = 0;
        this.y1 = 0;
    }
};

Draw.prototype.paint = function (canvas2, ctx, x, y, type, opt) {
    if (type === "mousedown") {
        ctx.beginPath();
        ctx.globalCompositeOperation = opt;
        ctx.moveTo(x, y);
    } else if (type === "mousemove") {
        if (this.x !== 0)
            ctx.moveTo(this.x, this.y);
        else
            ctx.moveTo(x, y);
        //pinta
        ctx.lineTo(x, y);
        ctx.stroke();
        //actualiza o x e y
        this.x = x;
        this.y = y;
    } else {
        ctx.closePath();
        this.x = 0;
        this.y = 0;
    }
};

Draw.prototype.CheckDrawOtherUser = function () {
    if (!this.isWriting) {
        for (var item in this.canvasArray) {
            var last = Object.keys(this.canvasArray[item]).length - 1;

            if (this.canvasArray[item][last].type === "mouseup" ||
                    this.canvasArray[item][last].type === "backgoundImage") {

                for (var item1 in this.canvasArray[item]) {
                    it = this.canvasArray[item][item1];
                    this.drawOU(it.cor, it.sizecur, it.x, it.y, it.type, it.socket, it.image, it.apagar);
                }
                delete this.canvasArray[item];
            }
        }
    }
};

Draw.prototype.drawOU = function (cor, sizecur, x, y, type, socket, image, apagar) {
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");

    var oldCor = this.getColor();
    var oldSize = this.getSizeCursor();

    ctx.fillStyle = "solid";
    ctx.strokeStyle = cor;
    ctx.lineWidth = sizecur;
    ctx.lineCap = "round";
    if (!apagar) {
        this.paint(canvas, ctx, x, y, type, "source-over");
    } else {
        this.paint(canvas, ctx, x, y, type, "destination-out");
    }

    if (type === "backgoundImage") {
        this.imageCanvas(image);
    }

    ctx.strokeStyle = oldCor;
    ctx.lineWidth = oldSize;
};

Draw.prototype.drawOtherUser = function (cor, sizecur, x, y, type, socket, image, apagar) {
    if (typeof this.canvasArray[socket] === "undefined") {
        this.canvasArray[socket] = [];
    }
    this.canvasArray[socket].push({
        cor: cor,
        sizecur: sizecur,
        x: x,
        y: y,
        type: type,
        socket: socket,
        image: image,
        apagar: apagar});
    this.CheckDrawOtherUser();
};

Draw.prototype.imageCanvas = function (dataURL) {
    $("#" + this.id).css({
        "background": "url(" + dataURL + ")  no-repeat center center",
        "background-size": "100% auto"
    });
};

Draw.prototype.setPallet = function (id, cnv) {
    $.get("./../html/pallet.html", function (data) {
        $(document.body).append(data);
        $("#LoadImageCanvas").attr('data-idPai', id);
        $("#LoadImageCanvas").attr('data-idcnv', cnv);
    });
};

Draw.prototype.setSizePensil = function (val) {
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    this.curSize = val;
    ctx.lineWidth = val;
};

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

Draw.prototype.getImgCanvas = function () {
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return canvas.toDataURL("image/png");
};
