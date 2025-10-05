const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const electionRoutes = require('./routes/electionRoutes');
const voterRoutes = require('./routes/voter');
const candidateRoutes = require('./routes/candidateRoutes');
const partyRoutes = require('./routes/partyRoutes');
const regionRoutes = require('./routes/regionRoutes');
const voteRoutes = require('./routes/voteRoutes');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware for CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));

// Middleware for parsing JSON
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/voter', voterRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/votes', voteRoutes);

app.get('/', (req, res) => {
    res.send('Election Management System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));