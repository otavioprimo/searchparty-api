const express = require('express'),
    app = express(),
    bcrypt = require('bcrypt'),
    HttpStatus = require('http-status-codes'),
    dateFormat = require('dateformat'),
    email = require('../../util/email'),
    token = require('../../util/token'),
    paginate = require('mongoose-pagination'),
    config = require('../../config'),
    jwt = require('jsonwebtoken'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

var Usuario = require('../../models/usuarioModel');

exports.cadastrar_usuario = async function (req, res) {
    try {
        let user = await Usuario.findOne({ email: req.body.email });
        if (!user) {
            var token_number;
            var date = new Date();
            var usuario = new Usuario();

            usuario.nome = req.body.nome;
            usuario.email = req.body.email;
            usuario.senha = bcrypt.hashSync(req.body.senha, 10);

            token.gerar_token(data => {
                token_number = data;
            });

            let doc = await usuario.save();
            let email_confirm = await email.send(req.body.email, email.modelo_confirmar_conta(req.body.nome, token_number), 'Confirmar Conta');
            let usuario_update = await Usuario.findByIdAndUpdate(doc._id, {
                $push: {
                    'token_email_confirmacao': {
                        token: token_number,
                        ativo: true
                    }
                }
            }, { safe: true, new: true });
            res.status(HttpStatus.OK).json({ error: false, mensagem: "Salvo com sucesso" });
        } else {
            res.status(HttpStatus.OK).json({ error: true, mensagem: "Este email já existe" });
        }
    } catch (err) {
        res.status(HttpStatus.CONFLICT).json({ error: trhe, mensagem: "Ocorreu um erro ao cadastrar o usuário" });
    }
}

exports.login = async function (req, res) {
    try {
        let usuario = await Usuario.findOne({ email: req.body.email }).select('+senha');
        if (!usuario)
            res.status(400).json({ 'error': true, 'message': 'Usuário não cadastrado' });
        else {
            let resp = await compararSenhas(req.body.senha, usuario.senha);
            var token = jwt.sign({ id: usuario._id, email: usuario.email, admin: usuario.admin }, config.jwt_token, {
                expiresIn: '2h'
            });
            res.json({ error: false, token: token });
        }

    } catch (err) {
        res.json({ error: true, mensagem: err })
    }
}

async function compararSenhas(senha1, senha2) {
    var resp = await bcrypt.compare(senha1, senha2);
    return resp;
}

exports.alterarSenha = async function (req, res) {
    try {
        let usuario = await User.findByIdAndUpdate(req.user._id, {
            $set: { senha: bcrypt.hashSync(req.body.senha, 10) }
        }, { safe: true, new: true });
        if (usuario)
            res.status(HttpStatus.OK).json({ error: false, mensagem: 'Senha alterada com sucesso' });
        else
            res.status(HttpStatus.OK).json({ error: true, mensagem: 'Falha ao alterar a senha' });
    } catch (err) {
        res.status(HttpStatus.OK).json({ error: true, mensagem: 'Falha ao alterar a senha' });
    }

}

exports.buscar_usuario_id = async function (req, res) {
    try {
        let usuario = await Usuario.findById(req.params.id)
            .select(['-token_email_confirmacao', '-token_rec_senha'])
            .exec();
        if (!usuario)
            res.status(HttpStatus.OK).json({ error: true, mensagem: 'Usuário não existe' });
        else
            res.status(HttpStatus.OK).json({ error: false, data: usuario });
    } catch (err) {
        res.status(HttpStatus.OK).json({ error: true, mensagem: err });
    }
}

exports.buscar_todos_usuarios = async function (req, res) {
    if (req.user.admin) {
        var usuario = await Usuario.find()
            .paginate(Number(req.query.page), Number(req.query.limit))
            .select(['-token_email_confirmacao', '-token_rec_senha'])
            .exec();
        res.status(HttpStatus.OK).json(usuario);
    }
    else
        res.status(HttpStatus.OK).json({ error: true, mensagem: "Não autorizado" });
}

exports.manipular_admin = async function (req, res) {
    if (req.user.admin) {
        let usuario = await Usuario.findByIdAndUpdate(req.body.id, {
            $set: {
                admin: req.body.admin
            }
        }, { safe: true, new: true });
        if (usuario)
            res.status(HttpStatus.OK).json({ error: false, mensagem: "Atualizado com sucesso" });
        else
            res.status(HttpStatus.OK).json({ error: true, mensagem: "Não foi possível atualizar este usuário" });
    } else {
        res.status(HttpStatus.OK).json({ error: true, mensagem: "Não autorizado" });
    }
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