import { config } from "dotenv";
config();

export const {
  SUPER_ADMIN_NAME,
  SUPER_ADMIN_ROLE,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  MONGODB_URL,
  JWT_SECRET,
} = process.env;
