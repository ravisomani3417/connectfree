const router = require('express').Router();
const c = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/suggestions', c.suggestions);
router.put('/me', upload.single('avatar'), c.updateMe);
router.get('/:id', c.getUser);
router.put('/:id/follow', c.toggleFollow);

module.exports = router;
