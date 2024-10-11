import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// Skapa en express-app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB-anslutning
mongoose.connect('mongodb://localhost:27017/Your-database-name', {
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


const User = mongoose.model('User', UserSchema);

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

// Hämta något från databasen, byt ut till rätt collection
app.get('/user-page', async (req, res) => {
    const something = await someCollection.find();
    res.json(someting);
});

// Admin - ta bort något med id
app.delete('/admin-page/delete/:id', async (req, res) => {
    const { id } = req.params;
    await someCollection.findByIdAndDelete(id);
    res.send('something deleted');
});

// Starta server
app.listen(5000, () => console.log('Server running on port 5000'));
