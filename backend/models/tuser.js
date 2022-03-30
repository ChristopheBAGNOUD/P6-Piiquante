const mongoose = require('mongoose');

// importation du package qui permet de verifier que l'adresse mail de l'utilisateur est unqiue
const uniqueValidator = require('mongoose-unique-validator');


// fonction "schema" de mongoose
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true }    
});

userSchema.plugin(uniqueValidator);
// export du model vers les autres dossiers
module.exports = mongoose.model('tuser', userSchema);