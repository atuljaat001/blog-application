const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpModel = require("../models/otp");
const crypto = require("crypto");
const multer = require("multer");
const blogModel = require("../models/blog");
const commentModel = require("../models/comment");

const { createToken, getUser } = require("../token/token");
function handleRenderLogin(req, res) {
  res.render("login");
}

async function handleSignup(req, res) {
  try {
    const { fullName, email, password } = req.body; //cant find image from req.body it is in req.file
    // const profileImageUrl = req.file
    //   ? `/static/uploads${req.file.filename}`
    //   : "static/uploads/images.png";
    // console.log(profileImageUrl);
    const createUser = await userModel.create({
      fullName: fullName,
      email: email,
      password: password,
      profileImageUrl: `static/uploads/${req.file.filename}`,
    });

    res.redirect("/login");
  } catch (err) {
    console.log("error in handleSignup ", err);
    return null;
  }
}

async function handleRenderHome(req, res) {
  try {
    // Ensure createdBy field is correct and matches your schema
    // console.log("user object is ", req.user);
    const blogs = await blogModel
      .find({ createdby: req.user._id })
      .sort({ createdAt: -1 });

    res.render("home", { user: req.user, blogs: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

async function handleLogin(req, res) {
  try {
    console.log("handle login function starts");
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      console.log("on the based on email user is not found");
      return res.redirect("/login");
    }
    // console.log(user);
    const hashPassword = await bcrypt.compare(password, user.password);
    // console.log(hashPassword);
    if (!hashPassword) {
      console.log("user not find");
      return res.redirect("/login");
    }
    // created a token and send it into a cookie named uid

    const token = createToken(user);
    // console.log("token is", token);
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

function handleLogout(req, res) {
  res.clearCookie("uid").redirect("/login");
}

async function handleRenderBlog(req, res) {
  res.render("blog");
  // console.log(req.user);
}

async function handleBlogPost(req, res) {
  try {
    console.log("handleBlogPost function starts");
    // console.log(req.file);
    const { title, body } = req.body;
    const coverImage = req.file ? `static/uploads2/${req.file.filename}` : null;
    const blog = await blogModel.create({
      title: title,
      body: body,
      coverImage: coverImage,
      createdby: req.user._id,
    });

    if (!blog) {
      console.log("Blog is not created ");
    }

    res.redirect("/home");
  } catch (err) {
    if (err) {
      console.log("err found in handleBlogPost function", err);
      return null;
    }
  }
}

async function handleComment(req, res) {
  try {
    console.log("HandleComment function starts");

    const { content } = req.body;
    const comment = await commentModel.create({
      content: content,
      createdby: req.user._id,
      blogID: req.params.id,
    });

    res.redirect(`/blog/${req.params.id}`);
  } catch (err) {
    if (err) {
      console.log(err);
      return res.redirect("/home");
    }
  }
}

async function handlePersonalBlog(req, res) {
  const blogId = req.params.id;
  // console.log(blogId);
  const blog = await blogModel.findOne({ _id: blogId });

  const comment = await commentModel.find({ blogID: blogId });
  // console.log("comments are ", comment);
  res.render("personalBlog", {
    blog: blog,
    user: req.user,
    comments: comment,
  });
}

async function handleBlogEdit(req, res) {
  const blogID = req.params.id;
  const blog = await blogModel.findOne({ _id: blogID });
  res.render("edit-blog", { user: req.user, blog: blog });
}

async function handleBlogDelete(req, res) {
  const blogID = req.params.id;
  const blog = await blogModel.findOneAndDelete({ _id: blogID });
  res.redirect("/home");
}
async function handleDeleteComment(req, res) {
  const commentID = req.params.id;
  const comment = await commentModel.findOneAndDelete({ _id: commentID });
  res.redirect(`/blog/${comment.blogID}`);
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
  handleLogout,
  handleRenderBlog,
  handleBlogPost,
  handleComment,
  handlePersonalBlog,
  handleBlogDelete,
  handleBlogEdit,
  handleDeleteComment,
};
