const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
  content: { type: String },
  createdby: { type: Schema.Types.ObjectId, ref: "user" },
  blogID: { type: Schema.Types.ObjectId, ref: "blog" },
});

const comment = model("comment", commentSchema);

module.exports = comment;
