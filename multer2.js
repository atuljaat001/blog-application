const multer = require("multer");

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/static/uploads2"); //in multer i have to give full address
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}--${file.originalname}`;
    cb(null, filename);
  },
});

const upload2 = multer({ storage: storage2 });

module.exports = upload2;
