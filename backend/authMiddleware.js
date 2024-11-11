
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;

// Verifiera JWT-token från cookies
export function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  console.log('TOKEN:', token)
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Verifiera admin-roll
export function verifyAdmin(req, res, next) {
  console.log("ADMIN?!?!", req.user)
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
}
