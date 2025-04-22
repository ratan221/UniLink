import { readSingle, registerSingle } from "../database/dbFunctions.js";
import User from "../models/user.model.js";
import { compare, genSalt, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

import {
  SUPER_ADMIN_NAME,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_ROLE,
  SUPER_ADMIN_PASSWORD,
  JWT_SECRET,
} from "../Configurations/config.js";

export const encryptPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required for encryption.");
  }
  const salt = await genSalt(10);
  return hashSync(password, salt);
};

export const createSuperAdmin = async () => {
  console.log(SUPER_ADMIN_NAME, "ddddddddd");
  try {
    const data = {
      name: SUPER_ADMIN_NAME,
      username: "admin",
      email: SUPER_ADMIN_EMAIL,
      role: SUPER_ADMIN_ROLE,
      status: "accepted",
      isActive: true,
      password: await encryptPassword(SUPER_ADMIN_PASSWORD),
    };
    const superAdmin = await readSingle(User, { email: data?.email });

    if (!superAdmin) {
      await registerSingle(User, data);

      console.log("Super Admin Created Successfully");
    }
  } catch (error) {
    console.log({ error });
  }
};
export const verifyJWTToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
