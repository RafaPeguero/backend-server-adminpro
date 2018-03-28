var mongoose = require('mongoose');
// Importar Schemas
var Schema = mongoose.Schema;

//Definir el squema de los medicos
var medicoSchema = new Schema({
    nombre: {type: String, required: [true,'El nombre es necesario'] },
    img: {type: String, required: false },
    usuario: {type:Schema.Types.ObjectId,ref:'Usuario',required: true },
    hospital: {type:Schema.Types.ObjectId,ref:'Hospital',required: [true, 'El id hospital es un campo obligatorio'] }
});

module.exports = mongoose.model('Medico', medicoSchema);