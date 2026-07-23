import React, { useState } from 'react'
import {
  Search,
  Filter,
  Users,
  MapPin,
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Upload,
  BookOpen,
  MessageSquare,
  Bot,
  ChevronRight,
  X,
  Plus,
  ArrowRight,
  Lightbulb,
  Video,
  Info
} from 'lucide-react'

// Mock Data
const MOCK_FACULTY = [
  {
    id: 1,
    name: 'Dr. Ramesh Kumar',
    designation: 'Professor & HOD',
    department: 'Computer Science',
    subjects: ['Compiler Design', 'Advanced Algorithms'],
    cabin: 'CSE Block • Cabin 204',
    status: 'Available',
    timeline: [
      { time: '09:00 - 10:00', title: 'DBMS Class' },
      { time: '10:00 - 11:00', title: 'Free' },
      { time: '11:00 - 12:00', title: 'AI Lab' },
      { time: '14:00 - 15:00', title: 'Project Review' }
    ],
    aiMatch: 92,
    aiReason: 'No scheduled class and low appointment load.',
    bestTime: '2:15 PM – 2:45 PM',
    photo: 'RK',
    researchAreas: ['Artificial Intelligence', 'Machine Learning'],
    avgResponse: '2 hours',
    rating: '4.8'
  },
  {
    id: 2,
    name: 'Prof. Anita Sharma',
    designation: 'Assistant Professor',
    department: 'Computer Science',
    subjects: ['Data Structures', 'Web Development'],
    cabin: 'CSE Block • Cabin 105',
    status: 'Meeting Students',
    timeline: [
      { time: '09:00 - 11:00', title: 'Web Dev Lab' },
      { time: '11:00 - 12:30', title: 'Free' },
      { time: '13:30 - 15:00', title: 'Mentoring' }
    ],
    aiMatch: 75,
    aiReason: 'Currently in a meeting, but free after lunch.',
    bestTime: '1:30 PM – 2:00 PM',
    photo: 'AS',
    researchAreas: ['Web Technologies', 'HCI'],
    avgResponse: '1 day',
    rating: '4.9'
  },
  {
    id: 3,
    name: 'Dr. Vikram Singh',
    designation: 'Associate Professor',
    department: 'Computer Science',
    subjects: ['Database Management', 'Cloud Computing'],
    cabin: 'CSE Block • Cabin 302',
    status: 'In Class',
    timeline: [
      { time: '09:00 - 11:30', title: 'Cloud Computing' },
      { time: '12:00 - 13:00', title: 'Free' }
    ],
    aiMatch: 40,
    aiReason: 'Busy in a long class session.',
    bestTime: 'Tomorrow 10:00 AM',
    photo: 'VS',
    researchAreas: ['Distributed Systems', 'Cloud Security'],
    avgResponse: '4 hours',
    rating: '4.5'
  },
{
  "id": 4,
  "name": "Dr. A Phani Sridhar",
  "designation": "HoD",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor, HoD Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 86,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AP",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "9491792022"
},
{
  "id": 5,
  "name": "Dr. K Chandra Sekhar",
  "designation": "Dy. HoD - I",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, HoD Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 99,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KC",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "9989178278"
},
{
  "id": 6,
  "name": "Dr. Hari Jyothula",
  "designation": "Dy. HoD - II",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "JWD First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 85,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "HJ",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9966998144"
},
{
  "id": 7,
  "name": "Dr. P Siva Satya Prasad",
  "designation": "Dy. HoD - III",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor, R & C 1",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 99,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "PS",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "8099452329"
},
{
  "id": 8,
  "name": "Dr. Nagaraju Katta",
  "designation": "Coursera Coordinator - V Semester",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 3, JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 86,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "NK",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "9989442311"
},
{
  "id": 9,
  "name": "M Kalyan Ram",
  "designation": "Coursera Coordinator - III Semester",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 99,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "MK",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "9959683117"
},
{
  "id": 10,
  "name": "Alla Devi Prasanthi",
  "designation": "Coursera",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 2, RB First Floor, SERVER ROOM",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 97,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AD",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "6302027178"
},
{
  "id": 11,
  "name": "Kavitapu Nagasivasankara Varaprasad",
  "designation": "LinkedIn Learning Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 3, RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 81,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KN",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "7898363337"
},
{
  "id": 12,
  "name": "Koneti Durga Bhavani",
  "designation": "Social Media / LinkedIn Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 81,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KD",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "7396607418"
},
{
  "id": 13,
  "name": "Nalla Siva Kumar",
  "designation": "Infosys Springboard & NPTEL Student Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 3, JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 83,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "NS",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9959686733"
},
{
  "id": 14,
  "name": "Anil Kumar Prathipati",
  "designation": "NPTEL / Infosys Springboard",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 2, JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 99,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AK",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "9299997794"
},
{
  "id": 15,
  "name": "Dr. Tirukoti Sudha Rani",
  "designation": "Google Cloud & SAP Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 83,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "TS",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9963742714"
},
{
  "id": 16,
  "name": "Dr. Appalaraju Grandhi",
  "designation": "Student Certifications Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 97,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AG",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "9059644613"
},
{
  "id": 17,
  "name": "Dr. Nagaraju Katta",
  "designation": "M.Tech Project Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 3, JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 82,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "NK",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "9989442311"
},
{
  "id": 18,
  "name": "Dr. S Ram Chandra Polisetty",
  "designation": "UG Project Coordinator - 1",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 86,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "SR",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "9949862634"
},
{
  "id": 19,
  "name": "Dr. Sindhu B",
  "designation": "UG Project Coordinator - 2",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 85,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "SB",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "9010283046"
},
{
  "id": 20,
  "name": "Dr. Abbireddy Sridhar Reddy",
  "designation": "UG Project Coordinator - 3",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 87,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AS",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "9010893336"
},
{
  "id": 21,
  "name": "Ponnada Latha Sree",
  "designation": "Internship Coordinator - III Semester",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 81,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "PL",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "7569807582"
},
{
  "id": 22,
  "name": "Surimalli Koteswara Rao",
  "designation": "Internships",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 6, RB Second Floor, SERVER ROOM",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 81,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "SK",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "8341541957"
},
{
  "id": 23,
  "name": "Motupalli Kiran Bhagavan",
  "designation": "Internship Coordinator - V Semester",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 5, RB First Floor, Room No. 102",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 91,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "MK",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9494412911"
},
{
  "id": 24,
  "name": "Ummidisetti Veera Ramesh",
  "designation": "Training and Placement Coordinator - 1",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 3, RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 94,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "UV",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "6303412651"
},
{
  "id": 25,
  "name": "Kaki Ashok Teja",
  "designation": "Training and Placement Coordinator - 2",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 4, RB Second Floor, SERVER ROOM",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 91,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KA",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "8074137179"
},
{
  "id": 26,
  "name": "Kagithapu Rajendra",
  "designation": "Overall Proctoring Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 1, RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 84,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KR",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "8008287177"
},
{
  "id": 27,
  "name": "Kagithapu Rajendra",
  "designation": "2nd Year Proctoring Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 1, RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 84,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KR",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "8008287177"
},
{
  "id": 28,
  "name": "Shaik Vahida",
  "designation": "3rd Year Proctoring Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 86,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "SV",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "9542478645"
},
{
  "id": 29,
  "name": "Dr. Appalaraju Grandhi",
  "designation": "Final Year Proctoring Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 94,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AG",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "9059644613"
},
{
  "id": 30,
  "name": "Dr. M V B Murali Krishna M",
  "designation": "Department Exam Cell - 1 (Overall)",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 92,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "MV",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "9949200996"
},
{
  "id": 31,
  "name": "B Satya Lakshmi",
  "designation": "Department Exam Cell - 2 (III Semester)",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 1, RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 90,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "BS",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "8179559055"
},
{
  "id": 32,
  "name": "Ravikumar Inakoti",
  "designation": "Department Exam Cell - 3 (V Semester)",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 97,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "RI",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "7989063182"
},
{
  "id": 33,
  "name": "Rananki Padma Sri",
  "designation": "Department Exam Cell - 4 (VII Semester & M.Tech)",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 4, RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 97,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "RP",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "9573880590"
},
{
  "id": 34,
  "name": "U P Kumar Chaturvedula",
  "designation": "Student Achievements Coordinators",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 2, RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 87,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "UP",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9494054363"
},
{
  "id": 35,
  "name": "Kolaparthi Sai Meenakshi",
  "designation": "Student Achievements",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 1, RB Second Floor, SERVER ROOM",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 89,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KS",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "6300919709"
},
{
  "id": 36,
  "name": "Rapaka Rahul",
  "designation": "Student Achievements",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 4, RB First Floor, Room No. 102",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 91,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "RR",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9182826298"
},
{
  "id": 37,
  "name": "Dr. Appawala Jayanthi",
  "designation": "PG Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 1, JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 87,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AJ",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "8886390660"
},
{
  "id": 38,
  "name": "Dr. Appawala Jayanthi",
  "designation": "CSI Student Chapter Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 1, JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 96,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AJ",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "8886390660"
},
{
  "id": 39,
  "name": "Kasichainula Vydehi",
  "designation": "Higher Education & Alumni Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 84,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KV",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "8790112092"
},
{
  "id": 40,
  "name": "Dr. Jalaiah Saikam",
  "designation": "Industrial Visits and ALA",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 94,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "JS",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "9502910792"
},
{
  "id": 41,
  "name": "Konala Padmavathi",
  "designation": "Industry Visit Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 1, JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 80,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KP",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "7093466940"
},
{
  "id": 42,
  "name": "Dodda Venkata Reddy",
  "designation": "SABL Coordinator - 1",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 93,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "DV",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9494089211"
},
{
  "id": 43,
  "name": "Chikkala Lova Lakshmi",
  "designation": "SABL Coordinator - 2",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 4, RB First Floor, SERVER ROOM",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 86,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "CL",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "9381797790"
},
{
  "id": 44,
  "name": "Dr. Vinjamuri Venkata Kamesh",
  "designation": "Time Table Incharge",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 1, RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 87,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "VV",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "9948566975"
},
{
  "id": 45,
  "name": "Arasada Rakesh",
  "designation": "Time Table Coordinator - 2",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 94,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "AR",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "8978478196"
},
{
  "id": 46,
  "name": "Gandhikota Umamahesh",
  "designation": "Overall Discipline Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "JWB First Floor, Staff Room",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 94,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "GU",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "6303412651"
},
{
  "id": 47,
  "name": "Jyothula Vidya",
  "designation": "NSS Program Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 83,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "JV",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "8143857336"
},
{
  "id": 48,
  "name": "Malakala Mani Ratnam",
  "designation": "Smart Interview Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 82,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "MM",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "8790439298"
},
{
  "id": 49,
  "name": "Rajendra Kumar Mahanta",
  "designation": "Grievance Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB Second Floor, Room No. 226",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 89,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "RK",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.8",
  "phoneNumber": "8895873809"
},
{
  "id": 50,
  "name": "Talluri Hari Babu",
  "designation": "Co-Curricular Activities Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 88,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "TH",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.5",
  "phoneNumber": "9100898100"
},
{
  "id": 51,
  "name": "Kalyana Chakravarthi G",
  "designation": "Workshop Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Cabin 2, RB First Floor, Room No. 119",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 91,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "KC",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.9",
  "phoneNumber": "6300355119"
},
{
  "id": 52,
  "name": "Boya Lingaiahgari Soma Naidu",
  "designation": "Extension Activities Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 7, RB First Floor, Room No. 102",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 89,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "BL",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.6",
  "phoneNumber": "9951407799"
},
{
  "id": 53,
  "name": "Nookala Jaya Pavani",
  "designation": "Re-registration & Summer Semester Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 2, RB Second Floor, SERVER ROOM",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 89,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "NJ",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "6304454954"
},
{
  "id": 54,
  "name": "J Lalu Prasad",
  "designation": "Admission Cell Coordinator",
  "department": "Computer Science",
  "subjects": [],
  "cabin": "Table 5, RB Second Floor, SERVER ROOM",
  "status": "Available",
  "timeline": [
    {
      "time": "10:00 - 12:00",
      "title": "Office Hours"
    }
  ],
  "aiMatch": 95,
  "aiReason": "Available in cabin based on timetable.",
  "bestTime": "Anytime today",
  "photo": "JL",
  "researchAreas": [],
  "avgResponse": "2 hours",
  "rating": "4.7",
  "phoneNumber": "7981891901"
}
]

