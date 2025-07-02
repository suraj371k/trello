import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';

//routes
import userRoutes from './routes/user.routes.js'

dotenv.config();

const app = express();
const port = process.env.PORT || 4000

app.use(express.json());
app.use(cookieParser());
app.use(cors());

//routes
app.use('/api/user' , userRoutes)


//database connection
connectDB()


app.listen(port , () => {
    console.log(`App is running of localhost:${port}`)
})
