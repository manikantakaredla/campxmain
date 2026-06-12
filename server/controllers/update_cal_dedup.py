file = r'c:\Users\manik\Music\campx final\server\controllers\announcementController.js'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

cal_old = """    const activity = await AcademicActivity.create({
      title: announcement.title,
      description: announcement.description,
      type: activityType,
      startDate: eventStartDate,
      endDate: announcement.expiryDate || null,
      venue: announcement.eventVenue || announcement.location || null,
      status: "upcoming",
      createdBy: announcement.createdBy,
      sourceAnnouncementId: announcement._id
    });

    // Mark announcement as having calendar event created
    announcement.calendarEventCreated = true;
    await announcement.save();

    console.log(`✅ Calendar event created for announcement: ${announcement.title}`);
    return activity;"""

cal_new = """    // Check for deduplication
    const existingActivity = await AcademicActivity.findOne({
      title: announcement.title,
      description: announcement.description,
      startDate: eventStartDate
    });

    let activity = existingActivity;

    if (!existingActivity) {
      activity = await AcademicActivity.create({
        title: announcement.title,
        description: announcement.description,
        type: activityType,
        startDate: eventStartDate,
        endDate: announcement.expiryDate || null,
        venue: announcement.eventVenue || announcement.location || null,
        status: "upcoming",
        createdBy: announcement.createdBy,
        sourceAnnouncementId: announcement._id
      });
      console.log(`✅ Calendar event created for announcement: ${announcement.title}`);
    } else {
      console.log(`⚠️ Duplicate calendar event detected, skipping creation for: ${announcement.title}`);
    }

    // Mark announcement as having calendar event created
    announcement.calendarEventCreated = true;
    await announcement.save();

    return activity;"""

content = content.replace(cal_old, cal_new)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated deduplication logic')
