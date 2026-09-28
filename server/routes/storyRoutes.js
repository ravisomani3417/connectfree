const router = require('express').Router();
const c = require('../controllers/storyController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/', c.getStories);
router.post('/', upload.single('media'), c.createStory);
router.put('/:id/view', c.viewStory);
router.delete('/:id', c.deleteStory);

module.exports = router;
