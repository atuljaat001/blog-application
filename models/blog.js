const { Schema, model } = require("mongoose");

const blogSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    coverImage: { type: String },
    createdby: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true }
);

const blog = model("blog", blogSchema);

module.exports = blog;
