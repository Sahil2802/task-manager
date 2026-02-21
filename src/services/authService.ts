import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

//  Constants 

const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = "9d";

//  Types 

export interface AuthPayload {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  token: string;
}

// Helpers 

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string): boolean => password.length >= 8;

const signToken = (userId: string, email: string): string =>
  jwt.sign({ sub: userId, email }, env.jwtSecret, {
    expiresIn: TOKEN_EXPIRES_IN,
  });

// Service Functions 

/**
 * Validates input, hashes the password, persists the user,
 * and returns a signed JWT alongside the public user object.
 */
export const registerUser = async (
  name?: string,
  email?: string,
  password?: string,
): Promise<AuthPayload> => {
  // Input validation
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required", 400);
  }
  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }
  if (!isValidPassword(password)) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Uniqueness check
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  // Persist user
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token: signToken(user.id, user.email),
  };
};

/**
 * Validates credentials and returns a signed JWT alongside
 * the public user object.
 */
export const loginUser = async (
  email?: string,
  password?: string,
): Promise<AuthPayload> => {
  // Input validation
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Constant-time failure to prevent user enumeration
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  // If user doesn't exist, we still compare the password against a dummy hash
  // to ensure the operation takes the same amount of time.
  const DUMMY_HASH = "$2b$10$abcdefghijklmnopqrstuvwxyza1234567890abcdefghijklm";
  const passwordToCompare = user ? user.password : DUMMY_HASH;
  const passwordMatches = await bcrypt.compare(password, passwordToCompare);

  if (!user || !passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    token: signToken(user.id, user.email),
  };
};
