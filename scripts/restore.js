const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb+srv://hussainijaz233911_db_user:IYEHjSzISqRPUSeL@cluster0.hqdtaki.mongodb.net/vps_fee_management?retryWrites=true&w=majority';

async function restore() {
  const client = new MongoClient(uri);
  await client.connect();
  console.log('Connected to Atlas...');
  const db = client.db('vps_fee_management');

  const filePath = path.join(__dirname, '../bot_records.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const docs = JSON.parse(raw);

  const cleanDocs = docs.map(doc => {
    const d = { ...doc };
    if (d._id && typeof d._id === 'object' && d._id['$oid']) {
      d._id = new ObjectId(d._id['$oid']);
    } else if (typeof d._id === 'string' && ObjectId.isValid(d._id)) {
      d._id = new ObjectId(d._id);
    }
    if (d.createdAt && typeof d.createdAt === 'object' && d.createdAt['$date']) {
      d.createdAt = new Date(d.createdAt['$date']);
    }
    if (d.updatedAt && typeof d.updatedAt === 'object' && d.updatedAt['$date']) {
      d.updatedAt = new Date(d.updatedAt['$date']);
    }
    return d;
  });

  await db.collection('bot_records').deleteMany({});
  const result = await db.collection('bot_records').insertMany(cleanDocs);
  console.log(`Successfully restored ${result.insertedCount} documents into bot_records!`);
  
  const total = await db.collection('bot_records').countDocuments();
  console.log(`Current total count in bot_records: ${total}`);
  process.exit(0);
}

restore().catch(err => {
  console.error('Restore error:', err);
  process.exit(1);
});
