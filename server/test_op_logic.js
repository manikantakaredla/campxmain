const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campx');
  const Opportunity = require('./models/Opportunity');
  const User = require('./models/User');

  // Find an admin user
  let user = await User.findOne({ role: 'admin' });
  if (!user) user = await User.findOne({ role: 'faculty' });

  if (!user) {
    console.log("No user found");
    return;
  }

  const newOp = {
    title: "Test Opportunity",
    type: "Placement Drive",
    companyName: "Google",
    createdBy: user._id
  };

  if (["faculty", "hod"].includes(user.role) && user.department) {
    if (!newOp.eligibility) newOp.eligibility = {};
    newOp.eligibility.departments = [user.department];
    newOp.eligibility.branches = [user.department];
  }

  try {
    const op = await Opportunity.create(newOp);
    console.log("Success!", op);
  } catch (err) {
    console.log("Mongoose Error:", err.message);
  }
  mongoose.disconnect();
}
run();
