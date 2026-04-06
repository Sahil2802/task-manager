import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized Access" });
  } else {
    try {
      const jwtToken = jwt.verify(token, process.env.JWT_SECRET!);
      req.user = jwtToken;
    } catch {
      return res.status(401).json({ message: "Unauthorized Access" });
    }
  }
  next();
};

export default auth;
