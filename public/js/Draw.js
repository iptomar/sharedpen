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
    this.apagar = false;
    this.ArrayCanvasClients = {};
    this.ArrayCanvasImage={};
    this.bgImg ="";
    this.apagarTodos=false;
};

Draw.prototype.init = function () { 
        
    //cria o canavs onde vao ser colocadas as imagens de fundo
    var cnv = document.createElement("canvas");
    cnv.setAttribute("id","tab"+this.tabNumber+"-background");
    cnv.width = 700;
    cnv.height = 400;
    cnv.style.zIndex = "0";
    $("#tab"+this.tabNumber+"-canvasdr").append(cnv);

    //cria o seu canvas (onde vai escrever)
    var cnv = document.createElement("canvas");
    cnv.setAttribute("id","tab"+this.tabNumber+"-Mycanvas");
    cnv.width = 700;
    cnv.height = 400;
    cnv.style.zIndex = "2";
    $("#tab"+this.tabNumber+"-canvasdr").append(cnv);
    
    
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
        cnv.style.zIndex = "2";
        $("#tab"+this.tabNumber+"-canvasdr").append(cnv);
        
        this.ArrayCanvasClients[socket] = cnv;
    }
    return  this.ArrayCanvasClients[socket];
};

Draw.prototype.getColor = function () {
    return this.color;
};
Draw.prototype.getApagarTudo = function () {
    return this.apagarTodos;
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


Draw.prototype.draw = function (x, y, type,sizecur) {
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    if (!this.apagar) {
        this.paintThis(ctx, x, y, type, "source-over");
    } else {
        this.paint(canvas,ctx, x, y, type, "destination-out");
        if (this.apagarTodos){
            for(item in this.ArrayCanvasClients){
                canvas = this.ArrayCanvasClients[item];
                ctx = canvas.getContext('2d');
                ctx.lineWidth = sizecur;
                this.paint(canvas,ctx, x, y, type, "destination-out");
            }
        }
    }
    
};

Draw.prototype.paint = function (canvas2, ctx, x, y, type, opt) {
    if (type === "mousedown") {
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

Draw.prototype.drawOtherUser = function (cor, sizecur, x, y, type, socket, image, apagar,apagarTudo) {

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
        if (apagarTudo){
            this.tabNumber
            for(item in this.ArrayCanvasClients){
                console.log(item);
                canvas2 = this.ArrayCanvasClients[item];
                ctx2 = canvas2.getContext('2d');
                ctx2.strokeStyle = cor;
                ctx2.lineWidth = sizecur;
                this.paint(canvas2,ctx2, x, y, type, "destination-out");
            }
            //Apaga o canvas do cliente!
            var canvas2 = document.getElementById("tab"+this.tabNumber+"-Mycanvas");    
            var ctx2 = canvas2.getContext('2d');
            ctx2.lineWidth = sizecur;
            this.paint(canvas2,ctx2, x, y, type, "destination-out");
            
         }

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
    var canvas = document.getElementById(this.id);
    var ctx = canvas.getContext("2d");
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    return canvas.toDataURL("image/png");
};
