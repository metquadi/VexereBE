const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../models/userModel");

const sgAPIKey = config.get("sgAPIKey");
const jwtSignature = config.get("jwtSignature");

sgMail.setApiKey(sgAPIKey);

const signUp = async (req, res) => {
  try {
    const { username, password, email, phoneNumber } = req.body;
    const foundUser = await User.findOne().or([{ username }, { email }]);
    if (foundUser) {
      return res.status(400).send({ message: "User already exist !" });
    }
    const newUser = new User({
      username,
      password,
      email,
      phoneNumber,
      role: "user",
    });
    let result = await newUser.save();
    result = result.deleteField();
    res.status(201).send(result);

    sgMail.send({
      from: "dotrunghoai@gmail.com",
      to: "dotrunghoai@gmail.com",
      subject: "Welcome SendGridMail",
      html:
        "<h2 style='color: yellow'>Welcome bạn đã đến với SendGridMail Free</h2>",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong !" });
  }
};

const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res
        .status(400)
        .send({ message: "Tài khoản hoặc mật khẩu không đúng !" });
    }
    if (!(await bcrypt.compare(password, foundUser.password))) {
      return res
        .status(400)
        .send({ message: "Tài khoản hoặc mật khẩu không đúng !" });
    }
    const token = await jwt.sign(
      {
        _id: foundUser._id,
        user: foundUser.deleteField()
      },
      jwtSignature,
      {
        expiresIn: 7200,
      }
    );
    foundUser.tokens.push(token);
    await foundUser.save();
    res.status(200).send(token);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong !" });
  }
};

module.exports = { signUp, signIn };
