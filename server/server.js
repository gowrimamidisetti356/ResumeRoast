const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
// app.use('/api/auth', require('./routes/authRoutes')); // Auth routes removed
app.use('/api', require('./routes/resumeRoutes'));

// --- Socket.IO & Live Interview Setup ---
const http = require('http');
const { Server } = require("socket.io");
const { setupLiveInterview } = require('./services/liveInterviewService');



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow dev client
        methods: ["GET", "POST"]
    }
});

// Initialize Live Service
setupLiveInterview(io);




// Basic Route
app.get('/', (req, res) => {
    res.send('ResumeRoaster API is running...');
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
