// Importar librerias
var express = require("express");

var mAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Hospital = require('../models/hospital');

// var Usuario = require("../models/usuario");

var SEED = require('../config/config').SEED;

// ===============================================
// OBTENER DATOS DE HOSPITALES
//================================================ 

app.get('/', (req, res, next) => {

  var desde = req.query.desde  || 0;
  desde = Number(desde);


    Hospital.find({}).skip(desde).limit(5).populate('usuario', 'nombre email').exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error cargando hospitales",
          errors: err
        });
      }

      Hospital.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total:conteo
        });
      });
      
    });
  });

  // ===============================================
  // ACTUALIZAR DATOS DE HOSPITALES
  //================================================
  app.put('/:id',mAutenticacion.verificaToken,(req, res) => {
    var body = req.body;
    var id = req.params.id;
  
    Hospital.findById(id, (err, hospital) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar el hospital",
          errors: err
        });
      }
      if (!hospital) {
        return res.status(400).json({
          ok: false,
          mensaje: "El hospital con el id: " + id + ", no existe",
          errors: { message: "No existe un hospital con ese ID" }
        });
      }
  
      hospital.nombre = body.nombre;
      hospital.Usuario = req.usuario._id;
  
      hospital.save((err, hospitalGuardado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar hospital",
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          hospital: hospitalGuardado
        });
      });
    });
  });

    // ===============================================
  // INSERTAR DATOS DE HOSPITALES
  //================================================
  app.post('/',mAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
  
    var hospital = new Hospital({
      nombre: body.nombre,
      usuario: req.usuario._id
    });
  
    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error al crear hospital",
          errors: err
        });
      }
      res.status(201).json({
        ok: true,
        hospital: hospitalGuardado,
      });
    });
  });

  // ===============================================
  // BORRAR HOSPITALES
  //================================================ 
  app.delete('/:id', mAutenticacion.verificaToken,(req,res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "error al borrar usuario",
              errors: err
            });
          }

          if (!hospitalBorrado) {
            return res.status(400).json({
              ok: false,
              mensaje: 'No existe un hospital con ese id',
              errors: {message: 'No existe un hospital con ese id' }
            });
          }
          res.status(200).json({
            ok: true,
            usuario: hospitalBorrado
          });
    });
    
});
  

  module.exports = app;