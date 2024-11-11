import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many failed attempts, please try again later.",
  keyGenerator: (req) => req.body.username, // Begränsa baserat på användarnamn
  skipFailedRequests: true, // Ignorera lyckade inloggningsförsök
});

export default loginLimiter;
