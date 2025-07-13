import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import trackRoute from './routes/track.js'

dotenv.config();
const app = express();

// Express app in HTTP server
const server = createServer(app);

// Setup Socket.IO




// default middleware
app.use(express.json());


const allowedOrigins = [
  'http://localhost:3000',
  'https://sentinelprime.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

app.set('io', io);

app.use(express.urlencoded({extended : false}));
app.use(cookieParser());

//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/apis', apiRoutes);
app.use('/api/v1/track', trackRoute);



const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on ${port}`);
});