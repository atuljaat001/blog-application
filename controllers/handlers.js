const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpModel = require("../models/otp");
const crypto = require("crypto");
const { createToken, getUser } = require("../token/token");
function handleRenderLogin(req, res) {
  res.render("login");
}

async function handleSignup(req, res) {
  try {
    const { fullName, email, password, profileImage } = req.body;
    const createUser = await userModel.create({
      fullName: fullName,
      email: email,
      password: password,
      // profileImageUrl: profileImage,
    });

    res.redirect("/login");
  } catch (err) {
    console.log("error in handleSignup ", err);
    return null;
  }
}

function handleRenderHome(req, res) {
  res.render("home");
}

async function handleLogin(req, res) {
  try {
    console.log("handle login function starts");
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      console.log("on the based on email user is found");
      return null;
    }
    console.log(user);
    const hashPassword = await bcrypt.compare(password, user.password);
    console.log(hashPassword);
    if (!hashPassword) {
      console.log("user not find");
      return null;
    }
    // created a token and send it into a cookie named uid

    const token = createToken(user);
    console.log("token is", token);
    res.cookie("uid", token);
    res.redirect("/home");
  } catch (err) {
    console.log("error in handleLogin function ", err);
    return null;
  }
}

function handleforget(req, res) {
  res.render("forgetPassword");
}
async function handleForgetPassword(req, res) {
  const { email } = req.body;
  const checkEmail = await userModel.findOne({ email: email });
  if (!checkEmail) {
    return res.send("Email is not found");
  }
  const otp = crypto.randomInt(10000, 100000).toString();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "jaatatul877@gmail.com",
      pass: "jbzi bdgz dohn ivha",
    },
  });

  const mailOptions = {
    from: "jaatatul877@gmail.com",
    to: email,
    subject: "otp verification",
    text: otp,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) throw err;
    console.log("message sent successful");
  });

  // added otp and email to collection
  const otpDB = await otpModel.create({ email: email, otp: otp });
  if (!otpDB) {
    console.log("otp and email is not saved to db");
    return null;
  }
  res.render("otpVerfication");
}

async function handleVerificationOfOtp(req, res) {
  console.log("handleVerficationOfOtp function starts");
  const { otp } = req.body;
  const findDocument = await otpModel.findOne({ otp: otp });
  if (!findDocument) {
    console.log("otp not found");
    return res.send("otp not found");
  }

  res.render("newPassword", { email: findDocument.email });
}

async function handlePasswordChange(req, res) {
  const { password, email } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  const user = await userModel.findOneAndUpdate(
    { email: email },
    { $set: { password: hashPassword } }
  );
  if (!user) {
    return res.send("password change unsuccessful");
  }
  res.redirect("/login");
}

module.exports = {
  handleRenderLogin,
  handleSignup,
  handleLogin,
  handleRenderHome,
  handleforget,
  handleForgetPassword,
  handleVerificationOfOtp,
  handlePasswordChange,
};
