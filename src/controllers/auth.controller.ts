import { supabase } from "../lib/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";

const signup = async (req: Request, res: Response) => {
  // ------ Check the data before inserting into db -----

  // Check if any of the fields is empty
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Field cannot be empty" });
  }

  // Query the supabase to check if the user is already registered
  const { data, error } = await supabase
    .from("users")
    .select()
    .eq("email", email);
  if (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
  // if the data returned is more than 0 this means the user with this email already exists in the db
  if (data.length > 0) {
    return res.status(409).json({ message: "Email already exists" });
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // ------ Insert into db -----
  const { data: insertData, error: insertError } = await supabase
    .from("users")
    .insert({
      name,
      email,
      password: hashedPassword,
    })
    .select("id")
    .single();
  if (insertError) {
    return res.status(500).json({ message: "Internal server error" });
  }
  const token = jwt.sign({ id: insertData.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  return res
    .status(201)
    .json({ message: "Succesfully registered", token: token });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Enter valid email and password" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, password")
    .eq("email", email);
  // .single();

  if (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
  if (!data) {
    return res.status(404).json({ message: "User is not registered" });
  }
  const hashedPassword = data[0]!.password;
  const passwordMatch = await bcrypt.compare(password, hashedPassword);

  if (passwordMatch) {
    const token = jwt.sign({ id: data[0]!.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    return res
      .status(200)
      .json({ message: "Logged in successfully", token: token });
  } else {
    return res.status(401).json({ message: "Incorrect username or password" });
  }
};

export { signup, login };
