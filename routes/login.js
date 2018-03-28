var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require("../models/usuario");

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


//const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET
// ===============================================
// AUTENTICACION POR GOOGLE
//================================================ 

app.post('/google', (req, res) => {
    var token = req.body.token || 'XXX';

    var client = new OAuth2Client(GOOGLE_CLIENT_ID);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        //const domain = payload['hd'];

        Usuario.findOne({email: payload.email}, (err, usuario) => {
            if(err){
                return res.status(500).json({
                    ok: true,
                    mensaje: 'Error al buscar usuario - login',
                    errors: err
                });
            }
            if(usuario){
                if(usuario.google === false ){
                    return res.status(400).json({
                        ok: true,
                        mensaje: 'Debe usar su autenticacion normal',
                        errors: err
                    });
                }else{
                    usuario.password = 'XD';
                    var token = jwt.sign({ usuario: usuario},SEED,{ expiresIn: 14400}); // 4horas

                    res.status(200).json({
                        ok: true,
                        Usuario: usuario,
                        token: token,
                        id: usuario.id 
                     });
                }
                // Si el usuario no existe por correo
            }else{
                var usuario = new Usuario();

                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = 'xD';
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save((err, usuarioDB) => {
                    if(err){
                        return res.status(500).json({
                            ok: true,
                            mensaje: 'Error al crear usuario - google ',
                            errors: err
                        });
                    }
                    var token = jwt.sign({ usuario: usuarioDB},SEED,{ expiresIn: 14400}); // 4horas

                    res.status(200).json({
                        ok: true,
                        Usuario: usuarioDB,
                        token: token,
                        id: usuarioDB.id 
                     });

                })
            }

        });
      }
      verify().catch(console.error);

    
});

// ===============================================
// AUTENTICACION NORMAL
//================================================ 
app.post('/', (req,res) => {

    var body = req.body;

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "error al buscar usuario",
              errors: err
            });
          }

          if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email",
                errors: {mensaje: 'Credenciales incorrectas' }
              });
          }

          if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password",
                errors: {mensaje: 'Credenciales incorrectas' }
              });
          }

          // Crear un token!!
          usuarioDB.password = 'XD';
          var token = jwt.sign({ usuario: usuarioDB},SEED,{ expiresIn: 14400}); // 4horas

          res.status(200).json({
            ok: true,
            Usuario: usuarioDB,
            token: token,
            id: usuarioDB.id 
        });
    });

    
});
module.exports = app;