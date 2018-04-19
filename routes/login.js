

var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken')

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require("../models/usuario");

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

var mdAutenticacion = require('../middlewares/autenticacion');



// ===============================================
// RENOVAR TOKEN
//================================================ 
app.get('/renuevaToken',mdAutenticacion.verificaToken ,(req, res) => {
    var token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 15500 }) // 4 horas
    return res.status(200).json({
        ok: true,
        token: token
    });
})

//const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET
// ===============================================
// AUTENTICACION POR GOOGLE
//================================================ 

app.post('/google', (req, res) => {

    var token = req.body.token || 'xxx';
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    async function verify() {

        /* if (e) {

            return res.status(400).json({

                ok: true,
                mensaje: 'Token no valido',
                errors: e

            });

        }*/

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // If request specified a G Suite domain:
        //const domain = payload['hd'];

        Usuario.findOne({ email: payload.email }, (err, usuario) => {

            if (err) {

                return res.status(500).json({

                    ok: true,
                    mensaje: 'error al buscar usuario login',
                    errors: err

                });

            }

            if (usuario) {

                if (usuario.google === false) {

                    return res.status(500).json({

                        ok: true,
                        mensaje: 'Debe usar su autenticacion normal',

                    });

                } else {

                    usuario.password = ":)";

                    var token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 15500 }) // 4 horas

                    res.status(200).json({
                        ok: true,
                        usuario: usuario,
                        token: token,
                        id: usuario._id,
                        menu: obtenerMenu(usuario.role)
                    });

                }

                // si el usuario no existe por correo

            } else {

                var usuario = new Usuario();
                usuario.nombre = payload.name;
                usuario.email = payload.email;
                usuario.password = ':)';
                usuario.img = payload.picture;
                usuario.google = true;

                usuario.save((err, UsuarioDB) => {

                    if (err) {
                        return res.status(500).json({
                            ok: true,
                            mensaje: 'error al crear usuario - google',
                            errors: err,
                            UsuarioDB: UsuarioDB
                        })
                    }

                });

            }

            var token = jwt.sign({ usuario: Usuario }, SEED, { expiresIn: 15500 }) // 4 horas

            res.status(200).json({
                ok: true,
                usuario: usuario,
                token: token,
                id: usuario._id,
                menu: obtenerMenu(usuario.role)
            });

        });

    } //fin verify 

    verify().catch(error => {

        return res.status(400).json({

            ok: false,
            mensaje: 'Token no valido',
            errors: error

        })



    }); // fin catch



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
                mensaje: "Credenciales incorrectas ",
                errors: {mensaje: 'Credenciales incorrectas' }
              });
          }

          if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas ",
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
            id: usuarioDB.id ,
            menu: obtenerMenu(usuarioDB.role)
        });
    });

    
});

function obtenerMenu(ROLE) {
   var menu = [
        {
          titulo: 'Principal',
          icono: 'mdi mdi-gauge',
          submenu: [
            { titulo: 'Dashboard', url: '/dashboard'},
            { titulo: 'ProgressBar', url: '/progress'},
            { titulo: 'Gráficas', url: '/graficas1'},
            { titulo: 'Promesas', url: '/promesas'},
            { titulo: 'RXJS', url: '/Rxjs'}
          ]
        },
        {
          titulo: 'Mantenimientos',
          icono: 'mdi mdi-folder-lock-open',
          submenu: [
            // {titulo: 'Usuarios', url: '/usuarios'},
            {titulo: 'Hospitales', url: '/hospitales'},
            {titulo: 'Médicos', url: '/medicos'},
          ]
        }
          ];

    if(ROLE === 'ADMIN_ROLE'){
        menu[1].submenu.unshift({titulo: 'Usuarios', url: '/usuarios'});
    }


    return menu;
}
module.exports = app;