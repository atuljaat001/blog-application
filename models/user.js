const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    fullName: { type: String, require: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },
    profileImageUrl: { type: String, default: "/images/default.png" },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;
  //check if user password field is modified

  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, salt);
    user.password = hashPassword;

    next();
  }
});

const usermodel = model("user", userSchema);

module.exports = usermodel;
