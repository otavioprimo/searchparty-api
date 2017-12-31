const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    morgan = require('morgan'),
    jwt = require('jsonwebtoken'),
    config = require('./src/config'),
    mongoose = require('mongoose'),
    mkdirp = require('mkdirp'),
    HttpStatus = require('http-status-codes'),
    port = process.env.PORT || 5000;

var usuario = require('./src/routes/v1/usuarioRoute'),
    testes = require('./src/routes/v1/testesRoute');

mongoose.connect(config.mongo_uri, {
    useMongoClient: true
});

//Habilitar o cors
app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

//Cria os diretórios de media
mkdirp('public/fotos/perfil');
mkdirp('public/fotos/apresentacao');
mkdirp('public/videos');

app.use(express.static(__dirname + '/public'));

//Faz a autenticação do token
app.use(function (req, res, next) {
    var token = req.headers['authorization'];

    if (token) {
        jwt.verify(token, config.jwt_token, function (err, decoded) {
            if (err) {
                return res.status(HttpStatus.UNAUTHORIZED);
            } else {
                req.user = decoded;
                next();
            }
        });
    } else {
        req.user = undefined;
        next();
    }
});

//Configurações
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

//Rotas
// app.use('/', "Hello World");
app.use('/api/usuario', usuario);
app.use('/api/testes', testes);

//Inicializa o servidor na porta
app.listen(port);

//AQUI È UM COMENTÁRIO PORRA
