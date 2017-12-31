var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dateformat = require('dateformat');

var UsarioSchema = new Schema({
    nome: {
        type: String,
        required: 'Necessário inserir um nome',
        trim: true
    },
    email: {
        type: String,
        unique: true,
        index: true,
        required: 'Necessário inserir um email',
        trim: true
    },
    senha: {
        type: String,
        required: 'Necessário inserir uma senha',
        trim: true,
        select: false
    },
    telefone: String,
    cidade: String,
    estado: String,
    coordenadas: {
        lat: Number,
        lng: Number
    },
    facebook_id: String,
    email_confirmado: { type: Boolean, default: false },
    image_perfil: String,
    status: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
    token_email_confirmacao: [
        {
            token: { type: String },
            created: { type: Date, default: Date.now },
            ativo: Boolean,
            select: false
        }
    ],
    token_rec_senha: [
        {
            token: { type: String },
            created: { type: Date, default: Date.now },
            expiracao: { type: Date, default: calcularExpiracaoTokenSenha() },
            ativo: Boolean,
            select: false
        }
    ],
    created: { type: Date, default: getDateUtc() },
    created_utc: { type: String, default: formatarUtc() }
});

function formatarUtc() {
    var data = new Date();
    return dateformat(data, "dd/mm/yyyy HH:MM:ss");
}

function getDateUtc() {
    var data = new Date();
    data.setHours(data.getHours() - 2); //Subtrai as horas para ficar no formato UTC de brasilia
    return data;
}

//Seta a expiração para daqui a 24 horas;
function calcularExpiracaoTokenSenha() {
    var data = new Date();
    data.setHours(data.getHours() - 2); //Subtrai as horas para ficar no formato UTC de brasilia
    data.setDate(data.getDate() + 2);
    return data;
}

module.exports = mongoose.model('Usuario', UsarioSchema);