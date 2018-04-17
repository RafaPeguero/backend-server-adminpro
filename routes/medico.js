// Importar librerias
var express = require("express");

var mAutenticacion = require('../middlewares/autenticacion');
var app = express();

var Medico = require('../models/medico');

// var Usuario = require("../models/usuario");

var SEED = require('../config/config').SEED;

// ===============================================
// OBTENER DATOS DE MEDICOS
//================================================ 

app.get('/', (req, res, next) => {

  var desde = req.query.desde  || 0;
  desde = Number(desde);
    Medico.find({}).populate('usuario','nombre email').skip(desde).limit(5).populate('hospital').exec((err, medico) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error cargando medicos",
          errors: err
        });
      }
      Medico.count({}, (err, conteo) => {
        res.status(200).json({
          ok: true,
          medicos: medico,
          total: conteo
        });
      })
    });
  });
  // ===============================================
  // OBTENER UN SOLO MEDICO
  //================================================
  app.get('/:id', (req, res) => {

    var id = req.params.id;
    Medico.findById(id)
    .populate('usuario', 'nombre email img')
    .populate('hospital')
    .exec( (err, medico) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar el medico",
          errors: err
        });
      }
      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: "El medico con el id: " + id + ", no existe",
          errors: { message: "No existe un medico con ese ID" }
        });
      }
      res.status(200).json({
        ok: true,
        medico: medico
      });
    }) 

  });
  

  // ===============================================
  // ACTUALIZAR DATOS DE MEDICOS
  //================================================
  app.put('/:id',mAutenticacion.verificaToken,(req, res) => {
    var body = req.body;
    var id = req.params.id;
  
    Medico.findById(id, (err, medico) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Error al buscar el medico",
          errors: err
        });
      }
      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: "El medico con el id: " + id + ", no existe",
          errors: { message: "No existe un medico con ese ID" }
        });
      }
  
      medico.nombre = body.nombre;
      medico.Usuario = req.usuario._id;
      medico.hospital = body.hospital
  
      medico.save((err, medicoGuardado) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar medico",
            errors: err
          });
        }
        res.status(200).json({
          ok: true,
          medico: medicoGuardado
        });
      });
    });
  });

    // ===============================================
  // INSERTAR DATOS DE MEDICOS
  //================================================
  app.post('/',mAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var id = req.params.id;
  
    var medico = new Medico({
      nombre: body.nombre,
      usuario: req.usuario._id,
      hospital: body.hospital
    });
  
    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error al crear medico",
          errors: err
        });
      }
      res.status(201).json({
        ok: true,
        medico: medicoGuardado,
      });
    });
  });

  // ===============================================
  // BORRAR MEDICOS
  //================================================ 
  app.delete('/:id', mAutenticacion.verificaToken,(req,res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "error al borrar usuario",
              errors: err
            });
          }

          if (!medicoBorrado) {
            return res.status(400).json({
              ok: false,
              mensaje: 'No existe un medico con ese id',
              errors: {message: 'No existe un medico con ese id' }
            });
          }
          res.status(200).json({
            ok: true,
            usuario: medicoBorrado
          });
    });
    
});
  

  module.exports = app;
