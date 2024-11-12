import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser'; 
import validator from 'validator';
import zxcvbn from 'zxcvbn';
import dotenv from 'dotenv' 
import { User, GolfClub, LoginLog, ReservedProduct } from "./scheman.js";
import './DBconfig.js'
import { authenticateToken, verifyAdmin } from "./authMiddleware.js";
import { handleExpiredReservations } from './reservationCleanup.js';
import { sanitizeInput, sanitizeUserAgent, validateUsername } from './sanitizeMiddleware.js';
import loginLimiter from './loginLimiter.js';



const app = express();
dotenv.config({ path: '.env.backend' });
app.use(cors({ origin: 'http://localhost:5173' , credentials: true })); 
app.use(express.json());
app.use(cookieParser()); 

handleExpiredReservations();

const SECRET_KEY = process.env.SECRET_KEY;
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME = 15 * 60 * 1000;







// ROUTES //

// Registrera ny användare
app.post("/register", async (req, res) => {
  let { username, password } = req.body;

  try {
    // Sanera användarnamnet
    username = sanitizeInput(username);

    // Validera användarnamnet och fånga eventuella fel
    try {
      validateUsername(username);
    } catch (error) {
      return res.status(400).send(error.message); // Skicka tillbaka felmeddelande utan att krascha servern
    }

    // Kontrollera lösenordets längd
    if (!validator.isLength(password, { min: 8 })) {
      return res
        .status(400)
        .send("Password needs to be at least 8 characters long.");
    }

    // Kontrollera lösenordets styrka
    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 3) {
      return res.status(400).send("Password too weak or too common.");
    }

    // Kontrollera om användarnamnet och lösenordet är desamma
    if (password === username) {
      return res.status(400).send("Password and username cannot be the same.");
    }
    
    

    // Kontrollera om användarnamnet redan finns
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("Username already exists.");
    }

    // Om allt är ok, hasha lösenordet och skapa användaren
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role: "user" });
    await user.save();

    res.send("User registered");
  } catch (error) {
    // Om något annat går fel, skicka ett lämpligt felmeddelande
    console.error(error); // Logga felet för serverövervakning
    return res
      .status(400)
      .send(error.message || "An error occurred during registration.");
  }
});



// Logga in användare och generera JWT-token
app.post("/login", loginLimiter, async (req, res) => {
  let { username, password } = req.body;
  username = sanitizeInput(username);
  console.log("LOGIN TRY");

  const ipAddress = req.ip;
  const userAgent = sanitizeUserAgent(req.headers["user-agent"]);

  const time = new Date()
    .toLocaleString("sv-SE", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(" ", "-");

  try {
    // Validering av användarnamn
    validateUsername(username);

    // Hitta användaren i databasen
    const user = await User.findOne({ username });
    if (!user) {
      await LoginLog.create({
        username,
        time,
        success: false,
        ipAddress,
        userAgent,
      });
      return res.status(400).json({
        message: "Invalid credentials",
        username,
        time,
        ipAddress,
        userAgent,
      });
    }

    // Kontrollera om användaren är låst
    if (user.isLocked()) {
      await LoginLog.create({
        username,
        time,
        success: false,
        message: "Account locked.",
        ipAddress,
        userAgent,
      });
      return res.status(403).json({
        message: "Account locked. Please try again later.",
        username,
        time,
        ipAddress,
        userAgent,
      });
    }

    // Jämför lösenord
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const token = jwt.sign(
        { username: user.username, role: user.role, id: user._id },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000, 
      });

      await LoginLog.create({
        username,
        time,
        success: true,
        ipAddress,
        userAgent,
      });

      return res.status(200).json({
        message: "Successful login",
        role: user.role,
        username,
        time,
        ipAddress,
        userAgent,
        id: user.id,
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
      return res.status(400).json({
        message: "Invalid credentials",
        username,
        time,
        ipAddress,
        userAgent,
      });
    }
  } catch (error) {
    console.error("Error during login:", error); // Logga eventuella fel
    return res.status(500).json({
      message: "Invalid credentials",
      error: error.message || error,
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
        return res.status(400).send('Unvalid Id');
    }
    try {
        await GolfClub.findByIdAndDelete(id);
        res.send('Club deleted');
    } catch (err) {
        res.status(500).send('Failed to delete club.');
    }
});

// Route för att lägga till recension till en golfklubba
app.post('/clubs/:clubId/review', authenticateToken, async (req, res) => {
    const { clubId } = req.params;
    let { review, rating } = req.body;

    if (validator.isEmpty(review) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).send('Review cannot be empty and must be between 0 and 5.');
    }

    review = sanitizeInput(review);

    try {
        const club = await GolfClub.findById(clubId);
        if (!club) {
            return res.status(404).send('Golfclub not found.');
        }

        club.reviews.push({
            user: req.user._id,
            review: review,
            rating: rating
        });

        await club.save();
        res.status(201).send('Review successfully');
    } catch (err) {
        res.status(500).send('Errorr saving review.');
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
      message: "Login-Logs",
      logs,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'Error fetching login-logs.' });
  }
});




app.post("/reservations/:clubId", authenticateToken, async (req, res) => {
  const { clubId } = req.params;
  const { date, time, id } = req.body; 
  console.log("BILD", req.body)

  
  const userId = req.user.id; 
console.log("HÄR", req.user)
console.log("HÄR2", id)
  
  try {
    const club = await GolfClub.findById(clubId);
    console.log("KLUBBA", club)
     console.log("image URL:", club.imgUrl);
    if (!club) {
      return res.status(404).send('Golfclub not found.');
    }

   
    if (club.quantity <= 0) {
      return res
        .status(400)
        .send('Sorry, product out of stock.');
    }
    
      const activeReservations = await ReservedProduct.countDocuments({
        userId,
        expiresAt: { $gt: new Date() },
      });

      if (activeReservations >= 5) {
        return res
          .status(400)
          .send('Maximum number of active reservations exceeded.');
      }

    // Skapa en ny reservation
  const reservation = new ReservedProduct({
    userId, 
    clubId, 
    reservedAt: new Date(),
    expiresAt: new Date(Date.now() + 2 * 60 * 1000), 
    image: club.imgUrl,
  });

    await reservation.save();

    
    club.quantity -= 1;
    await club.save(); 

    res.status(201).json({ message: 'Reservation successful', reservation });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating reservation.');
  }
});

app.get("/reservations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Kontrollera att det här ger rätt värde
    console.log("USER!!!", req.user)
    console.log("User ID:", userId); // Logga userId

    const reservations = await ReservedProduct.find({ userId }).sort({
      reservedAt: -1,
    });
    console.log("Reservations send to frontend:", reservations); // Logga reservationer
    res.json({ message: 'Your reservations: ', reservations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetcing reservations.');
  }
});


app.get("/check-auth", authenticateToken, (req, res) => {
  console.log("session active")
  res.status(200).json({ message: "Session active" });
});

app.listen(5000, () => console.log('Server running on port 5000'));
