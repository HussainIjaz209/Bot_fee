const app = require('./backend/app');
const { connectToDatabase } = require('./backend/app');

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    console.log(' Connected to MongoDB Atlas (vps_fee_management / bot_records)');
    console.log(`🚀 Trading Bot Fee System is running on http://localhost:${PORT}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Atlas connection failed:', err);
  });

app.listen(PORT, () => {
  console.log(` Server started on http://localhost:${PORT}`);
});
