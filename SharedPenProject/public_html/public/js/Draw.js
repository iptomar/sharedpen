function Draw(pai, id) {

    this.pai = pai;
    this.id = id;
    this.canvas;
    this.crx;
    this.paint = false;
    this.canvas = document.getElementById(this.id);
    var mouse = {x: 0, y: 0};
    var last_mouse = {x: 0, y: 0};
    this.init = function () {

        this.canvas.addEventListener('mousemove', function (e) {
            last_mouse.x = mouse.x;
            last_mouse.y = mouse.y;

            mouse.x = e.pageX - this.offsetLeft;
            mouse.y = e.pageY - this.offsetTop;
        }, false);
        this.canvas.addEventListener('mousedown', function (e) {
            this.canvas.addEventListener('mousemove', this.draw(), false);
        }, false);

        this.canvas.addEventListener('mouseup', function () {
            this.canvas.removeEventListener('mousemove', this.draw(), false);
        }, false);

        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "solid";
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "square"; //butt, round, square

    };
    this.setColor = function (color) {
        this.ctx.strokeStyle = color;
    };

    this.draw = function () {
        this.ctx.beginPath();
        this.ctx.moveTo(last_mouse.x, last_mouse.y);
        this.ctx.lineTo(mouse.x, mouse.y);
        this.ctx.closePath();
        this.ctx.stroke();
    };








//    this.canvas;
//    this.ctx;
//    this.flag = false;
//    this.prevX = 0;
//    this.currX = 0;
//    this.prevY = 0;
//    this.currY = 0;
//    this.dot_flag = false;
//    this.canvas = document.getElementById(this.id);
//
//    this.x = "black";
//    this.y = 2;
//
//    this.init = function () {
//
//        this.canvas.addEventListener("mousemove", function (e) {
//            alert("move");
//            this.findxy('move', e);
//        }, false);
//        this.canvas.addEventListener("mousedown", function (e) {
//            this.findxy('down', e);
//        }, false);
//        this.canvas.addEventListener("mouseup", function (e) {
//            this.findxy('up', e);
//        }, false);
//        this.canvas.addEventListener("mouseout", function (e) {
//            this.findxy('out', e);
//        }, false);
//        this.ctx = this.canvas.getContext('2d');
//        this.w = this.canvas.width;
//        this.h = this.canvas.height;
//    };
//
//    this.color = function (obj) {
//        switch (obj) {
//            case "green":
//                this.x = "green";
//                break;
//            case "blue":
//                this.x = "blue";
//                break;
//            case "red":
//                this.x = "red";
//                break;
//            case "yellow":
//                this.x = "yellow";
//                break;
//            case "orange":
//                this.x = "orange";
//                break;
//            case "black":
//                this.x = "black";
//                break;
//            case "white":
//                this.x = "white";
//                break;
//        }
//        if (this.x == "white")
//            this.y = 14;
//        else
//            this.y = 2;
//
//    };
//
//    this.draw = function () {
//        this.ctx.beginPath();
//        this.ctx.moveTo(this.prevX, this.prevY);
//        ctx.lineTo(this.currX, this.currY);
//        this.ctx.strokeStyle = this.x;
//        this.ctx.lineWidth = this.y;
//        this.ctx.stroke();
//        this.ctx.closePath();
//    };
//
//    this.erase = function () {
//        var m = confirm("Want to clear");
//        if (m) {
//            this.ctx.clearRect(0, 0, this.w, this.h);
////        document.getElementById("canvasimg").style.display = "none";
//        }
//    }
//
//    this.save = function () {
//        document.getElementById("canvasimg").style.border = "2px solid";
//        var dataURL = this.canvas.toDataURL();
//        document.getElementById("canvasimg").src = dataURL;
//        document.getElementById("canvasimg").style.display = "inline";
//    };
//
//    this.findxy = function (res, e) {
//        if (res === 'down') {
//            this.prevX = this.currX;
//            this.prevY = this.currY;
//            this.currX = e.clientX - this.canvas.offsetLeft;
//            this.currY = e.clientY - this.canvas.offsetTop;
//
//            this.flag = true;
//            this.dot_flag = true;
//            if (this.dot_flag) {
//                this.ctx.beginPath();
//                this.ctx.fillStyle = this.x;
//                this.ctx.fillRect(this.currX, this.currY, 2, 2);
//                this.ctx.closePath();
//                this.dot_flag = false;
//            }
//        }
//        if (res === 'up' || res === "out") {
//            this.flag = false;
//        }
//        if (res === 'move') {
//            if (this.flag) {
//                this.prevX = this.currX;
//                this.prevY = this.currY;
//                this.currX = e.clientX - this.canvas.offsetLeft;
//                this.currY = e.clientY - this.canvas.offsetTop;
//                this.draw();
//            }
//        }
//    };
}