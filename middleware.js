const { getUser } = require("./token/token");

async function checkLogin(req, res, next) {
  try {
    const token = req.cookies.uid;
    if (!token) {
      return res.redirect("/login");
    }
    const user = getUser(token);
    // console.log(user);
    if (!user) {
      return res.redirect("/login");
    }
    req.user = user;
    next();
  } catch (err) {
    return res.send("you are not logged in");
  }
}

// authorization middleware

function authorization(roles) {
  return function (req, res, next) {
    console.log("authorization function starts");

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.send("You are not authorized");
    }
  };
}

module.exports = { checkLogin, authorization };
