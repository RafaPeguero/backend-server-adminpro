// Importar mongoose para usar sus funciones
var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
// Importar Schemas
var Schema = mongoose.Schema;




var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol permitido'
};

//Definir el squema de usuario

var usuarioSchema = new Schema({
    nombre: {type: String, required: [true,'El nombre es necesario'] },
    email: {type: String, unique: true ,required: [true,'El correo es necesario'] },
    password: {type: String, required: [true,'la contraseña es necesaria'] },
    img: {type: String, required: false },
    role: {type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: {type: Boolean, required: true, default: false}
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });

module.exports = mongoose.model('Usuario', usuarioSchema);