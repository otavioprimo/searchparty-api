const express = require('express'),
    app = express(),
    bcrypt = require('bcrypt'),
    HttpStatus = require('http-status-codes'),
    dateFormat = require('dateformat'),
    email = require('../../util/email'),
    token = require('../../util/token'),
    paginate = require('mongoose-pagination'),
    config = require('../../config'),
    jwt = require('jsonwebtoken');

var Usuario = require('../../models/usuarioModel');

exports.cadastrar_usuario = function (req, res) {
    var verifyEmail = Boolean;

    Usuario.findOne({
        email: req.body.email
    }, (err, doc) => {
        if (err)
            res.status(HttpStatus.Ok);

        if (doc == null) {
            var token_number;
            var date = new Date();
            var date_formated = dateFormat(date, "dd/mm/yyyy HH:MM:ss");
            var usuario = new Usuario();

            usuario.nome = req.body.nome;
            usuario.email = req.body.email;
            usuario.senha = bcrypt.hashSync(req.body.senha, 10);
            usuario.created = date_formated;

            token.gerar_token(data => {
                token_number = data;
            });

            usuario.save((err, doc) => {
                if (err)
                    res.status(HttpStatus.BAD_REQUEST).json({ error: err });

                email.send(req.body.email, email.modelo_confirmar_conta(req.body.nome, token_number), 'Confirmar Conta', data => {
                    console.log("Email enviado para " + req.body.email);
                }, error => {
                    console.log("Falha email para " + req.body.email);
                });

                Usuario.findByIdAndUpdate(doc._id, {
                    $push: {
                        'token_email_confirmacao': {
                            descricao: token_number,
                            created: date_formated,
                            ativo: true
                        }
                    }
                }, {
                        safe: true,
                        new: true
                    }, (err, doc) => {
                        // console.log(doc);
                    });

                res.status(HttpStatus.OK).json({ error: false, mensagem: "Salvo com sucesso" });
            });
        } else {
            res.status(HttpStatus.OK).json({ error: true, mensagem: "Este email já existe" });
        }
    });
}

exports.login = function (req, res) {
    Usuario.findOne({
        email: req.body.email
    }, function (err, doc) {
        if (err) throw err;

        if (!doc)
            res.status(400).json({ 'error': true, 'message': 'Usuário não existe' });
        else if (doc) {
            bcrypt.compare(req.body.senha, doc.senha, function (err, result) {
                if (!result)
                    res.status(400).json({ 'error': true, 'message': 'Email ou Senha inválida' });
                else {
                    var token = jwt.sign({ id: doc._id, email: doc.email }, config.jwt_token, {
                        expiresIn: '2h'
                    });
                    res.json({ error: false, token: token });
                }
            });
        }
    }).select('+senha');
}

exports.alterarSenha = function (req, res) {
    User.findByIdAndUpdate(req.user._id, {
        $set: { senha: bcrypt.hashSync(req.body.senha, 10) }
    }, {
            safe: true,
            new: true,
        }, function (err, doc) {
            if (err)
                res.status(HttpStatus.BAD_REQUEST).send(err);

            res.status(HttpStatus.OK).json(doc);
        });
}

exports.buscar_usuario_id = function (req, res) {
    Usuario.findById(req.params.id)
        .select(['-token_email_confirmacao', '-token_rec_senha'])
        .exec((err, doc) => {
            if (err)
                res.status(HttpStatus.OK).json(err);
            if (!doc)
                res.status(HttpStatus.OK).json({ error: true, mensagem: 'Usuário não existe' });
            else
                res.status(HttpStatus.OK).json({ error: false, data: doc });

        });
}

exports.buscar_todos_usuarios = function (req, res) {
    Usuario.findById(req.user.id)
        .exec((err, doc) => {
            if (err)
                res.status(HttpStatus.BAD_REQUEST);

            if (doc.admin)
                Usuario.find()
                    .paginate(Number(req.query.page), Number(req.query.limit))
                    .select(['-token_email_confirmacao', '-token_rec_senha'])
                    .exec((err, doc) => {
                        if (err)
                            res.status(HttpStatus.BAD_REQUEST).json(err);
                        else
                            res.status(HttpStatus.OK).json(doc);
                    });
            else
                res.status(HttpStatus.OK).json({ error: true, mensagem: "Não autorizado" });
        });
}

exports.manipular_admin = function (req, res) {
    Usuario.findById(req.user.id)
        .exec((err, doc) => {
            if (err)
                res.status(400).json({error:true});

            if (doc.admin)
                Usuario.findByIdAndUpdate(req.body.id, {
                    $set: {
                        admin: req.body.isAdmin
                    }
                }, {
                        safe: true,
                        new: true
                    }, (err, doc) => {
                        res.status(HttpStatus.OK).json({ error: false, mensagem: "Atualizado com sucesso" });
                    });
            else
                res.status(HttpStatus.OK).json({ error: true, mensagem: "Não autorizado" });
        });
}

function getToken(callback) {
    let token_number;
    let sair = false;
    do {
        token.gerar_token((data) => {
            token_number = data;
            Usuario.findOne({
                'token_email_confirmacao.descricao': data
            }, (err, doc) => {
                let aux = doc.token_email_confirmacao;
                aux.forEach(element => {
                    if (data != element.descricao)
                        sair = true;
                });
            });
        });
    } while (sair == false);
}