const cron = require('node-cron');
const Opportunity = require('../models/Opportunity');
const ActivityLog = require('../models/ActivityLog');

const startOpportunityCron = () => {
  // Run every day at midnight server time
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running Opportunity Status Cron Job...');
      const opportunities = await Opportunity.find({ isDeleted: false, status: { $ne: 'Closed' } });
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to midnight for accurate date comparison

      for (let op of opportunities) {
        let originalStatus = op.status;
        
        // Check Deadline
        if (op.registrationDeadline) {
          const deadline = new Date(op.registrationDeadline);
          deadline.setHours(23, 59, 59, 999);
          
          if (now > deadline) {
            op.status = 'Closed';
          }
        }
        
        // If not closed by deadline, check event date
        if (op.status !== 'Closed' && op.eventDate) {
          const eventDate = new Date(op.eventDate);
          eventDate.setHours(0, 0, 0, 0);
          
          if (now.getTime() === eventDate.getTime()) {
            op.status = 'Ongoing';
          } else if (now < eventDate) {
            op.status = 'Upcoming';
          } else {
             // Event has passed. It might be closed.
             op.status = 'Closed';
          }
        }
        
        if (originalStatus !== op.status) {
          await op.save();
          // Log automation
          await ActivityLog.create({
            userId: null, // System Action
            action: `Opportunity Auto-Status changed to ${op.status}`,
            module: 'Opportunities',
            entityId: op._id
          });
        }
      }
      console.log('Opportunity Status Cron Job Completed.');
    } catch (error) {
      console.error('Error running Opportunity Cron Job:', error);
    }
  });
};

module.exports = startOpportunityCron;
