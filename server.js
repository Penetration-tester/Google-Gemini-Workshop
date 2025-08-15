// ==================================================================================
// FINAL, FULL-FEATURED BACKEND SERVER (with Excel Export)
// ==================================================================================
// This is the complete and definitive server code for the Gemini Workshop.
// It includes all features: Authentication, a fully protected Admin Panel API,
// a Gemini AI Proxy, a real-time Attendance System with reset, Login Count tracking,
// and the final Excel Export feature.
// ==================================================================================

// --- 1. Import Dependencies ---
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const xlsx = require('xlsx'); // Library for creating Excel files
require('dotenv').config();

// --- 2. Initialize Express App & Middleware ---
const app = express();
app.use(cors());
app.use(express.json());

// --- 3. Database Connection ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas.'))
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });

// --- 4. Configurations ---
const JWT_SECRET = process.env.JWT_SECRET;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// --- 5. User Schema and Model ---
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    class: { type: String },
    roll: { type: String },
    passwordHash: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
    attendance: { type: String, default: 'Absent' },
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- 6. In-memory Store & Security Middleware ---
let currentAttendanceSession = { code: null, expiresAt: null };

const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided. Access denied.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        if (user.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admin role required.' });
        req.user = user;
        next();
    });
};

// --- 7. API Endpoints ---

// --- Authentication Endpoints ---
app.post('/register', async (req, res) => {
    try {
        const { email, password, name, userClass, roll } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ name, email, class: userClass, roll, passwordHash: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

        if (email === 'admin@workshop.com' && password === 'admin123') {
            const payload = { role: 'admin', name: 'Admin' };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
            return res.status(200).json({ message: 'Admin login successful!', token, user: { name: 'Admin', role: 'admin' } });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });
        if (user.isBlocked) return res.status(403).json({ message: 'This account has been blocked.' });

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (passwordMatches) {
            await User.findByIdAndUpdate(user._id, {
                $inc: { loginCount: 1 },
                lastLogin: new Date()
            });

            const payload = { userId: user._id, name: user.name, role: 'user' };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
            return res.status(200).json({ message: 'Login successful!', token, user: { id: user._id, name: user.name, email: user.email, role: 'user' } });
        } else {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

// --- Gemini AI Proxy Endpoint ---
app.post('/gemini-proxy', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ message: 'Prompt is required.' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.status(200).json({ text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ message: 'Error communicating with the AI service.' });
    }
});

// --- Attendance Endpoints ---
app.post('/attendance/start', verifyAdmin, async (req, res) => {
    try {
        await User.updateMany({}, { $set: { attendance: 'Absent' } });
        console.log("All student attendance records have been reset to 'Absent'.");

        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 30 * 60 * 1000);
        currentAttendanceSession = { code: newCode, expiresAt: expiry };

        console.log(`New attendance session started. Code: ${newCode}, Duration: 30 minutes`);
        res.status(200).json(currentAttendanceSession);
    } catch (error) {
        console.error("Error starting attendance session:", error);
        res.status(500).json({ message: "Failed to start a new attendance session." });
    }
});

app.post('/attendance/mark', async (req, res) => {
    const { code, userId } = req.body;
    const now = new Date();
    if (!currentAttendanceSession.code || now > currentAttendanceSession.expiresAt) {
        return res.status(400).json({ message: 'Attendance session is not active or has expired.' });
    }
    if (code !== currentAttendanceSession.code) {
        return res.status(400).json({ message: 'Invalid attendance code.' });
    }
    try {
        await User.findByIdAndUpdate(userId, { attendance: 'Present' });
        res.status(200).json({ message: 'Attendance marked successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user attendance.' });
    }
});

// --- Secured Admin Panel API Endpoints ---
app.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('-passwordHash');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

app.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found.' });
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

app.patch('/users/:id/block', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.status(200).json({ message: `User status updated successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user status.' });
    }
});

// --- Excel Export Endpoint ---
app.get('/attendance/export', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('name email class roll attendance').lean();
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(users);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        const date = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="attendance-report-${date}.xlsx"`);
        res.send(buffer);
        console.log(`Successfully generated and sent attendance report.`);
    } catch (error) {
        console.error("Error generating Excel report:", error);
        res.status(500).json({ message: "Failed to generate the report." });
    }
});

// --- 8. Start the Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});