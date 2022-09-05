const Sauce = require('../models/Sauce');
const fs = require('fs');
/**
 * create a sauce with image
 * @param {objet} req infomation sauce and image
 * @param {String} res
 * @return message if is valid or not
 */
exports.createSauce = (req, res, next) => {
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
/**
 * modify the existent Sauce
 * @param {Objet} req get sauce only user id create andd sauce and images to update
 * @param {*} res update sauce
 * @return status and message or error
 */
exports.modifySauce = (req, res, next) => {
  const sauceObjet = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}:${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObjet, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
    .catch((error) => res.status(400).json({ error }));
};
/**
 * Get one Sauce
 * @param {object} req sauce.id
 * @param {object} res
 * @return Sauce to find with sauce.id
 */
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};
/**
 * get All Sauce
 * @param {object} res get all Sauces and their imgs
 * @return all Sauces in server
 */
exports.getAllSauce = (req, res, next) => {
  const img = './images';
  !fs.existsSync(img)
    ? fs.mkdir(img, { recursive: true }, (err) => {
        if (err) throw err;
      })
    : console.log('created');
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error: error }));
};
/**
 * delete sauce if it user create
 * @param {object} req sauce.id user.id
 * @param {object} res delete sauce
 * @return sauce is delete and their image
 */
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

/**
 * Like and Dislike a Sauce
 * @param {number, String} req req 1, -1 or 0 for like, dislike and cancel
 * @param {number, String} res add one like or dislike
 * @promise like or dislike if user never choice, or cancel like or dislike if user seleted
 */

exports.sauceLike = async (req, res, next) => {
  const sauceLiked = await Sauce.findOne({ _id: req.params.id });
  let usersLikedTab = sauceLiked.usersLiked;
  let usersDislikedTab = sauceLiked.usersDisliked;

  //passe en boucle le tableau likes
  const userIsInLiked = usersLikedTab.includes(req.body.userId);
  //passe en boucle le tableau dislikes
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
    } else if (req.body.like == -1) {
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
    } else if (req.body.like == -1) {
      Sauce.findOneAndUpdate(
        { _id: req.params.id },
        {
          dislikes: sauceLiked.dislikes - 1, // blocker a 0 like minimum
          usersDisliked: sauceLiked.usersDisliked.filter(
            (e) => e !== req.body.userId
          ),
        }
      )
        .then(() => res.status(200).json({ message: 'delete disliked' }))
        .catch((error) => res.status(400).json({ error }));
    }
  }
};
