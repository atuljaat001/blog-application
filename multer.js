const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/static/uploads"); //in multer i have to give full address
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}--${file.originalname}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
