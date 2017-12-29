var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
    cidade_atual: String,
    ultima_cidade: String,
    lat: Number,
    long: Number,
    facebook_id: String,
    email_confirmado: { type: Boolean, default: false },
    image_perfil: String,
    status: { type: Boolean, default: true },
    admin: { type: Boolean, default: false },
    token_email_confirmacao: [
        {
            descricao: { type: String, index: true },
            created: String,
            ativo: Boolean,
            select: false
        }
    ],
    token_rec_senha: [
        {
            descricao: { type: String, index: true },
            created: String,
            expiracao: String,
            ativo: Boolean,
            select: false
        }
    ],
    created: String
},
    {
        versionKey: false
    });

module.exports = mongoose.model('Usuario', UsarioSchema);