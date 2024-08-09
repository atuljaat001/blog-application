const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpModel = require("../models/otp");
const crypto = require("crypto");
const multer = require("multer");
const blogModel = require("../models/blog");
const commentModel = require("../models/comment");

const { createToken, getUser } = require("../token/token");
const blog = require("../models/blog");
function handleRenderLogin(req, res) {
  res.render("login");
}

async function handleSignup(req, res) {
  try {
    const { fullName, email, password } = req.body; //cant find image from req.body it is in req.file
    const profileImageUrl = req.file
      ? `/static/uploads${req.file.filename}`
      : "static/uploads/images.png";

    // console.log(profileImageUrl);

    const createUser = await userModel.create({
      fullName: fullName,
      email: email,
      password,
      profileImageUrl: profileImageUrl,
    });

    res.redirect("/login");
  } catch (err) {
    console.log("error in handleSignup ", err);
    return null;
  }
}
async function handleRenderAllBlogs(req, res) {
  const allBlogs = await blogModel.find({});
  const user = await userModel.findOne({ _id: req.user._id });
  res.render("home", { blogs: allBlogs, user: user });
}

async function handleRenderPersonalBlogs(req, res) {
  try {
    // Ensure createdBy field is correct and matches your schema
    // console.log("user object is ", req.user);
    const user = await userModel.findOne({ _id: req.user._id });
    const blogs = await blogModel
      .find({ createdby: req.user._id })
      .sort({ createdAt: -1 });

    res.render("home", { user: user, blogs: blogs });
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
    console.log(password);
    console.log(user.password);
    if (!user) {
      console.log("on the based on email user is not found");
      return res.redirect("/login");
    }
    // console.log(user);
    const hashPassword = await bcrypt.compare(password, user.password);
    // console.log(hashPassword);
    if (!hashPassword) {
      console.log("Problem in hash password macthing");
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

    res.redirect(`/blog/home-blog/${req.params.id}`);
  } catch (err) {
    if (err) {
      console.log(err);
      return res.redirect("/home");
    }
  }
}

async function handleHomeBlog(req, res) {
  const blogId = req.params.id;

  // Fetch the blog and its creator
  const blog = await blogModel.findOne({ _id: blogId });
  const user = await userModel.findOne({ _id: blog.createdby }); //find the blog creator
  const user2 = await userModel.findOne({ _id: req.user._id }); // active user

  // Fetch the logged-in user

  // Fetch the comments and populate the createdBy field with user information
  const comments = await commentModel
    .find({ blogID: blogId })
    .populate("createdby");

  console.log(comments);

  res.render("blogHome", {
    blog: blog,
    user: user,
    user2: user2,
    comments: comments,
  });
}

async function handlePersonalBlog(req, res) {
  const blogId = req.params.id;
  // console.log(blogId);

  // Fetch the blog and its creator
  const blog = await blogModel.findOne({ _id: blogId });
  const user = await userModel.findOne({ _id: blog.createdby });

  // Fetch the logged-in user

  // Fetch the comments and populate the createdBy field with user information
  const comments = await commentModel
    .find({ blogID: blogId })
    .populate("createdby");

  // console.log(comments);

  res.render("personalBlog", {
    blog: blog,
    user: user,

    comments: comments,
  });
}

async function handleBlogEdit(req, res) {
  const blogID = req.params.id;
  // const blog = await blogModel.findOne({ _id: blogID });
  // console.log("blog id is---->", blogID);
  const blog = await blogModel.findOne({ _id: blogID });
  res.render("edit-blog", { user: req.user, blog: blog });
}

async function handleBlogEditPost(req, res) {
  const blogID = req.params.id;
  const { title, body } = req.body;

  try {
    const blog = await blogModel.findOne({ _id: blogID });
    // console.log(blogID);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }

    const previousImage = blog.coverImage;
    const coverImage = req.file
      ? `static/uploads2/${req.file.filename}`
      : previousImage;

    await blogModel.findOneAndUpdate(
      { _id: blogID },
      { $set: { title: title, body: body, coverImage: coverImage } }
    );

    res.redirect(`/blog/personal-blog/${blog._id}`);
  } catch (error) {
    console.error("Error in handleBlogEditPost:", error);
    res.status(500).send("Server Error");
  }
}

async function handleBlogDelete(req, res) {
  const blogID = req.params.id;
  const blog = await blogModel.findOneAndDelete({ _id: blogID });
  res.redirect("/home");
}
async function handleDeleteComment(req, res) {
  const commentID = req.params.id;
  const comment = await commentModel.findOneAndDelete({ _id: commentID });
  res.redirect(`/blog/home-blog/${comment.blogID}`);
}

async function handleRenderAccount(req, res) {
  const user = req.user;
  const findUser = await userModel.findOne({ _id: user._id });
  res.render("accountInfo", { user: findUser });
}

async function handleEditAccountDetails(req, res) {
  const user = await userModel.findOne({ _id: req.user._id });
  res.render("edit-profile", { user: user });
}

async function handlePostAccountDetails(req, res) {
  const user = req.user;
  const { email, fullName } = req.body;

  const imageFile = req.file
    ? `static/uploads/${req.file.filename}`
    : user.profileImageUrl;

  const findUser = await userModel.findOneAndUpdate(
    { _id: user._id },
    { $set: { email: email, fullName: fullName, profileImageUrl: imageFile } }
  );
  if (!findUser) {
    res.send("User is not find");
  }
  res.redirect("/account-info");
}

async function handleRenderChangePassword(req, res) {
  res.render("change-password");
}

async function handleChangePassword(req, res) {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // if (!oldPassword || !newPassword || !confirmPassword) {
    //   return res.status(400).send("All fields are required");
    // }

    const user = await userModel.findOne({ _id: req.user._id });

    if (!user) {
      return res.status(404).send("User not found");
    }
    // console.log(user.password);
    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    // console.log(checkPassword);

    if (!checkPassword) {
      return res.status(400).send("Password is incorrect");
    }

    // if (newPassword !== confirmPassword) {
    //   return res.status(400).send("Password confirmation does not match");
    // }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    await userModel.findOneAndUpdate(
      { _id: user._id },
      { $set: { password: hashPassword } }
    );

    res.redirect("/account-info");
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).send("An error occurred while changing the password");
  }
}

