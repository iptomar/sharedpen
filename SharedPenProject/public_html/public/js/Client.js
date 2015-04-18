/**
 * @param {type} pai elemento principal
 * @param {type} user nome do utilizador
 * @param {type} port porta de ligacao do utilizador
 * @param {type} socketid id do socket de comunicacao
 * @returns {PopupMouse}
 */
function Client(pai, user, port, socketid) {
    this.pai = pai;
    this.user = user;
    this.port = port;
    this.color = port * 10;
    this.socketid = socketid;

    this.getUsername = function () {
        return this.user;
    };

    this.getSocketId = function () {
        return  this.socketid;
    };

    this.setSocketId = function (val) {
        this.socketid = val;
    };

    this.getdivid = function () {
        return this.socketid;
    };

    this.setName = function (nane) {
        this.pai.find(".name-user").html(nane);
        this.pai.find(".name-user").css({
            "color": "rgb(" + hexToRgb(this.color, this.socketid, this.user) + ")"
        });
    };

    this.setPosition = function (x, y) {
        this.pai.css({
            "top": y - 10,
            "left": x + 10
        });
    };
}