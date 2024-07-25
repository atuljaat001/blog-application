const { getUser } = require("./token/token");

async function checkLogin(req, res, next) {
  try {
    const token = req.cookies.uid;
    if (!token) {
      return res.redirect("/login");
    }
    const user = getUser(token);
    if (!user) {
      return res.redirect("/login");
    }
    next();
  } catch (err) {
    return res.send("you are not logged in");
  }
}

module.exports = { checkLogin };
