exports.gerar_token = function (callBack) {
    var basic = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    var token_gerado = "";
    for (var i = 0; i < 55; i++) {
        token_gerado += basic.charAt(Math.floor(Math.random() * basic.length));
    }

    callBack(token_gerado);
}