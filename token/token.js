const jwt = require("jsonwebtoken");
const secret = "bichhu bhai jaat";
function createToken(user) {
  const payload = {
    email: user.email,
    fullName: user.fullName,
    profileImageUrl: user.profileImageUrl,
    _id: user._id,
    role: user.role,
  };
  return jwt.sign(payload, secret);
}

function getUser(token) {
  return jwt.verify(token, secret);
}

module.exports = { createToken, getUser };
