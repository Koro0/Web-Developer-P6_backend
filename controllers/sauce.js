const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  console.log(req.body);
  const sauceObjet = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObjet,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(200).json({ message: 'Sauce enregistrée !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObjet = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObjet, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error: error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error: 'error delete' }));
};

////////////// Like / Unlike /////////////

exports.sauceLike = async (req, res, next) => {
  console.log(req.body);
  console.log(req.params.id);
  const sauceLiked = await Sauce.findOne({ _id: req.params.id });
  let usersLikedTab = sauceLiked.usersLiked;
  let usersDislikedTab = sauceLiked.usersDisliked;
  let usersExist = false;
  for (i = 0; i < usersLikedTab.length; i++) {
    if (usersLikedTab[i] == req.body.userId) {
      usersExist = true;
    }
  }
  for (j = 0; i < usersDislikedTab.length; i++) {
    if (usersDislikedTab[i] == req.body.userId) {
      usersExist = true;
    }
  }
  console.log(usersExist);
  // console.log(usersLikedTab);
  // console.log(usersDislikedTab);
  if (usersExist == false) {
    if (req.body.type == 'like') {
      Sauce.findOneAndUpdate(
        { _id: req.params.id },
        {
          likes: sauceLiked.likes + 1,
          usersLiked: sauceLiked.usersLiked.concat([req.body.userId]),
        }
      )
        .then(() => res.status(200).json({ message: 'liked' }))
        .catch((error) => res.status(400).json({ error }));
    } else if (req.body.type == 'dislike') {
      Sauce.findOneAndUpdate(
        { _id: req.params.id },
        {
          likes: sauceLiked.dislikes + 1,
          usersLiked: sauceLiked.usersLiked.concat([req.body.userId]),
        }
      )
        .then(() => res.status(200).json({ message: 'disliked' }))
        .catch((error) => res.status(400).json({ error }));
    }
  }
  console.log(sauceLiked);
};
