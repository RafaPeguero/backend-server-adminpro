var mongoose = require('mongoose');
// Importar Schemas
var Schema = mongoose.Schema;

//Definir el squema de Hospitales

var hospitalSchema = new Schema({
    nombre: {type: String, required: [true,'El nombre es necesario'] },
    img: {type: String, required: false },
    usuario: {type:Schema.Types.ObjectId,ref:'Usuario' }
},{collection:'hospitales'});

module.exports = mongoose.model('Hospital', hospitalSchema);