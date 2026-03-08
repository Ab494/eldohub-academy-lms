import express from 'express';
import * as discussionController from '../controllers/discussionController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', authenticate, discussionController.getPosts);
router.post('/', authenticate, discussionController.createPost);
router.get('/:postId/replies', authenticate, discussionController.getReplies);
router.post('/:postId/like', authenticate, discussionController.toggleLike);
router.delete('/:postId', authenticate, discussionController.deletePost);

export default router;
