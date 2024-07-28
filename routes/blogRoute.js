const express = require("express");
const blogRoute = express.Router();
const {
  handleBlogPost,
  handleRenderBlog,
  handlePersonalBlog,
  handleBlogDelete,
  handleBlogEdit,
  handleDeleteComment,
} = require("../controllers/handlers");
const upload2 = require("../multer2");

blogRoute
  .route("/")
  .get(handleRenderBlog)
  .post(upload2.single("coverImage"), handleBlogPost);

blogRoute.get("/:id", handlePersonalBlog);
blogRoute.get("/edit-blog/:id", handleBlogEdit);
blogRoute.get("/delete-blog/:id", handleBlogDelete);
blogRoute.get("/delete-comment/:id", handleDeleteComment);

module.exports = blogRoute;