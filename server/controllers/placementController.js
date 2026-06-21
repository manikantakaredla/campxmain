const PlacementRecord = require('../models/PlacementRecord');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

exports.getPlacements = async (req, res, next) => {
  try {
    const { companyName, year, department, search, sort, offerType, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (companyName) query.companyName = companyName;
    if (year) query.placementYear = Number(year);
    if (department) query.department = department;
    if (offerType) query.offerType = offerType;
    
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }
    
    let sortQuery = { package: -1 };
    if (sort === 'highest') sortQuery = { package: -1 };
    else if (sort === 'lowest') sortQuery = { package: 1 };
    else if (sort === 'latest') sortQuery = { placementYear: -1 };
    else if (sort === 'oldest') sortQuery = { placementYear: 1 };
    else if (sort === 'companyAsc') sortQuery = { companyName: 1 };
    else if (sort === 'companyDesc') sortQuery = { companyName: -1 };

    const startIndex = (page - 1) * limit;
    const total = await PlacementRecord.countDocuments(query);
    
    const placements = await PlacementRecord.find(query)
      .sort(sortQuery)
      .skip(startIndex)
      .limit(Number(limit))
      .populate('studentId', 'profilePicture email')
      .lean();
      
    res.status(200).json({
      success: true,
      count: placements.length,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      data: placements
    });
  } catch (error) {
    next(error);
  }
};

