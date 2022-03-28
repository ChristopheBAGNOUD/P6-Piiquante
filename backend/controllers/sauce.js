const Sauce = require("../models/sauce");
const fs = require('fs');

// création d'une sauce 
exports.createSauce = (req, res, next) =>{
  //Mise au format Json
  const sauceFormat = JSON.parse(req.body.sauce);
  delete sauceFormat._id;
  const sauce = new Sauce({
  ...sauceFormat,
  imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  likes: 0,
  dislikes: 0,
  usersLiked: [],
  usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({message : "sauce enregistré" }))
    .catch(error => res.status(400).json({error}));
};

// affichage de toutes les sauces
exports.getAllSauce = (req, res, next) =>{
  Sauce.find()
  .then((sauce) => res.status(200).json(sauce))
  .catch(error => res.status(400).json({error}));
};

// affichage d'une sauce 
exports.getOneSauce = (req, res, next) =>{
  Sauce.findOne({_id: req.params.id}).then((sauce) => res.status(200).json(sauce))
  .catch(error => res.status(400).json({error}));

};


// supression d'une sauce par le créateur de celle-ci
exports.deleteSauce = (req, res, next) =>{
// Récuperation d'une sauce
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé'}))
        .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(400).json({ error }));
};

// modification d'une sauce par le créateur de celle-ci
exports.modifySauce = (req, res, next) => {
  if (req.file) {
      Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  const sauceObject = {
                      ...JSON.parse(req.body.sauce),
                      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                  }
                  Sauce.updateOne(
                    { _id: req.params.id },
                    {...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce mise à jour' }))
                    .catch(error => res.status(400).json({ error }));
              })
          })
          .catch(error => res.status(500).json({ error }));
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
  if(etatLike === 1){
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { likes: 1 },
        $push: { usersLiked: req.body.userId }})
        .then( () => res.status(200).json({ message: 'Like +1' }))
        .catch(error => res.status(400).json({ error }));    
  }else if(etatLike === -1){
      Sauce.updateOne(
        { _id: req.params.id },
        { $inc: { dislikes: 1 },
        $push: { usersDisliked: req.body.userId }})
        .then( () => res.status(200).json({ message: 'Dislike +1' }))
        .catch(error => res.status(400).json({ error }));
  }else{
      Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
              if (sauce.usersLiked.includes(req.body.userId)) {
                  Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { likes: -1 },
                    $pull: { usersLiked: req.body.userId } })
                    .then(() => { res.status(200).json({ message: 'Like supprimé' }) })
                    .catch(error => res.status(400).json({ error }))
              } else if (sauce.usersDisliked.includes(req.body.userId)) {
                  Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { dislikes: -1 },
                    $pull: { usersDisliked: req.body.userId } })
                    .then(() => { res.status(200).json({ message: 'Dislike supprimé' }) })
                    .catch(error => res.status(400).json({ error }))
              }
          })
          .catch(error => res.status(400).json({ error }))
  }

}