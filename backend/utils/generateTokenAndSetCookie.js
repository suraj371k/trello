import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret key";

const generateTokenAndSetCookie = (user, res) => {
  const token = jwt.sign(
    { userId: user._id , username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  ); 
 
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateTokenAndSetCookie;
