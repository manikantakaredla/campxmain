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
] [
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
      
      {/* Top Header & Smart Search */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                <Users className="text-blue-600" size={28} />
                Smart Faculty Connect
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                Find faculty availability, book appointments, and submit requests seamlessly.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors flex items-center gap-2 shadow-sm">
                <Calendar size={18} />
                My Appointments
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96 flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Search faculty, subject, department..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-gray-50/50 text-gray-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex-1 w-full overflow-x-auto pb-2 scrollbar-hide flex gap-2 min-w-max items-center">
              <Filter className="text-gray-400 mr-2" size={18} />
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                    activeFilter === filter 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Smart Insights */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex-shrink-0 bg-blue-50/50 border border-blue-100 rounded-[20px] p-4 flex items-center gap-3 w-80">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><Lightbulb size={20} /></div>
                <p className="text-sm font-medium text-blue-900 leading-tight">You and Dr. Rao are both free between 3:00–3:30 PM today.</p>
              </div>
              <div className="flex-shrink-0 bg-purple-50/50 border border-purple-100 rounded-[20px] p-4 flex items-center gap-3 w-80">
                <div className="p-2 bg-purple-100 rounded-xl text-purple-600"><Clock size={20} /></div>
                <p className="text-sm font-medium text-purple-900 leading-tight">Project approvals typically take less than 24 hours.</p>
              </div>
            </div>

            {/* Virtual Queue Widget */}
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                    <Users className="text-indigo-500" size={20} />
                    Virtual Queue
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">Currently waiting for Prof. Anita Sharma</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-indigo-600">12 Min</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Estimated Wait</p>
                </div>
              </div>
              
              <div className="relative pt-2 mb-8">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 px-1">
                  <span>In Session</span>
                  <span>Next</span>
                  <span className="text-indigo-600">You (3rd)</span>
                  <span>4th</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 w-[60%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl transition-colors border border-red-100">
                  Leave Queue
                </button>
                <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl transition-colors border border-gray-200">
                  Join Another
                </button>
              </div>
            </div>

            {/* Faculty Cards */}
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-4">Recommended Faculty</h2>
              <div className="space-y-6">
                {MOCK_FACULTY.map(faculty => (
                  <div key={faculty.id} className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      
                      {/* Left: Info */}
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-200 shrink-0 shadow-sm">
                          <span className="text-xl font-black text-blue-700">{faculty.photo}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900">{faculty.name}</h3>
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${getStatusColor(faculty.status)}`}>
                              {faculty.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-gray-600">{faculty.designation} • {faculty.department}</p>
                          <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-gray-500">
                            <MapPin size={14} className="text-gray-400" />
                            {faculty.cabin}
                          </div>
                          {faculty.phoneNumber && (
                            <div className="flex items-center gap-1.5 mt-1 text-sm font-medium text-gray-500">
                              <Phone size={14} className="text-gray-400" />
                              {faculty.phoneNumber}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {faculty.subjects.map(sub => (
                              <span key={sub} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: AI Match & Actions */}
                      <div className="sm:text-right flex flex-col items-start sm:items-end justify-between min-w-[200px]">
                        <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-left w-full sm:w-auto">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-green-700 uppercase">Best Time</span>
                            <span className="text-xs font-black text-green-600">{faculty.aiMatch}% Match</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{faculty.bestTime}</p>
                          <p className="text-[11px] text-gray-500 mt-1 font-medium">{faculty.aiReason}</p>
                        </div>
                        <div className="flex gap-2 mt-4 w-full">
                          <button 
                            onClick={() => handleProfileClick(faculty)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                          >
                            Profile
                          </button>
                          <button 
                            onClick={() => handleBookClick(faculty)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-blue-600/20"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3">Today's Timeline</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {faculty.timeline.map((slot, idx) => (
                          <div key={idx} className={`flex-shrink-0 px-3 py-2 rounded-xl border ${slot.title === 'Free' ? 'bg-green-50/50 border-green-100' : 'bg-gray-50 border-gray-200'}`}>
                            <p className="text-xs font-bold text-gray-900">{slot.time}</p>
                            <p className={`text-xs font-medium ${slot.title === 'Free' ? 'text-green-600' : 'text-gray-500'}`}>{slot.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Digital Requests Grid */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-lg font-extrabold text-gray-900">Digital Requests</h2>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MOCK_REQUESTS.map(req => (
                  <div key={req.id} className="bg-white rounded-[20px] p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 group hover:shadow-lg transition-all duration-300">
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><FileText size={20} /></div>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRequestStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-4">{req.title}</h3>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-1.5">
                        <Upload size={14} /> Upload
                      </button>
                      <button className="flex-1 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-lg transition-colors shadow-sm">
                        Submit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>

          {/* Right Sidebar Widgets */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={18} />
                Available Right Now
              </h3>
              <div className="space-y-4">
                {MOCK_FACULTY.filter(f => f.status === 'Available' || f.status === 'Office Hours').map(f => (
                  <div key={f.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">{f.photo}</div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{f.name}</p>
                        <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{f.cabin}</p>
                      </div>
                    </div>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[20px] p-6 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Calendar size={80} /></div>
              <h3 className="text-base font-extrabold mb-2 relative z-10">Upcoming Appointment</h3>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 relative z-10 mt-4">
                <p className="text-sm font-bold text-blue-100 mb-1">Today, 2:30 PM</p>
                <p className="text-base font-extrabold text-white">Dr. Ramesh Kumar</p>
                <p className="text-xs text-blue-200 mt-1">Project Review • Cabin 204</p>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-white text-blue-700 font-bold py-2 rounded-lg text-xs hover:bg-blue-50 transition-colors">Reschedule</button>
                  <button className="flex-1 bg-white/10 text-white font-bold py-2 rounded-lg text-xs hover:bg-white/20 transition-colors">Cancel</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="text-purple-500" size={18} />
                Faculty Announcements
              </h3>
              <div className="space-y-4">
                <div className="border-l-2 border-purple-400 pl-3">
                  <p className="font-bold text-sm text-gray-900 leading-tight">Project submission deadline extended to Friday.</p>
                  <p className="text-[11px] font-semibold text-gray-500 mt-1">Dr. Ramesh Kumar • 2 hours ago</p>
                </div>
                <div className="border-l-2 border-gray-300 pl-3">
                  <p className="font-bold text-sm text-gray-900 leading-tight">No lab session today due to maintenance.</p>
                  <p className="text-[11px] font-semibold text-gray-500 mt-1">Prof. Anita Sharma • Yesterday</p>
                </div>
              </div>
            </div>

          </div>
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
