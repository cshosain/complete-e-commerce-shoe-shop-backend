import multer from "multer";
// Initialize multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Append timestamp to avoid name conflicts
  },
});

const upload = multer({ storage });
export default upload;
