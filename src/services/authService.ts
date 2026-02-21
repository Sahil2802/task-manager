import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from "../validators/authSchemas.js";

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

//  Helpers 

const signToken = (userId: string, email: string): string =>
  jwt.sign({ sub: userId, email }, env.jwtSecret, {
    expiresIn: TOKEN_EXPIRES_IN,
  });

/**
 * Validates raw input with a Zod schema and throws a 400 AppError
 * with a human-readable message derived from the first validation issue.
 */
function validate<T>(schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: { issues: { message: string }[] } } }, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid input";
    throw new AppError(message, 400);
  }
  return result.data;
}

//  Service Functions 

/**
 * Validates input via Zod, hashes the password, persists the user,
 * and returns a signed JWT alongside the public user object.
 */
export const registerUser = async (body: unknown): Promise<AuthPayload> => {
  const { name, email, password } = validate<RegisterInput>(registerSchema, body);

  // Uniqueness check (email is already lowercased + trimmed by Zod)
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  // Persist user
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, password: passwordHash });

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
 * Validates credentials via Zod and returns a signed JWT alongside
 * the public user object.
 */
export const loginUser = async (body: unknown): Promise<AuthPayload> => {
  const { email, password } = validate<LoginInput>(loginSchema, body);

  // Constant-time failure to prevent user enumeration
  const user = await User.findOne({ email }).select("+password");

  // Always run bcrypt.compare even if user not found to prevent timing attacks
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
