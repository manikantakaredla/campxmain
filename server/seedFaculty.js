const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { FacultyData } = require('./models/InstitutionalData');
require('dotenv').config();

async function seedFaculty() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("Password@123", salt);

        const faculties = [
            {
                empid: "FAC001",
                name: "Dr. Rajesh Kumar",
                email: "rajesh.k@adityauniversity.in",
                dept: "CSE",
                designation: "Professor",
                staff_role: "faculty"
            },
            {
                empid: "FAC002",
                name: "Dr. Anita Sharma",
                email: "anita.s@adityauniversity.in",
                dept: "ECE",
                designation: "Associate Professor",
                staff_role: "hod"
            }
        ];

        for (const fac of faculties) {
            // Delete existing if any to avoid duplicate errors
            await FacultyData.deleteOne({ empid: fac.empid });
            await User.deleteOne({ email: fac.email });

            // Create FacultyData
            await FacultyData.create({
                empid: fac.empid,
                name: fac.name,
                email: fac.email,
                dept: fac.dept,
                designation: fac.designation,
                staff_role: fac.staff_role,
                isRegistered: true,
                registeredAt: new Date()
            });

            // Create User
            await User.create({
                name: fac.name,
                email: fac.email,
                password: hashedPassword,
                role: fac.staff_role === 'hod' ? 'hod' : 'faculty',
                employeeId: fac.empid,
                department: fac.dept,
                designation: fac.designation,
                staffRole: fac.staff_role,
                isActive: true,
                isVerified: true,
                isRegistered: true
            });
            
            console.log(`Created User and FacultyData for ${fac.name} (${fac.empid})`);
        }

        console.log("Seeding complete. Passwords are set to: Password@123");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("Error seeding faculty:", error);
        process.exit(1);
    }
}

seedFaculty();
