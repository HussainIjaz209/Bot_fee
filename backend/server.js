const app = require('./app');
const { connectToDatabase } = require('./app');

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    console.log(' Connected to MongoDB Atlas (vps_fee_management / bot_records)');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Atlas connection failed:', err);
    process.exit(1);
  });
