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
  const sauceLiked = await Sauce.findOne({ _id: req.params.id });
  let usersLikedTab = sauceLiked.usersLiked;
  let usersDislikedTab = sauceLiked.usersDisliked;

  // passe en boucle le tableau likes
  const userIsInLiked = usersLikedTab.includes(req.body.userId);
  //  passe en boucle le tableau dislikes
  const userIsInDiskiked = usersDislikedTab.includes(req.body.userId);
  if (userIsInLiked == false && userIsInDiskiked == false) {
    if (req.body.like == 1) {
      Sauce.findOneAndUpdate(
        { _id: req.params.id },
        {
          likes: sauceLiked.likes + 1,
          usersLiked: sauceLiked.usersLiked.concat([req.body.userId]),
        }
      )
        .then(() => res.status(200).json({ message: 'liked' }))
        .catch((error) => res.status(400).json({ error }));
    } else if (req.body.type == 'dislike' && req.body.like == '-1') {
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
  } else {
    if (req.body.like == 0) {
      usersExist = false;
      Sauce.findOneAndUpdate(
        { _id: req.params.id },
        {
          likes: sauceLiked.likes - 1,
          usersLiked: sauceLiked.usersLiked.filter(
            (e) => e !== req.body.userId
          ),
        }
      )
        .then(() => res.status(200).json({ message: 'delete liked' }))
        .catch((error) => res.status(400).json({ error }));
    } else if (req.body.like == 0) {
      usersExist = false;

      Sauce.findOneAndUpdate(
        { _id: req.params.id },
        {
          likes: sauceLiked.likes - 1, // blocker a 0 like minimum
          usersLiked: sauceLiked.usersDisliked.filter(
            (e) => e !== req.body.userId
          ),
        }
      )
        .then(() => res.status(200).json({ message: 'delete disliked' }))
        .catch((error) => res.status(400).json({ error }));
    }
  }
};
