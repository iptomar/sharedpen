var Draw = function (tabClass, page, id) {
    this.tabClass = tabClass;
    this.page = page;
    this.id = id;
    this.flag = false;
    this.color = "black";
    this.curSize = 1;
    this.pallet = false;
    this.resizeCanvas = false;
    this.canvas = document.getElementById(this.id);
    this.crx;
};

Draw.prototype.init = function () {
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "solid";
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.curSize;
    this.ctx.lineCap = "round";
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
};

Draw.prototype.getColor = function () {
    return this.color;
};

Draw.prototype.getSizeCursor = function () {
    return this.curSize;
};

Draw.prototype.resize = function () {
    if (!this.resizeCanvas) {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.resizeCanvas = true;
    }
};

Draw.prototype.draw = function (x, y, type) {
    if (type === "mousedown") {
        this.resize();
        this.ctx.beginPath();
        this.flag = true;
        this.ctx.moveTo(x, y);
    } else if (type === "mousemove" && this.flag) {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    } else {
        this.flag = false;
        this.ctx.closePath();
    }
};

Draw.prototype.drawOtherUser = function (cor, sizecur, x, y, type) {
    this.resize();
    var corline = this.getColor();
    var cur = this.getSizeCursor();
    this.setColor(cor);
    this.setSizePensil(sizecur);

    if (type === "mousedown") {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    } else if (type === "mousemove") {
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    } else {
        this.ctx.closePath();
    }
    this.setColor(corline);
    this.setSizePensil(cur);

};

Draw.prototype.setPallet = function (x, y, id) {
    if (!this.pallet) {
        this.pallet = true;
        $.get("../html/pallet.html", function (data) {
            $(document.body).append(data);
            $("#toolbar").attr('data-idPai', id);
            $("#toolbar").css({
                top: y,
                left: x
            });
        });
    }
};

Draw.prototype.setPalletOff = function () {
    this.pallet = false;
};

Draw.prototype.setSizePensil = function (val) {
    this.curSize = val;
    this.ctx.lineWidth = val;
};

Draw.prototype.setColor = function (obj) {
    switch (obj) {
        case "green":
            this.color = "green";
            break;
        case "blue":
            this.color = "blue";
            break;
        case "red":
            this.color = "red";
            break;
        case "yellow":
            this.color = "yellow";
            break;
        case "orange":
            this.color = "orange";
            break;
        case "black":
            this.color = "black";
            break;
        case "white":
            this.color = "white";
            break;
        default :
    }
    this.ctx.strokeStyle = this.color;
};