// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'; // För att hantera cookies
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import zxcvbn from 'zxcvbn';
import dotenv from 'dotenv' 

const app = express();
dotenv.config({ path: '.env.backend' });
app.use(cors({ origin: 'http://localhost:5173' , credentials: true })); // Tillåt CORS med credentials
app.use(express.json());
app.use(cookieParser()); // Aktivera cookie-parser


mongoose.connect(`mongodb://${process.env.MONGODB_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection failed", err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, enum: ['user', 'superuser', 'admin'], default: 'user' },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: String }
});

const GolfClubSchema = new mongoose.Schema({
    brand: String,
    model: String,
    price: Number,
    quantity: Number,
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        review: String,
        rating: { type: Number, required: true },
        date: { type: Date, default: Date.now }
    }]
});

UserSchema.methods.isLocked = function () {
    const lockUntilDate = new Date(this.lockUntil).getTime();
    return this.lockUntil && lockUntilDate > Date.now();
};

const User = mongoose.model('User', UserSchema);
const GolfClub = mongoose.model('GolfClub', GolfClubSchema);

const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000; // 15 minuter

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'För många inloggningsförsök, vänligen försök igen senare.',
     keyGenerator: (req) => req.body.username, // Begränsa baserat på användarnamn
    skipFailedRequests: true, // Ignorera lyckade inloggningsförsök
});

const SECRET_KEY = process.env.SECRET_KEY;

function sanitizeInput(input) {
    input = input.replace(/<script.*?>.*?<\/script>/gi, '');
    return validator.whitelist(input, ' <>&()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789åäöÅÄÖ');
}

// Registrera ny användare
app.post('/register', async (req, res) => {
    let { username, password, role } = req.body;

    // Sanera användarnamn och roll
    username = sanitizeInput(username);
    role = validator.escape(role);

    // Kontrollera om lösenordet är minst 8 tecken
    if (!validator.isLength(password, { min: 8 })) {
        return res.status(400).send('Lösenordet måste vara minst 8 tecken.');
    }

    // Använd zxcvbn för att kontrollera lösenordets styrka
    const passwordStrength = zxcvbn(password);

    // Om lösenordet är för svagt, eller för vanligt, avvisa det
    if (passwordStrength.score < 3) {  // 0-4 där 3-4 är bra
        return res.status(400).send('Lösenordet är för svagt eller vanligt. Använd ett starkare lösenord.');
    }
    
    if(password === username){
        return res.status(400).send('Lösenordet och användarnamn får inte vara lika.');
    }

    // Om lösenordet är tillräckligt starkt, fortsätt med registreringen
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();

    res.send('User registered');
});


// Logga in användare och generera JWT-token
app.post('/login', loginLimiter, async (req, res) => {
    let { username, password } = req.body;
    username = sanitizeInput(username);

    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).send('Invalid credentials');
    }

    if (user.isLocked()) {
        return res.status(403).send('Account locked. Please try again later.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            
            maxAge: 1 * 60 * 1000 // 1 timme
        });
        return res.json({ role: user.role });
    } else {
        user.loginAttempts += 1;
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockTime = Date.now() + LOCK_TIME;
            const swedishTime = new Date(lockTime + 2 * 60 * 60 * 1000);
            user.lockUntil = swedishTime.toISOString().substring(0, 19);
        }
        await user.save();
        return res.status(400).send('Invalid credentials');
    }
});

// Middleware för att verifiera JWT-token från cookies
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
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
    next();
}

app.get('/', async (req, res) => {
   res.sendStatus(200);
});

// Skyddad route - endast för inloggade användare
app.get('/user-page', authenticateToken, async (req, res) => {
    const clubs = await GolfClub.find();
    res.json({
        message: "Welcome to User page",
        clubs,
        user: {
            username: req.user.username,
            role: req.user.role
        }
    });
});

// Admin-route - Endast för admin
app.get('/admin-page', authenticateToken, verifyAdmin, async (req, res) => {
    const clubs = await GolfClub.find();
    res.json({
        message: "Welcome to Admin page",
        clubs,
        user: {
            username: req.user.username,
            role: req.user.role
        }
    });
});

// Admin - ta bort golfklubb
app.delete('/admin-page/delete/:id', authenticateToken, verifyAdmin, async (req, res) => {
    const { id } = req.params;
    if (!validator.isMongoId(id)) {
        return res.status(400).send('Ogiltigt id-format');
    }
    try {
        await GolfClub.findByIdAndDelete(id);
        res.send('Club deleted');
    } catch (err) {
        res.status(500).send('Failed to delete club');
    }
});

// Route för att lägga till recension till en golfklubba
app.post('/clubs/:clubId/review', authenticateToken, async (req, res) => {
    const { clubId } = req.params;
    let { review, rating } = req.body;

    if (validator.isEmpty(review) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).send('Recensionen får inte vara tom och betyget måste vara mellan 1 och 5');
    }

    review = sanitizeInput(review);

    try {
        const club = await GolfClub.findById(clubId);
        if (!club) {
            return res.status(404).send('Golfklubba hittades inte');
        }

        club.reviews.push({
            user: req.user._id,
            review: review,
            rating: rating
        });

        await club.save();
        res.status(201).send('Recension tillagd');
    } catch (err) {
        res.status(500).send('Ett fel inträffade när recensionen lades till');
    }
});

// Logga ut användare genom att radera cookien
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.send('Logged out');
});

app.listen(5000, () => console.log('Server running on port 5000'));
