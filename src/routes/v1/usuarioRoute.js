const express = require('express'),
    router = express.Router();

var tokenController = require("../../controllers/tokenController"),
    usuarioController = require("../../controllers/v1/usuarioController");

router.route('/')
    .get(tokenController.tokenRequired,usuarioController.buscar_todos_usuarios)
    .post(usuarioController.cadastrar_usuario);

router.route('/login')
    .post(usuarioController.login);

router.route('/:id')
    .get(tokenController.tokenRequired,usuarioController.buscar_usuario_id);

router.route('/admin')
    .post(tokenController.tokenRequired,usuarioController.manipular_admin);

router.route('/alterarsenha')
    .put(tokenController.tokenRequired,usuarioController.alterarSenha);

module.exports = router;