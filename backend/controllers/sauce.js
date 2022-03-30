const Sauce = require("../models/sauce");
const fs = require('fs');

// création d'une sauce 
exports.createSauce = (req, res, next) =>{
//Mise au format Json
  const sauceFormat = JSON.parse(req.body.sauce);
// Supression de l'ID du corp de la requete 
  delete sauceFormat._id;
  const sauce = new Sauce({
    ...sauceFormat,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
// initialisation des likes
    likes: 0,
// initialisation des dislikes
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
// Sauvegarde de "sauce" dans la base de donnée
  sauce.save()
// Renvoi un code de création
    .then(() => res.status(201).json({message : "sauce enregistré" }))
// Récuperation de l'erreur
    .catch(error => res.status(400).json({error}));
};

// affichage de toutes les sauces
exports.getAllSauce = (req, res, next) =>{
  Sauce.find()
// Renvoi des "sauces" depuis la base de donnée
  .then((sauce) => res.status(200).json(sauce))
  .catch(error => res.status(400).json({error}));
};

// affichage d'une sauce 
exports.getOneSauce = (req, res, next) =>{
// Récuperation d'une sauce par son ID
  Sauce.findOne({_id: req.params.id})
// Renvoi de la sauce depuis la base de donnée
    .then((sauce) => res.status(200).json(sauce))
    .catch(error => res.status(400).json({error}));

};


// Supression d'une sauce par le créateur de celle-ci
exports.deleteSauce = (req, res, next) =>{
// Récuperation d'une sauce par son ID
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
// Récuperation du nom du fichier dans /images/
    const filename = sauce.imageUrl.split('/images/')[1];
// Fonction supression 
    fs.unlink(`images/${filename}`, () => {
// Une fois l'image supprimé on supprime l'objet dans la base de donnée
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé'}))
        .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(400).json({ error }));
};

// modification d'une sauce par le créateur de celle-ci
exports.modifySauce = (req, res, next) => {
// SI nouvelle image dans la modification
  if (req.file) {
      Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  const sauceObject = {
                      ...JSON.parse(req.body.sauce),
                      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                  }
                  Sauce.updateOne({ _id: req.params.id },{...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce mise à jour' }))
                    .catch(error => res.status(400).json({ error }));
              })
          })
          .catch(error => res.status(500).json({ error }));
// Modification sans modification de l'image
  } else {
      const sauceObject = {...req.body };
      Sauce.updateOne(
        { _id: req.params.id },
        {...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce mise à jour' }))
        .catch(error => res.status(400).json({ error }));
  }
};

// Like et dislike d'une sauce
exports.likeSauce = (req, res, next) => {
  etatLike = req.body.like;
// Si Liké
  if(etatLike === 1){
      Sauce.updateOne(
        { _id: req.params.id },
// $Inc incrémente likes de 1
        { $inc: { likes: 1 },
// $Push ajout userId au tableau usersLiked
        $push: { usersLiked: req.body.userId }})
        .then( () => res.status(201).json({ message: 'Like +1' }))
        .catch(error => res.status(400).json({ error }));   
//Sinon Si disliké 
  }else if(etatLike === -1){
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId }})
        .then( () => res.status(201).json({ message: 'Dislike +1' }))
        .catch(error => res.status(400).json({ error }));
// Sinon etatlike != (1 , -1) donc 0
  }else{
      Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
// Si userID est dans le usersLiked
              if (sauce.usersLiked.includes(req.body.userId)) {
                  Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { likes: -1 },
// $Pull supprime l'userId du tableau usersLiked
                    $pull: { usersLiked: req.body.userId } })
                    .then(() => { res.status(201).json({ message: 'Like supprimé' }) })
                    .catch(error => res.status(400).json({ error }))
// Sinon Si userID est dans le usersDisliked
              } else if (sauce.usersDisliked.includes(req.body.userId)) {
                  Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { dislikes: -1 },
                    $pull: { usersDisliked: req.body.userId } })
                    .then(() => { res.status(201).json({ message: 'Dislike supprimé' }) })
                    .catch(error => res.status(400).json({ error }))
              }
          })
          .catch(error => res.status(400).json({ error }))
  }

}