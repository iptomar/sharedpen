/**
 * @param {type} pai elemento principal
 * @param {type} user nome do utilizador
 * @param {type} port porta de ligacao do utilizador
 * @param {type} socketid id do socket de comunicacao
 * @returns {PopupMouse}
 */
var Client = function (pai, user, port, socketid) {
    this.pai = pai;
    this.user = user;
    this.port = port;
    this.color = port * 10;
    this.socketid = socketid;
}

Client.prototype.getUsername = function () {
    return this.user;
};

Client.prototype.getSocketId = function () {
    return  this.socketid;
};

Client.prototype.setSocketId = function (val) {
    this.socketid = val;
};

Client.prototype.getdivid = function () {
    return this.socketid;
};

Client.prototype.setName = function (nane) {
    this.pai.find(".name-user").html(nane);
    this.pai.find(".name-user").css({
        "color": "rgb(" + hexToRgb(this.color, this.socketid, this.user) + ")"
    });
};