const router = require('express').Router();
const c = require('../controllers/reelController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', c.getReels);
router.post('/', upload.single('video'), c.createReel);
router.put('/:id/like', c.toggleLike);
router.put('/:id/view', c.addView);
router.delete('/:id', c.deleteReel);

module.exports = router;
