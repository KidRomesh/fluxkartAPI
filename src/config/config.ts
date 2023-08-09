import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 4040;
const DB_URL="mongodb+srv://admin:admin@web0.jvf7ui1.mongodb.net/users"


export default {
  port : port,
  DB_URL : DB_URL
};