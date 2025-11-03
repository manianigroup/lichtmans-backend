import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from "./routes/productRoutes.js";
import eventRoutes from './routes/eventRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import offerRoutes from './routes/offers.js';
import { syncFeaturedTypes } from './utils/syncFeaturedTypes.js';

dotenv.config();

const app = express();

// Middleware

/* For Production */
const allowedOrigins = [
  process.env.FRONTEND_URL,                         // e.g. your production domain
  "https://fabulous-baklava-9efdeb.netlify.app",    // your Netlify test site
  "https://lichtmansliquorstore.com",               // your final custom domain
  "http://localhost:5173"                           // for local testing
].filter(Boolean); // removes undefined values

// app.use(cors());
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));


app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log('MongoDB connected');
    // Call syncFeaturedTypes here
    try {
      const synced = await syncFeaturedTypes();
    } catch (err) {
      console.error('Error syncing featured products:', err);
    }
  })
.catch(err => console.error('MongoDB connection error:', err));

// Sample route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/test', (req, res) => {
  res.send('Server works!');
});

app.use('/api/products', productRoutes);
// app.use('/api/featured', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/offers', offerRoutes);

const PORT = process.env.PORT || 5001;
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});