exports.getPlacementStatistics = async (req, res, next) => {
  try {
    // Basic aggregation for Highest, Average, Total, Department Wise, Top Recruiters
    const stats = await PlacementRecord.aggregate([
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                highestPackage: { $max: "$package" },
                averagePackage: { $avg: "$package" },
                totalPlacements: { $sum: 1 },
                companiesCount: { $addToSet: "$companyName" },
                packages: { $push: "$package" }
              }
            }
          ],
          departments: [
            {
              $group: {
                _id: "$department",
                count: { $sum: 1 }
              }
            }
          ],
          topRecruiters: [
            {
              $group: {
                _id: "$companyName",
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
          ]
        }
      }
    ]);

    if (!stats[0].overall.length) {
      return res.status(200).json({ success: true, data: null });
    }

    const overall = stats[0].overall[0];
    
    // Calculate Median Package
    overall.packages.sort((a, b) => a - b);
    let medianPackage = 0;
    const len = overall.packages.length;
    if (len > 0) {
      if (len % 2 === 0) {
        medianPackage = (overall.packages[len / 2 - 1] + overall.packages[len / 2]) / 2;
      } else {
        medianPackage = overall.packages[Math.floor(len / 2)];
      }
    }

    // Dummy Placement % since we don't know total students in DB easily here without a separate query
    // In a real scenario, count Users where role=student & currentYear=4
    const totalFinalYearStudents = await User.countDocuments({ role: 'student', currentYear: 4 });
    let placementPercentage = 0;
    if (totalFinalYearStudents > 0) {
       placementPercentage = (overall.totalPlacements / totalFinalYearStudents) * 100;
    }

    res.status(200).json({
      success: true,
      data: {
        highestPackage: overall.highestPackage,
        averagePackage: Number(overall.averagePackage.toFixed(2)),
        medianPackage: Number(medianPackage.toFixed(2)),
        totalPlacements: overall.totalPlacements,
        placementPercentage: Number(placementPercentage.toFixed(2)),
        companiesCount: overall.companiesCount.length,
        departmentWise: stats[0].departments,
        topRecruiters: stats[0].topRecruiters
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSalaryTrends = async (req, res, next) => {
  try {
    const trends = await PlacementRecord.aggregate([
      {
        $group: {
          _id: "$placementYear",
          averagePackage: { $avg: "$package" },
          highestPackage: { $max: "$package" },
          totalOffers: { $sum: 1 },
          packages: { $push: "$package" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const formattedTrends = trends.map(t => {
      t.packages.sort((a, b) => a - b);
      let median = 0;
      if (t.packages.length % 2 === 0) {
        median = (t.packages[t.packages.length / 2 - 1] + t.packages[t.packages.length / 2]) / 2;
      } else {
        median = t.packages[Math.floor(t.packages.length / 2)];
      }
      return {
        year: t._id,
        averagePackage: Number(t.averagePackage.toFixed(2)),
        highestPackage: t.highestPackage,
        medianPackage: Number(median.toFixed(2)),
        totalOffers: t.totalOffers
      };
    });
    
    res.status(200).json({ success: true, data: formattedTrends });
  } catch (error) {
    next(error);
  }
};

exports.downloadTemplate = (req, res, next) => {
  try {
    const templateData = [
      {
        companyName: 'VISA',
        package: 12.5,
        rollNumber: '23A91A05J1',
        studentName: 'SINGIDI DEVI DEEPIKA',
        gender: 'Female',
        college: 'AEC',
        mobileNumber: '7893995480',
        email: '23A91A05J1@aec.edu.in',
        role: 'SDE',
        placementYear: 2026,
        department: 'CSE',
        batch: '2022-2026',
        offerType: 'Placement',
        offerStatus: 'Selected',
        offerDate: '2025-08-15'
      }
    ];

    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Placements Template");
    
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', 'attachment; filename="placement_upload_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

exports.uploadPlacements = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV or XLSX file' });
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let successRecords = 0;
    let failedRecords = 0;
    let errors = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Accounting for header

      try {
        // Validate required fields
        if (!row.companyName || !row.package || !row.rollNumber || !row.studentName || !row.placementYear || !row.offerType) {
          throw new Error('Missing required fields (companyName, package, rollNumber, studentName, placementYear, offerType)');
        }

        // Validate package
        row.package = Number(row.package);
        if (isNaN(row.package)) {
          throw new Error('Package must be a valid number');
        }
        
        // Validate offerType
        const validOffers = ['Placement', 'Internship', 'PPO'];
        if (!validOffers.includes(row.offerType)) {
          throw new Error(`Invalid offerType. Must be one of: ${validOffers.join(', ')}`);
        }

        // Auto-link studentId
        let studentId = null;
        const student = await User.findOne({ rollNumber: new RegExp(`^${row.rollNumber}$`, 'i') });
        if (student) {
          studentId = student._id;
        }

        // Detect duplicate
        const existing = await PlacementRecord.findOne({
          rollNumber: new RegExp(`^${row.rollNumber}$`, 'i'),
          companyName: new RegExp(`^${row.companyName}$`, 'i'),
          role: new RegExp(`^${row.role}$`, 'i'),
          package: row.package
        });

        if (existing) {
          throw new Error(`Duplicate record: ${row.rollNumber} for ${row.companyName} (${row.role}) at ${row.package} LPA`);
        }

        // Insert
        await PlacementRecord.create({
          companyName: row.companyName,
          package: row.package,
          rollNumber: row.rollNumber,
          studentName: row.studentName,
          studentId,
          gender: row.gender,
          college: row.college,
          mobileNumber: row.mobileNumber,
          email: row.email,
          role: row.role,
          placementYear: row.placementYear,
          department: row.department,
          batch: row.batch,
          offerType: row.offerType,
          offerStatus: row.offerStatus || 'Selected',
          offerDate: row.offerDate,
          uploadedBy: req.user.id || req.userId
        });

        successRecords++;
      } catch (err) {
        failedRecords++;
        errors.push({
          row: rowNum,
          rollNumber: row.rollNumber,
          error: err.message
        });
      }
    }

    // Cleanup file
    fs.unlinkSync(filePath);

    // Audit Log
    await ActivityLog.create({
      userId: req.user.id || req.userId,
      action: 'Uploaded Placement Records',
      module: 'Placements',
      metadata: { total: data.length, success: successRecords, failed: failedRecords }
    });

    res.status(200).json({
      success: true,
      totalRecords: data.length,
      successRecords,
      failedRecords,
      errors
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
