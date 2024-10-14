// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/Golfstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection failed", err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['user', 'superuser', 'admin'], default: 'user' }
});

const GolfClubSchema = new mongoose.Schema({
    brand: String,
    model: String,
    price: Number,
    quantity: Number,
});

const User = mongoose.model('User', UserSchema);

const GolfClub = mongoose.model('GolfClub', GolfClubSchema);

const SECRET_KEY = 'your-very-secure-secret-key';

// Registrera ny användare
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.send('User registered');
});

// Logga in användare och generera JWT-token
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
            res.json({ token, role: user.role });
        } else {
            res.status(400).send('Invalid credentials');
        }
    } else {
        res.status(400).send('Invalid credentials');
    }
});

// Middleware för att verifiera JWT-token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Middleware för att verifiera admin-roll
function verifyAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next(); // Om användaren är admin, gå vidare
}

// Skyddad route - endast för inloggade användare
app.get('/user-page', authenticateToken, async (req, res) => {
      const clubs = await GolfClub.find();
    res.json({ message: "Welcome to user page", clubs });
});

// Admin-route - Endast för admin
app.get('/admin-page', authenticateToken, verifyAdmin, async (req, res) => {
    const clubs = await GolfClub.find();
    res.json({ message: "Welcome to admin page!", clubs });
});


// Admin - ta bort golfklubb
app.delete('/admin-page/delete/:id', async (req, res) => {
    const { id } = req.params;
    await GolfClub.findByIdAndDelete(id);
    res.send('Club deleted');
});


app.listen(5000, () => console.log('Server running on port 5000'));
