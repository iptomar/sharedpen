var Draw = function (tabClass, page, id,counter) {
    this.counter = counter;
    this.tabClass = tabClass;
    if(typeof tabClass !== "undefined")
        this.tabNumber = tabClass.match(/\d+/)[0];
    this.page = page;
    this.id = id ;
    this.flag = false;
    this.color = "black";
    this.curSize = 1;
    this.resizeCanvas = false;
    this.apagar = false;
    this.ArrayCanvasClients = [];
};

Draw.prototype.init = function () {
    
    
        var cnv = document.createElement("canvas");
        cnv.setAttribute("id","tab"+this.tabNumber+"-background");
        cnv.width = 700;
        cnv.height = 400;
        $("#tab"+this.tabNumber+"-canvasdr").append(cnv);
    
        var cnv = document.createElement("canvas");
        cnv.setAttribute("id","tab"+this.tabNumber+"-Mycanvas");
        cnv.width = 700;
        cnv.height = 400;
        $("#tab"+this.tabNumber+"-canvasdr").append(cnv);
    

    
    //var canvas = document.getElementById(this.id);
    
    var ctx = cnv.getContext("2d");
    ctx.fillStyle = "solid";
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.curSize;
    ctx.lineCap = "round";



    this.ArrayCanvasClients = {};
};

Draw.prototype.VerificaUser = function (socket) {
    if (typeof this.ArrayCanvasClients[socket] === "undefined") {

        var canvas = document.getElementById(this.id);
        //var ctx = canvas.getContext("2d");

        var cnv = document.createElement("canvas");
        cnv.setAttribute("id",this.id+""+socket);
        cnv.width = canvas.width;
        cnv.height = canvas.height;
        
        $("#tab"+this.tabNumber+"-canvasdr").append(cnv);
        
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

Draw.prototype.paint = function (canvas2, ctx, x, y, type, opt) {
    if (type === "mousedown") {
      //  canvas2.width = 700;
       // canvas2.height = 700;
        ctx.beginPath();
        ctx.globalCompositeOperation = opt;
        ctx.moveTo(x, y);
    } else if (type === "mousemove") {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        ctx.closePath();
    }
};

Draw.prototype.paintThis = function (ctx, x, y, type, opt) {
    if (type === "mousedown") {
        ctx.beginPath();
        ctx.globalCompositeOperation = opt;
        this.flag = true;
        ctx.moveTo(x, y);
    } else if (type === "mousemove" && this.flag) {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else {
        this.flag = false;
        ctx.closePath();
    }
};

Draw.prototype.drawOtherUser = function (cor, sizecur, x, y, type, socket, image, apagar) {

    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    
    var canvas2 = this.VerificaUser(socket);
    var ctx2 = canvas2.getContext('2d');

    ctx2.fillStyle = "solid";
    ctx2.strokeStyle = cor;
    ctx2.lineWidth = sizecur;
    ctx2.lineCap = "round";
    if (!apagar) {
        this.paint(canvas2,ctx2, x, y, type, "source-over");
    } else {
        this.paint(canvas2,ctx2, x, y, type, "destination-out");

    }

    if (type === "backgoundImage") {
        this.imageCanvas(image);
    }
};

Draw.prototype.imageCanvas = function (dataURL) {
    $("#tab" + this.tabNumber+ "-background").css({
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
