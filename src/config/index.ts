import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

dotenv.config();

export const DB_URL = process.env.DB_URL ?? 'postgress://postgres:password@localhost:5432/mydb';

export const JWT_SECRET = process.env.JWT_SECRET as Secret;
