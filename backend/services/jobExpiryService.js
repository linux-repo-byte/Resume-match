const Job = require('../models/Job');

const expireJobs = async () => {
  await Job.updateMany(
    { status: 'open', expiresAt: { $lte: new Date() } },
    { $set: { status: 'expired' } }
  );
};

module.exports = { expireJobs };
