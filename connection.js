const mongoose = require("mongoose");

function mongoConnect(url) {
  mongoose.connect(url).then(() => {
    console.log("connected");
  });
}

module.exports = { mongoConnect };
