import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret key";

const protectedRoute = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid." });
  }
};

export default protectedRoute;
