import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'; // För att hantera cookies
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import zxcvbn from 'zxcvbn';
import dotenv from 'dotenv' 
import { User, GolfClub, LoginLog } from './scheman.js'
import './DBconfig.js'
import { authenticateToken, verifyAdmin } from "./authMiddleware.js";



const app = express();
dotenv.config({ path: '.env.backend' });
app.use(cors({ origin: 'http://localhost:5173' , credentials: true })); // Tillåt CORS med credentials
app.use(express.json());
app.use(cookieParser()); // Aktivera cookie-parser

const SECRET_KEY = process.env.SECRET_KEY;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'För många inloggningsförsök, vänligen försök igen senare.',
     keyGenerator: (req) => req.body.username, // Begränsa baserat på användarnamn
    skipFailedRequests: true, // Ignorera lyckade inloggningsförsök
});


function sanitizeInput(input) {
    input = input.replace(/<script.*?>.*?<\/script>/gi, '');
    return validator.whitelist(input,' <>&()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789åäöÅÄÖ');
}

function sanitizeUserAgent(userAgent) {
 userAgent = userAgent.replace(/<script.*?>.*?<\/script>/gi, "");
 return validator.whitelist(
   userAgent,
   " <>&()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789åäöÅÄÖ"
 ); 
}


// ROUTES //

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
    console.log("LOGIN TRY")
    
    
     const ipAddress = req.ip;
     const userAgent = sanitizeUserAgent(req.headers["user-agent"])
  
     
        const time = new Date()
          .toLocaleString("sv-SE", {
            year: "2-digit",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(" ", "-");

    const user = await User.findOne({ username });
    if (!user) {
         await LoginLog.create({ username, time, success: false, ipAddress, userAgent });
        return res
          .status(400)
          .json({
            message: "Invalid credentials",
            username,
            time,
            ipAddress,
            userAgent,
          });
    }

    if (user.isLocked()) {
        await LoginLog.create({
          username,
          time,
          success: false,
          message: "Account locked.",
          ipAddress,
          userAgent,
        });
        return res
          .status(403)
          .json({
            message: "Account locked. Please try again later.",
            username,
            time,
            ipAddress,
            userAgent,
          });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            
            maxAge: 5 * 60 * 1000 // 1 timme
        });
        await LoginLog.create({
          username,
          time,
          success: true,
          ipAddress,
          userAgent,
        });
        return res
          .status(200)
          .json({
            message: "Sucessful login",
            role: user.role,
            username,
            time,
            ipAddress,
            userAgent,
          });
    } else {
        user.loginAttempts += 1;
        if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockTime = Date.now() + LOCK_TIME;
            const swedishTime = new Date(lockTime + 2 * 60 * 60 * 1000);
            user.lockUntil = swedishTime.toISOString().substring(0, 19);
        }
        await user.save();
        await LoginLog.create({
          username,
          time,
          success: false,
          ipAddress,
          userAgent,
        });
        return res
          .status(400)
          .json({
            message: "Invalid credentials",
            username,
            time,
            ipAddress,
            userAgent,
          });
    }
});



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


app.get("/admin-logs", authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const logs = await LoginLog.find().sort({ time: -1 }); // Hämta alla loggar, sorterade efter tid (nyaste först)
    res.json({
      message: "Inloggningsloggar",
      logs,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Ett fel inträffade vid hämtning av loggarna" });
  }
});


app.listen(5000, () => console.log('Server running on port 5000'));