const MOCK_REQUESTS = [
  { id: 1, title: 'Bonafide Certificate', status: 'Pending' },
  { id: 2, title: 'Project Approval', status: 'Approved' },
  { id: 3, title: 'Internship NOC', status: 'In Review' },
  { id: 4, title: 'Recommendation Letter', status: 'Rejected' },
  { id: 5, title: 'Fee Concession Approval', status: 'Pending' }
]

const getStatusColor = (status) => {
  switch (status) {
    case 'Available': return 'text-green-600 bg-green-50 border-green-200'
    case 'In Class': return 'text-red-600 bg-red-50 border-red-200'
    case 'Meeting Students': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'Office Hours': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'On Leave': return 'text-gray-600 bg-gray-50 border-gray-200'
    default: return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

const getRequestStatusColor = (status) => {
  switch (status) {
    case 'Approved': return 'text-green-700 bg-green-100'
    case 'Pending': return 'text-yellow-700 bg-yellow-100'
    case 'In Review': return 'text-blue-700 bg-blue-100'
    case 'Rejected': return 'text-red-700 bg-red-100'
    default: return 'text-gray-700 bg-gray-100'
  }
}

const StudentFacultyConnect = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Available Now')
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false)
  
  const filters = [
    'Available Now', 'Office Hours', 'AI Suggested', 
    'My Department', 'Project Guides', 'HODs'
  ]

  const handleBookClick = (faculty) => {
    setSelectedFaculty(faculty)
    setIsBookingModalOpen(true)
  }

  const handleProfileClick = (faculty) => {
    setSelectedFaculty(faculty)
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-12 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 relative z-20">
        
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Connect</h1>
          <button className="text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <Search size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-800 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty or department..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-[16px] text-sm font-semibold focus:outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 transition-all shadow-sm placeholder-gray-400"
          />
        </div>

        {/* Horizontal Pills Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
          <button
            onClick={() => setActiveFilter('All')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeFilter === 'All' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeFilter === filter ? 'bg-blue-100 text-blue-900' : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex flex-col space-y-4">

              {MOCK_FACULTY.map((faculty, idx) => {
                // Color palette for icons based on index
                const colors = [
                  'bg-purple-100 text-purple-700',
                  'bg-orange-100 text-orange-600',
                  'bg-blue-100 text-blue-700',
                  'bg-green-100 text-green-700'
                ];
                const iconColor = colors[idx % colors.length];
                
                return (
                  <div 
                    key={faculty.id} 
                    onClick={() => handleProfileClick(faculty)}
                    className="flex items-center gap-4 bg-white rounded-[20px] p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                  >
                    {/* Left Icon Block */}
                    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[14px] ${iconColor}`}>
                      <span className="font-extrabold text-sm">{faculty.photo}</span>
                    </div>
                    
                    {/* Middle Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-extrabold text-gray-900 truncate mb-0.5">
                        {faculty.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-500 truncate">
                        {faculty.designation}, {faculty.department}
                      </p>
                    </div>
                    
                    {/* Right Chevron */}
                    <div className="flex items-center gap-3">
                      <ChevronRight size={18} className="text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

      {/* Appointment Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-extrabold text-gray-900">Book Appointment</h3>
              <button onClick={() => setIsBookingModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 font-bold rounded-lg flex items-center justify-center">
                  {selectedFaculty?.photo}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{selectedFaculty?.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{selectedFaculty?.designation}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Purpose</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-gray-700">
                  <option>Doubt Clarification</option>
                  <option>Project Discussion</option>
                  <option>Signature</option>
                  <option>Internship Guidance</option>
                  <option>Recommendation Letter</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Date</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Time</label>
                  <input type="time" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-gray-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium text-gray-700 resize-none" placeholder="Add any details here..."></textarea>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button onClick={() => setIsBookingModalOpen(false)} className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Faculty Profile Drawer */}
      {selectedFaculty && !isBookingModalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm" onClick={() => setSelectedFaculty(null)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h3 className="text-lg font-extrabold text-gray-900">Faculty Profile</h3>
              <button onClick={() => setSelectedFaculty(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mx-auto flex items-center justify-center text-3xl font-black text-blue-700 shadow-sm mb-4 border-4 border-white outline outline-1 outline-gray-100">
                  {selectedFaculty.photo}
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">{selectedFaculty.name}</h2>
                <p className="text-sm font-semibold text-gray-500 mt-1">{selectedFaculty.designation}</p>
                <div className={`inline-flex px-3 py-1 mt-3 text-xs font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(selectedFaculty.status)}`}>
                  {selectedFaculty.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                  <p className="text-2xl font-black text-gray-900">{selectedFaculty.rating}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">Student Rating</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                  <p className="text-lg font-black text-gray-900 pt-1">{selectedFaculty.avgResponse}</p>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-1.5">Avg Response</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Info</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <BookOpen size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Department</p>
                      <p className="text-sm font-medium text-gray-500">{selectedFaculty.department}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Cabin</p>
                      <p className="text-sm font-medium text-gray-500">{selectedFaculty.cabin}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Research Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFaculty.researchAreas.map(area => (
                    <span key={area} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button 
                onClick={() => {
                  setSelectedFaculty(null)
                  handleBookClick(selectedFaculty)
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </>
      )}

      {/* AI Assistant FAB */}
      <div className="fixed bottom-8 right-8 z-30 group">
        <div className={`absolute bottom-full right-0 mb-4 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 transition-all duration-300 origin-bottom-right ${isAiAssistantOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-extrabold text-gray-900 flex items-center gap-2 text-sm">
              <Bot className="text-blue-500" size={18} /> Campus AI
            </h4>
            <button onClick={() => setIsAiAssistantOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 mb-3 text-sm text-gray-600 border border-gray-100">
            Hi! I can help you find faculty or book appointments. Try asking:
            <ul className="mt-2 space-y-1 font-medium text-blue-600 text-xs">
              <li className="cursor-pointer hover:underline">"When is Dr. Ramesh free?"</li>
              <li className="cursor-pointer hover:underline">"Find DBMS faculty."</li>
            </ul>
          </div>
          <div className="relative">
            <input type="text" placeholder="Ask anything..." className="w-full pr-10 pl-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600"><ArrowRight size={16} /></button>
          </div>
        </div>
        <button 
          onClick={() => setIsAiAssistantOpen(!isAiAssistantOpen)}
          className="w-14 h-14 bg-gray-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-black transition-all"
        >
          {isAiAssistantOpen ? <X size={24} /> : <Bot size={24} />}
        </button>
      </div>

    </div>
  )
}

export default StudentFacultyConnect
