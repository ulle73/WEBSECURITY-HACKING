import validator from "validator";

export function sanitizeInput(input) {
  if (typeof input !== "string") {
    // Om input är undefined eller null, returnera en tom sträng eller hantera det på annat sätt
    return "";
  }
  input = input.replace(/<script.*?>.*?<\/script>/gi, "");
  return validator.whitelist(
    input,
    " &()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789åäöÅÄÖ"
  );
}

export function sanitizeUserAgent(userAgent) {
  userAgent = userAgent.replace(/<script.*?>.*?<\/script>/gi, "");
  return validator.whitelist(
    userAgent,
    " &()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789åäöÅÄÖ"
  );
}


export function validateUsername(username) {
  // Validera om användarnamnet är alfanumeriskt och har ett giltigt format
  if (!validator.isAlphanumeric(username, "sv-SE", { ignore: "åäöÅÄÖ-" })) {
    throw new Error("Username contains invalid characters.");
  }
}