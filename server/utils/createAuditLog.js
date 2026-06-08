const AuditLog =
require("../models/AuditLog");

const createAuditLog =
async (
  userId,
  action,
  module,
  details
) => {

  await AuditLog.create({

    user: userId,

    action,

    module,

    details

  });

};

module.exports =
createAuditLog;