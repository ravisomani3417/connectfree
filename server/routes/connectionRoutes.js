const router = require('express').Router();
const c = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.list);
router.get('/pending', c.pending);
router.post('/request/:id', c.sendRequest);
router.put('/:id/accept', c.accept);
router.put('/:id/reject', c.reject);
router.delete('/user/:id', c.remove);

module.exports = router;
