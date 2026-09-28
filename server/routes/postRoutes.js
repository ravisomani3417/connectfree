const router = require('express').Router();
const c = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/feed', c.getFeed);
router.get('/user/:id', c.getUserPosts);
router.post('/', upload.single('media'), c.createPost);
router.put('/:id', c.updatePost);
router.delete('/:id', c.deletePost);
router.put('/:id/like', c.toggleLike);
router.get('/:id/comments', c.getComments);
router.post('/:id/comments', c.addComment);

module.exports = router;
