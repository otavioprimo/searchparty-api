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
    req.checkBody("email", "Necessário com um email com formato válido").isEmail().trim().normalizeEmail();
    req.checkBody("nome", "Necessário um nome").exists();
    req.checkBody("senha", "Necessário ter no minímo 8 caracteres").isLength(8);
    var errors = req.validationErrors();
    if (errors) {
        res.send(errors);
        return;
    } else {
        var resp_senha = await verificarForcaSenha(req.body.senha);
        if (resp_senha == 'Weak')
            res.status(HttpStatus.OK).json({ error: true, mensagem: "Senha fraca, insira outra senha" });
        else {
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
    }
}

exports.login = async function (req, res) {
    req.checkBody("email", "Entre com um email válido").isEmail();
    var errors = req.validationErrors();
    if (errors) {
        res.send(errors);
    } else {
        let usuario = await Usuario.findOne({ email: req.body.email }).select('+senha');
        if (!usuario)
            res.status(400).json({ 'error': true, 'message': 'Usuário não cadastrado' });
        else {
            let resp = await compararSenhas(req.body.senha, usuario.senha);
            if (resp) {
                var token = jwt.sign({ id: usuario._id, email: usuario.email, admin: usuario.admin }, config.jwt_token, {
                    expiresIn: '2h'
                });
                res.json({ error: false, token: token });
            } else {
                res.json({ error: true, mensagem: "Email ou senha inválido" });
            }
        }
    }
}

async function compararSenhas(senha1, senha2) {
    var resp = await bcrypt.compare(senha1, senha2);
    return resp;
}

exports.alterarSenha = async function (req, res) {
    req.checkBody("senha", "Necessário ter no minímo 8 caracteres").isLength(8);
    var errors = req.validationErrors();
    if (errors) {
        res.send(errors);
        return;
    } else {
        var senha_forca = await verificarForcaSenha(req.body.senha);
        if (senha_forca == 'Weak')
            res.status(HttpStatus.OK).json({ error: true, mensagem: "Senha fraca, insira outra senha" });
        else {

            let usuario = await Usuario.findById(req.user.id).select('+senha');
            let resp = await compararSenhas(req.body.senha_atual, usuario.senha);
            if (resp) {
                let usuario = await Usuario.findByIdAndUpdate(req.user.id, {
                    $set: { senha: bcrypt.hashSync(req.body.senha, 10) }
                }, { safe: true, new: true });
                if (usuario)
                    res.status(HttpStatus.OK).json({ error: false, mensagem: 'Senha alterada com sucesso' });
                else
                    res.status(HttpStatus.OK).json({ error: true, mensagem: 'Falha ao alterar a senha' });
            } else {
                res.json({ error: true, mensagem: "A senha atual é inválida" });
            }
        }
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
    req.checkBody("id", "Necessário inserir um id para alterar").existis();
    req.checkBody("admin", "Necessário inserir 'true' ou 'false' do tipo Boolean").isBoolean(true);
    var errors = req.validationErrors();
    if (errors) {
        res.send(errors);
        return;
    } else {
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

async function verificarForcaSenha(senha) {
    var regex = new Array();
    regex.push("[A-Z]"); //Uppercase Alphabet.
    regex.push("[a-z]"); //Lowercase Alphabet.
    regex.push("[0-9]"); //Digit.
    regex.push("[$@$!%*#?&]"); //Special Character.

    var passed = 0;

    //Validate for each Regular Expression.
    for (var i = 0; i < regex.length; i++) {
        if (new RegExp(regex[i]).test(senha)) {
            passed++;
        }
    }

    var strength = "";
    switch (passed) {
        case 0:
        case 1:
            strength = "Weak";
            break;
        case 2:
            strength = "Good";
            break;
        case 3:
        case 4:
            strength = "Strong";
            break;
        case 5:
            strength = "Very Strong";
            break;
    }

    return strength;
}