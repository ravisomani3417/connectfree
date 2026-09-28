const router = require('express').Router();
const c = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/conversations', c.conversations);
router.get('/:userId', c.getMessages);
router.post('/:userId', c.send);
router.put('/:userId/read', c.read);

module.exports = router;
