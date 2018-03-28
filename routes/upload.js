// Importar el express
var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require("fs");

var app = express();
// Middleware
app.use(fileUpload());

var Usuario = require("../models/usuario");
var Medico = require("../models/medico");
var Hospital = require("../models/hospital");

app.put("/:tipo/:id", (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //Tipos de coleccion validos
  var tiposValidos = ["hospitales", "medicos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de coleccion no es váalida",
      errors: { message: "Tipo de coleccion no es váalida" }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "no seleccionó archivo",
      errors: { message: "Debe de seleccionar una imagen" }
    });
  }

  // Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split(".");
  var extensionArhivo = nombreCortado[nombreCortado.length - 1];

  // solo estas extensiones aceptamos
  var extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  if (extensionesValidas.indexOf(extensionArhivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no válida",
      errors: {
        message: "Las extensiones validas son: " + extensionesValidas.join(", ")
      }
    });
  }

  // Nombre de archivo personalizado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArhivo}`;

  //mover el archivo de un temporal a una ruta en especifico (path)
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al mover archivo",
        errors: err
      });
    }
    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

  if (tipo === 'usuarios') {

    if(!usuario){
      return res.status(400).json({
        ok: false,
        mensaje: " Usuario no existe",
        errors: {message: 'Usuario no existe'}
      });
    }
    Usuario.findById(id, (err, usuario) => {
      var pathViejo = "./uploads/usuarios/" + usuario.img;
      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      usuario.img = nombreArchivo;
      usuarioActualizado.password = 'xD';

      usuario.save((err, usuarioActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: " imagen de usuario actualizada",
          usuario: usuarioActualizado
        });
      });
    });
  }

  if (tipo === 'medicos') {
    Medico.findById(id, (err, medico) => {
      if(!medico){
        return res.status(400).json({
          ok: false,
          mensaje: " Medico no existe",
          errors: {message: 'Medico no existe'}
        });
      }
        var pathViejo = "./uploads/medicos/" + medico.img;
        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlink(pathViejo);
        }
  
        medico.img = nombreArchivo;
  
        medico.save((err, medicoActualizado) => {
          return res.status(200).json({
            ok: true,
            mensaje: " imagen de medico actualizada",
            medico: medicoActualizado
          });
        });
      });
  }

  if (tipo === 'hospitales') {
    Hospital.findById(id, (err, hospital) => {
      if(!hospital){
        return res.status(400).json({
          ok: false,
          mensaje: " Hospital no existe",
          errors: {message: 'Hospital no existe'}
        });
      }
        var pathViejo = "./uploads/hospitales/" + hospital.img;
        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlink(pathViejo);
        }
  
        hospital.img = nombreArchivo;
  
        hospital.save((err, hospitalActualizado) => {
          return res.status(200).json({
            ok: true,
            mensaje: " imagen de hospital actualizada",
            usuario: hospitalActualizado
          });
        });
      });
  }
}

module.exports = app;
