import jwt from "jsonwebtoken";

// Function to generate a token for a user
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({ userId }, secret, { expiresIn: "7d" });
  return token;
};

export default generateToken;
