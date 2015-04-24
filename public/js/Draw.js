function Draw(pai, page, id) {

    this.pai = pai;
    this.page = page;
    this.id = id;
    this.flag = false;
    this.color = "black";
    this.pallet = false;
    this.canvas = document.getElementById(this.id);
    this.crx;
    this.init = function () {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "solid";
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = "round";

        this.draw = function (x, y, type) {
            if (type === "mousedown") {
                this.ctx.beginPath();
                this.flag = true;
                return this.ctx.moveTo(x, y);
            } else if (type === "mousemove" && this.flag) {
                this.ctx.lineTo(x, y);
                return this.ctx.stroke();
            } else {
                this.flag = false;
                return this.ctx.closePath();
            }
        };
        this.getFlag = function () {
            return this.flag;
        };
        this.setPallet = function (x, y, id) {
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
        this.setPalletOff = function () {
            this.pallet = false;
        };
        this.setSizePensil = function (val){
            this.ctx.lineWidth = val;
        };
        this.setColor = function (obj) {
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
            }
            this.ctx.strokeStyle = this.color;
        };
    };
}