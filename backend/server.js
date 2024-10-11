import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Skapa en express-app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB-anslutning
mongoose.connect('mongodb://localhost:27017/Golfstore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection failed", err));

// Mongoose-scheman
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

// Routes
// Registrera ny användare
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.send('User registered');
});

// Logga in användare
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.json({ role: user.role, username: user.username });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

// Hämta alla golfklubbor för användare
app.get('/user-page', async (req, res) => {
    const clubs = await GolfClub.find();
    res.json(clubs);
});

// Admin - ta bort golfklubb
app.delete('/admin-page/delete/:id', async (req, res) => {
    const { id } = req.params;
    await GolfClub.findByIdAndDelete(id);
    res.send('Club deleted');
});

// Starta server
app.listen(5000, () => console.log('Server running on port 5000'));
