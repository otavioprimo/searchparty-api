var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LocalSchema = new Schema({
    criador: {
        _id: { type: String, index: true },
        nome: String
    },
    titulo: {
        type: String,
        required: 'Necessário um titulo',
        trim: true,
    },
    descricao: {
        type: String,
        required: 'Necessário um titulo',
    },
    cidade: { type: String, index: true },
    estado: { type: String, index: true },
    status: { type: Boolean, default: true, index: true },
    created: { type: Date, default: getDateUtc() },
    created_utc: { type: String, default: formatarUtc() },
    expiracao: { type: Date, default: calcularExpiracao() },
    expiracao_utc: { type: String, default: formatarUtc() }
});

//Adiciona a expiração para 14 dias
function calcularExpiracao() {
    var data = new Date();
    data.setHours(data.getHours() - 2);//Subtrai as horas para ficar no formato UTC de brasilia
    data.setDate(data.getDate() + 14);
    return data;
}

function formatarUtcExpiracao() {
    var data = new Date();
    data.setHours(data.getHours() - 2);
    data.setDate(data.getDate() + 14);
    return dateformat(date, "dd/mm/yyyy HH:MM:ss");
}

function getDateUtc() {
    var data = new Date();
    data.setHours(data.getHours() - 2);
    return data;
}

function formatarUtc() {
    var data = new Date();
    return dateformat(date, "dd/mm/yyyy HH:MM:ss");
}

module.exports = mongoose.model('Local', LocaisSchema);
