const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Prescription NER Extractor — Node/Express API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/register | /api/auth/login | /api/auth/me',
      prescriptions: '/api/prescriptions',
      admin: '/api/admin/stats | /api/admin/users',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node/Express server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});