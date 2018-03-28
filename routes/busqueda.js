

// Importar el express
var express = require('express');

var app =  express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario  = require('../models/usuario');

// ===============================================
// Busqueda por coleccion
//================================================ 
app.get('/coleccion/:tabla/:busqueda', (req,res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    // Expresion regular
    var regex = new RegExp( busqueda, 'i');
    

    if(tabla === 'usuario'){
        buscarUsuarios(busqueda, regex).then( usuarios => {
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
    }
    if(tabla === 'medico'){
        buscarMedicos(busqueda,regex).then( medicos => {
            res.status(200).json({
                ok: true,
                medicos: medicos
            });
        });
    }
    if(tabla === 'hospital'){
        buscarHospitales(busqueda,regex).then( hospitales => {
            res.status(200).json({
                ok: true,
                hospitales: hospitales
            });
        });
    } else{
        res.status(400).json({
            ok: false,
            mensaje: 'Los tipos de busqueda sólo son: usuario,medico y hospital',
            error: {message: 'Los tipos de busqueda sólo son: usuario, medico y hospital'}
        });
    }
});



// ===============================================
// Busqueda general
//================================================ 

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    // Expresion regular
    var regex = new RegExp( busqueda, 'i');

    Promise.all( [  buscarHospitales(busqueda, regex),
                    buscarMedicos(busqueda, regex),
                    buscarUsuarios(busqueda, regex)
        ] ).then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
   
});

function buscarHospitales(busqueda, regex){

    return new Promise( (resolve, reject) => {
        Hospital.find({nombre: regex}).populate('usuario', 'nombre email').exec((err,hospitales) => {
            if(err){
                reject('error al cargar hospitales', err);
            } else{
                resolve(hospitales);
            }
        });
    });

};

function buscarMedicos(busqueda, regex){

    return new Promise( (resolve, reject) => {
        Medico.find({nombre: regex}).populate('usuario', 'nombre email').populate('hospital').exec((err,medicos) => {
            if(err){
                reject('error al cargar medicos', err);
            } else{
                resolve(medicos);
            }
        });
    });

};

function buscarUsuarios(busqueda, regex){

    return new Promise( (resolve, reject) => {
        Usuario.find({}, 'nombre email role').or([ { 'nombre': regex}, { 'email': regex} ]).exec((err, usuarios) => {
            if(err){
                reject('Error al cargar usuarios', err)
            }
            else{
                resolve(usuarios);
            }
        })

});
}

module.exports = app;