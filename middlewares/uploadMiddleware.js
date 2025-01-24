import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

// Configuration de stockage avec multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filtre pour accepter uniquement les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Middleware pour réduire la taille de l'image à 100Kb
export const uploadAndResize = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    const imagePath = req.file.path;
    const outputImagePath = imagePath.replace(/(\.\w+)$/, '_compressed$1');

    try {
      await sharp(imagePath)
        .resize({ width: 500 }) // Redimensionner à une largeur de 500px (exemple)
        .jpeg({ quality: 80 })  // Compression JPEG avec qualité de 80%
        .toFile(outputImagePath);

      // Remplacer le fichier original par le fichier compressé
      fs.unlinkSync(imagePath);
      req.file.path = outputImagePath;
      req.file.filename = path.basename(outputImagePath);

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Erreur lors de la compression de l’image' });
    }
  });
};
