import multer from 'multer';
import crypto from 'crypto';
import { BlobServiceClient } from '@azure/storage-blob';
import { Request, Response } from 'express';

// multer configuration:
// - memoryStorage() holds the file in RAM as a Buffer (no temp files on disk)
// - fileSize limits uploads to 5MB (5 * 1024 * 1024 bytes)
// - fileFilter rejects anything that isn't a JPEG, PNG, or WebP image
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Reject the file — multer will emit this as an error
      cb(new Error('Only jpg, png, and webp images are allowed'));
    }
  },
});

// POST /api/upload
// Handles the actual upload to Azure Blob Storage after multer has parsed the file.
// The file is stored under a random UUID so filenames never collide.
// Returns { url } — the public blob URL that can be stored in the database.
export const uploadPhoto = async (req: Request, res: Response) => {
  try {
    // multer puts the parsed file on req.file (single file upload)
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Connect to Azure Blob Storage using the connection string from environment variables.
    // The connection string is available in the Azure Portal under Storage Account > Access keys.
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );

    // Get the container client — the container should already exist with "Blob (anonymous read)" access
    const containerClient = blobServiceClient.getContainerClient(
      process.env.AZURE_STORAGE_CONTAINER_NAME!
    );

    // Determine the file extension from the MIME type.
    // image/jpeg -> jpg (the more common extension)
    // image/png  -> png
    // image/webp -> webp
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = mimeToExt[req.file.mimetype] || req.file.mimetype.split('/')[1];

    // Generate a unique blob name using a UUID so uploads never overwrite each other.
    // We use the 'posts/' prefix to keep blobs organized in a virtual folder.
    const blobName = `posts/${crypto.randomUUID()}.${ext}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the file buffer directly to Azure.
    // Setting blobContentType ensures browsers receive the correct Content-Type header
    // when loading the image from the CDN URL.
    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype },
    });

    // Return the public URL of the uploaded blob.
    // This URL is what gets stored in the database (e.g., post.photoUrl or user.avatarUrl).
    return res.status(200).json({ url: blockBlobClient.url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
};
