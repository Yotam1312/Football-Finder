import express from 'express';
import { requireLevel3 } from '../middleware/auth.middleware';
import { upload, uploadPhoto } from '../controllers/upload.controller';

const router = express.Router();

// POST / — upload a photo to Azure Blob Storage (requires full account, Level 3)
// We wrap multer's single-file parser in a custom callback instead of using it directly
// as middleware. This lets us intercept multer errors (file too large, wrong type) and
// return a clean 400 JSON response instead of Express's default HTML error page.
router.post(
  '/',
  requireLevel3,
  (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err) {
        // multer sets err.message for fileFilter rejections and size limit errors
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  uploadPhoto
);

export default router;
