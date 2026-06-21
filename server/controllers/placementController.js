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
        { role: { $regex: search, $options: 'i' } },
        { linkedinUrl: { $regex: search, $options: 'i' } }
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
        'Student Name': 'SINGIDI DEVI DEEPIKA',
        'Roll Number': '23A91A05J1',
        'Company': 'VISA',
        'Package': 12.5,
        'Job Role': 'SDE',
        'Placement Date': '2025-08-15',
        'LinkedIn URL': 'https://www.linkedin.com/in/deepika'
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

    const getField = (row, camelName, spaceName) => {
      if (row[camelName] !== undefined) return row[camelName];
      if (row[spaceName] !== undefined) return row[spaceName];
      for (let key in row) {
        const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanKey === camelName.toLowerCase() || cleanKey === spaceName.toLowerCase().replace(/[^a-z0-9]/g, '')) {
          return row[key];
        }
      }
      return undefined;
    };

    const validateLinkedInUrl = (url) => {
      if (!url) return true;
      const regex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\/|\?|$)/i;
      return regex.test(url);
    };

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Accounting for header

      try {
        const companyName = getField(row, 'companyName', 'Company');
        let pkg = getField(row, 'package', 'Package');
        const rollNumber = getField(row, 'rollNumber', 'Roll Number');
        const studentName = getField(row, 'studentName', 'Student Name');
        const role = getField(row, 'role', 'Job Role');
        const gender = getField(row, 'gender', 'Gender');
        const college = getField(row, 'college', 'College');
        const mobileNumber = getField(row, 'mobileNumber', 'Mobile Number');
        const email = getField(row, 'email', 'Email');
        const department = getField(row, 'department', 'Department');
        const batch = getField(row, 'batch', 'Batch');
        const offerType = getField(row, 'offerType', 'Offer Type') || 'Placement';
        const offerStatus = getField(row, 'offerStatus', 'Offer Status') || 'Selected';
        const linkedinUrl = getField(row, 'linkedinUrl', 'LinkedIn URL');

        // Validate required fields
        if (!companyName || !pkg || !rollNumber || !studentName) {
          throw new Error('Missing required fields (Company, Package, Roll Number, Student Name)');
        }

        // Validate package
        pkg = Number(pkg);
        if (isNaN(pkg)) {
          throw new Error('Package must be a valid number');
        }
        
        // Validate offerType
        const validOffers = ['Placement', 'Internship', 'PPO'];
        if (!validOffers.includes(offerType)) {
          throw new Error(`Invalid offerType. Must be one of: ${validOffers.join(', ')}`);
        }

        // Validate LinkedIn URL
        if (linkedinUrl && !validateLinkedInUrl(linkedinUrl)) {
          throw new Error('Invalid LinkedIn URL format');
        }

        // Parse date and placementYear
        let offerDate = null;
        let placementYear = null;
        const rawOfferDate = getField(row, 'offerDate', 'Placement Date');
        if (rawOfferDate) {
          if (typeof rawOfferDate === 'number') {
            offerDate = new Date((rawOfferDate - (25567 + 2)) * 86400 * 1000);
          } else {
            offerDate = new Date(rawOfferDate);
          }
          if (!isNaN(offerDate.getTime())) {
            placementYear = offerDate.getFullYear();
          } else {
            offerDate = null;
          }
        }

        const explicitYear = getField(row, 'placementYear', 'Placement Year');
        if (explicitYear) {
          placementYear = Number(explicitYear);
        } else if (!placementYear) {
          placementYear = new Date().getFullYear();
        }

        // Auto-link studentId
        let studentId = null;
        const student = await User.findOne({ rollNumber: new RegExp(`^${rollNumber}$`, 'i') });
        if (student) {
          studentId = student._id;
        }

        // Detect duplicate
        const existing = await PlacementRecord.findOne({
          rollNumber: new RegExp(`^${rollNumber}$`, 'i'),
          companyName: new RegExp(`^${companyName}$`, 'i'),
          role: new RegExp(`^${role || ''}$`, 'i'),
          package: pkg
        });

        if (existing) {
          throw new Error(`Duplicate record: ${rollNumber} for ${companyName} (${role || 'N/A'}) at ${pkg} LPA`);
        }

        // Insert
        await PlacementRecord.create({
          companyName,
          package: pkg,
          rollNumber,
          studentName,
          studentId,
          gender,
          college,
          mobileNumber,
          email,
          role,
          placementYear,
          department,
          batch,
          offerType,
          offerStatus,
          offerDate,
          linkedinUrl: linkedinUrl || null,
          uploadedBy: req.user.id || req.userId
        });

        successRecords++;
      } catch (err) {
        failedRecords++;
        errors.push({
          row: rowNum,
          rollNumber: getField(row, 'rollNumber', 'Roll Number') || 'N/A',
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
      errors,
      summary: {
        totalRecords: data.length,
        successRecords,
        failedRecords,
        errors
      }
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

const { validationResult } = require('express-validator');

exports.createPlacement = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      companyName,
      package: pkg,
      rollNumber,
      studentName,
      gender,
      college,
      mobileNumber,
      email,
      role,
      placementYear,
      department,
      batch,
      offerType,
      offerStatus,
      offerDate,
      linkedinUrl
    } = req.body;

    // Auto-link studentId
    let studentId = null;
    const student = await User.findOne({ rollNumber: new RegExp(`^${rollNumber}$`, 'i') });
    if (student) {
      studentId = student._id;
    }

    // Detect duplicate
    const existing = await PlacementRecord.findOne({
      rollNumber: new RegExp(`^${rollNumber}$`, 'i'),
      companyName: new RegExp(`^${companyName}$`, 'i'),
      role: new RegExp(`^${role || ''}$`, 'i'),
      package: pkg
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Duplicate placement record already exists.' });
    }

    const placement = await PlacementRecord.create({
      companyName,
      package: pkg,
      rollNumber,
      studentName,
      studentId,
      gender,
      college,
      mobileNumber,
      email,
      role,
      placementYear,
      department,
      batch,
      offerType,
      offerStatus: offerStatus || 'Selected',
      offerDate,
      linkedinUrl: linkedinUrl || null,
      uploadedBy: req.user.id || req.userId
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id || req.userId,
      action: 'Created Placement Record',
      module: 'Placements',
      metadata: { studentName, companyName, rollNumber }
    });

    res.status(201).json({ success: true, data: placement });
  } catch (error) {
    next(error);
  }
};

exports.updatePlacement = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let placement = await PlacementRecord.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement record not found.' });
    }

    const {
      companyName,
      package: pkg,
      rollNumber,
      studentName,
      gender,
      college,
      mobileNumber,
      email,
      role,
      placementYear,
      department,
      batch,
      offerType,
      offerStatus,
      offerDate,
      linkedinUrl
    } = req.body;

    // If key fields changed, check for duplicate
    if (
      rollNumber !== placement.rollNumber ||
      companyName !== placement.companyName ||
      role !== placement.role ||
      pkg !== placement.package
    ) {
      const existing = await PlacementRecord.findOne({
        _id: { $ne: req.params.id },
        rollNumber: new RegExp(`^${rollNumber}$`, 'i'),
        companyName: new RegExp(`^${companyName}$`, 'i'),
        role: new RegExp(`^${role || ''}$`, 'i'),
        package: pkg
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Another matching duplicate placement record already exists.' });
      }
    }

    // Resolve studentId
    let studentId = placement.studentId;
    if (rollNumber !== placement.rollNumber) {
      const student = await User.findOne({ rollNumber: new RegExp(`^${rollNumber}$`, 'i') });
      studentId = student ? student._id : null;
    }

    placement.companyName = companyName;
    placement.package = pkg;
    placement.rollNumber = rollNumber;
    placement.studentName = studentName;
    placement.studentId = studentId;
    placement.gender = gender;
    placement.college = college;
    placement.mobileNumber = mobileNumber;
    placement.email = email;
    placement.role = role;
    placement.placementYear = placementYear;
    placement.department = department;
    placement.batch = batch;
    placement.offerType = offerType;
    placement.offerStatus = offerStatus;
    placement.offerDate = offerDate;
    placement.linkedinUrl = linkedinUrl || null;

    await placement.save();

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id || req.userId,
      action: 'Updated Placement Record',
      module: 'Placements',
      metadata: { studentName, companyName, rollNumber }
    });

    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    next(error);
  }
};

exports.deletePlacement = async (req, res, next) => {
  try {
    const placement = await PlacementRecord.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement record not found.' });
    }

    await PlacementRecord.findByIdAndDelete(req.params.id);

    // Log Activity
    await ActivityLog.create({
      userId: req.user.id || req.userId,
      action: 'Deleted Placement Record',
      module: 'Placements',
      metadata: { studentName: placement.studentName, companyName: placement.companyName, rollNumber: placement.rollNumber }
    });

    res.status(200).json({ success: true, message: 'Placement record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