async function handleAdmin(req, res) {
  const user = await userModel.find({});

  res.render("admin", { users: user });
}

async function handleDeleteUser(req, res) {
  try {
    console.log("handleDeleteUser function starts");
    const userId = req.params.id;
    console.log("user id is ", userId);
    const userComments = await commentModel.deleteMany({
      createdby: userId,
    });
    const user = await userModel.findOneAndDelete({ _id: userId });

    if (!user) {
      return res.send("Failed to delete the user. User not found.");
    }
    // console.log(req.user._id);
    // console.log("user is", req.user);
    if (req.user && req.user._id.toString() === userId) {
      res.clearCookie("uid").redirect("/admin");
    }

    res.redirect("/admin");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("An error occurred while trying to delete the user.");
  }
}
async function handleRenderAddUser(req, res) {
  res.render("adminAddUser");
}
async function handleAdminAddUser(req, res) {
  const { fullname, email, password, role } = req.body;
  // const salt = await bcrypt.genSalt(10);
  // const hashPassword = await bcrypt.hash(password, salt);
  const createUser = await userModel.create({
    fullName: fullname,
    email,
    password,
    role,
  });
  console.log(createUser);
  if (!createUser) {
    res.send("User is not created");
  }
  res.redirect("/admin");
}

module.exports = {
  handleRenderAddUser,
  handleAdminAddUser,
  handleDeleteUser,
  handleAdmin,
  handlePostAccountDetails,
  handleEditAccountDetails,
  handleRenderLogin,
  handleSignup,
  handleLogin,
  handleRenderPersonalBlogs,
  handleforget,
  handleRenderAllBlogs,
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
  handleBlogEditPost,
  handleRenderAccount,
  handleRenderChangePassword,
  handleChangePassword,
  handleHomeBlog,
};
