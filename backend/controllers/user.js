const tuser = require('../models/tuser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// création d'un utilisateur sur le site
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new tuser({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({message: 'Utilisateur créé'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};

// connexion d'un utilisateur sur le site 
exports.login = (req, res, next) => {
    tuser.findOne({ email: req.body.email})
    .then(user => {
        console.log(user);
        if (!user){
            return res.status(401).json({ error : 'utilisateur non valide'});
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid =>{
            if(!valid){
                return res.status(401).json({ error : 'mot de pass non valide'});  
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  { userId: user._id },
                  'RANDOM_TOKEN_SECRET',
                  { expiresIn: '24h' }
                )
            });
        })
        .catch(error => res.status(500).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};
