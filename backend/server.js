// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

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
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Hänvisning till användaren som skrev recensionen
        review: String,  // Själva recensionen
         rating: { type: Number, required: true },
        date: { type: Date, default: Date.now }  // Datum för när recensionen skapades
    }]
});

const User = mongoose.model('User', UserSchema);

const GolfClub = mongoose.model('GolfClub', GolfClubSchema);

const SECRET_KEY = 'your-very-secure-secret-key';

function sanitizeInput(input) {
    // Ta bort farliga taggar som <script>
       input = input.replace(/<script.*?>.*?<\/script>/gi, '');
    // Tillåt <, >, &, och allt annat som är alfanumeriskt
    return validator.whitelist(input, '<>&()abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789åäöÅÄÖ');
}

// Registrera ny användare
app.post('/register', async (req, res) => {
    let { username, password, role } = req.body;
    
     username = sanitizeInput(username); 

    // Sanera roll
    role = validator.escape(role);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.send('User registered');
});

// Logga in användare och generera JWT-token
app.post('/login', async (req, res) => {
    let { username, password } = req.body;
    
     username = sanitizeInput(username); 
    
    const user = await User.findOne({ username });

    if (user) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign({ _id: user._id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
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

   

    
    

  
    try {
        
         // Validering av inmatning
    if (validator.isEmpty(review) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).send('Recensionen får inte vara tom och betyget måste vara mellan 1 och 5');
    }
    
     review = sanitizeInput(review);
     
        const club = await GolfClub.findById(clubId);
        if (!club) {
            return res.status(404).send('Golfklubba hittades inte');
        }

        // Lägga till recensionen
        club.reviews.push({
            user: req.user._id, // ID på den inloggade användaren
            review: review,
            rating: rating // Spara betyget
        });

        // Spara uppdaterad klubb med recension
        await club.save();

        res.status(201).send('Recension tillagd');
    } catch (err) {
        console.error('Error while adding review:', err); // Logga felet i servern
        res.status(500).send('Ett fel inträffade när recensionen lades till');
    }
});



app.listen(5000, () => console.log('Server running on port 5000'));
