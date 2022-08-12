const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config'); //add img
const saucesCtrl = require('../controllers/sauce');

router.post('/', auth, multer, saucesCtrl.createSauce);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.get('/' + '', auth, saucesCtrl.getAllSauce);

router.post('/:id/like', auth, saucesCtrl.sauceLike);

module.exports = router;
