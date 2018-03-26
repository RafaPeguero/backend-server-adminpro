// Archivo de Ruta principal

// Importar el express
var express = require('express');

var app =  express();

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada exitosamente'
    });

});

module.exports = app;