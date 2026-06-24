const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campx');
  const { StudentData } = require('./models/InstitutionalData');

  const { role, search, page = 1, limit = 20, status = '' } = { role: 'student', status: '' };
  
  // Simulated variations logic
  const branchInput = "CSE";
  const variations = ["CSE", "COMPUTER SCIENCE AND ENGINEERING", "B.TECH COMPUTER SCIENCE AND ENGINEERING", "CS", "B.Tech. - Computer Science and Engineering"];
  
  const branchRegexArray = variations.map(v => {
    const escaped = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}$`, 'i');
  });

  const sdQuery = { isRegistered: false, branch: { $in: branchRegexArray } };
  
  console.log("Query:", sdQuery);
  const data = await StudentData.find(sdQuery).limit(5);
  console.log('Found students count:', data.length);
  if (data.length > 0) {
     console.log('First student branch:', data[0].branch);
  } else {
     // Let's see what is actually in the db
     const anyStudent = await StudentData.findOne();
     console.log('Any student branch:', anyStudent ? anyStudent.branch : 'none');
  }

  mongoose.disconnect();
}
run();
