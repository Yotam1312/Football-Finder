import express from 'express';
import { requireAuth, requireLevel3 } from '../middleware/auth.middleware';
import * as postsController from '../controllers/posts.controller';

const router = express.Router();

// POST / — create a new post (requires full account, Level 3)
// Must be registered before /:postId/upvote so Express doesn't try to match '/' as a postId param
router.post('/', requireLevel3, postsController.createPost);

// POST /:postId/upvote — toggle upvote on a post (requires full account, Level 3)
// Only users with a full account can upvote — email-only users are blocked by requireLevel3
router.post('/:postId/upvote', requireLevel3, postsController.toggleUpvote);

// PUT /:postId — edit a post (requires any authenticated user, Level 2+)
// Only the post's author can edit; controller enforces ownership check
router.put('/:postId', requireAuth, postsController.editPost);

// DELETE /:postId — delete a post (requires any authenticated user, Level 2+)
// Only the post's author can delete; controller enforces ownership check
router.delete('/:postId', requireAuth, postsController.deletePost);

export default router;
