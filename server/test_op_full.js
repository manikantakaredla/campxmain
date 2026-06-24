const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/campx');
  const Opportunity = require('./models/Opportunity');
  const Announcement = require('./models/Announcement');
  const AcademicActivity = require('./models/AcademicActivity');
  const User = require('./models/User');

  let user = await User.findOne({ role: 'admin' });
  if (!user) {
    console.log("No user found");
    return;
  }

  const reqBody = {
    title: "Test Opportunity",
    type: "Placement Drive",
    companyName: "Google",
    description: "Test description",
    eventDate: new Date()
  };

  try {
    const newOp = { ...reqBody, createdBy: user._id };
    
    // Enforce faculty/HOD restrictions
    if (["faculty", "hod"].includes(user.role) && user.department) {
      if (!newOp.eligibility) newOp.eligibility = {};
      newOp.eligibility.departments = [user.department];
      newOp.eligibility.branches = [user.department];
    }
    
    console.log("Creating Opportunity...");
    const opportunity = await Opportunity.create(newOp);
    console.log("Created Opportunity:", opportunity._id);
    
    // 1. Create Calendar Event
    if (opportunity.eventDate) {
      console.log("Creating Calendar Event...");
      const calendarEvent = await AcademicActivity.create({
        title: opportunity.title,
        description: opportunity.description,
        type: "Placement Drive",
        startDate: opportunity.eventDate,
        endDate: opportunity.eventDate,
        venue: opportunity.location || "TBD",
        status: "upcoming",
        createdBy: user._id,
        inheritedAudience: { audienceType: opportunity.visibility === 'Public' ? 'all' : 'students' }
      });
      opportunity.calendarEventId = calendarEvent._id;
    }
    
    // 2. Create Announcement
    if (!opportunity.announcementGenerated) {
      console.log("Creating Announcement...");
      const announcement = await Announcement.create({
        title: `New Opportunity: ${opportunity.title} at ${opportunity.companyName}`,
        description: opportunity.description || `A new ${opportunity.type} has been posted.`,
        type: "placement",
        priority: opportunity.priority === 'Critical' ? 'urgent' : 'medium',
        audience: "students",
        createdBy: user._id,
        eventDate: opportunity.eventDate,
        registrationDeadline: opportunity.registrationDeadline
      });
      opportunity.announcementId = announcement._id;
      opportunity.announcementGenerated = true;
    }
    
    await opportunity.save();
    console.log("Success!");

  } catch (err) {
    console.log("Mongoose Error:", err);
  }
  mongoose.disconnect();
}
run();
