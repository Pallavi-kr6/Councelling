const mongoose = require("mongoose");
const Counsellor = require("./models/counsellor"); // adjust path if needed
const connectDB = require("./config/db");
const sampleCounsellors = [

  
  {
    "name": "Dr. Aarav Sharma",
    "email": "aarav.sharma@example.com",
      "password": "123456", 
    
    "qualifications": "PhD Psychology",
    "specialization": "stress",
    "slots": ["09:00", "11:00", "14:00"]
  },
  {
    "name": "Ms. Ananya Rao",
    "email": "ananya.rao@example.com",
      "password": "123456", 
    "qualifications": "MA Counseling",
    "specialization": "academics",
    "slots": ["10:00", "13:00", "15:00"]
  },
  {
    "name": "Mr. Rohan Verma",
    "email": "rohan.verma@example.com",
      "password": "123456", 
    "qualifications": "MSc Clinical Psychology",
    "specialization": "career",
    "slots": ["09:30", "12:00", "16:00"]
  },
  {
    "name": "Dr. Sneha Iyer",
    "email": "sneha.iyer@example.com",
      "password": "123456", 
    "qualifications": "PhD Counseling Psychology",
    "specialization": "relationships",
    "slots": ["10:00", "11:30", "14:30"]
  },
  {
    "name": "Mr. Karthik Menon",
    "email": "karthik.menon@example.com",
      "password": "123456", 
    "qualifications": "MA Counseling",
    "specialization": "stress",
    "slots": ["09:00", "12:00", "15:00"]
  },
  {
    "name": "Ms. Priya Nair",
    "email": "priya.nair@example.com",
      "password": "123456", 
    "qualifications": "MSc Psychology",
    "specialization": "academics",
    "slots": ["10:00", "13:00", "16:00"]
  },
  {
    "name": "Dr. Arjun Gupta",
    "email": "arjun.gupta@example.com",
      "password": "123456", 
    "qualifications": "PhD Clinical Psychology",
    "specialization": "career",
    "slots": ["09:30", "12:30", "15:30"]
  },
  {
    "name": "Ms. Kavya Reddy",
    "email": "kavya.reddy@example.com",
      "password": "123456", 
    "qualifications": "MA Counseling",
    "specialization": "relationships",
    "slots": ["10:00", "11:00", "14:00"]
  },
  {
    "name": "Mr. Aditya Singh",
    "email": "aditya.singh@example.com",
      "password": "123456", 
    "qualifications": "MSc Psychology",
    "specialization": "stress",
    "slots": ["09:00", "11:30", "15:00"]
  },
  {
    "name": "Dr. Meera Joshi",
    "email": "meera.joshi@example.com",
      "password": "123456", 
    "qualifications": "PhD Counseling",
    "specialization": "academics",
    "slots": ["10:30", "12:30", "14:30"]
  },
  {
    "name": "Ms. Anika Sharma",
    "email": "anika.sharma@example.com",
      "password": "123456", 
    "qualifications": "MA Counseling",
    "specialization": "career",
    "slots": ["09:00", "13:00", "16:00"]
  },
  {
    "name": "Mr. Varun Kapoor",
    "email": "varun.kapoor@example.com",
      "password": "123456", 
    "qualifications": "MSc Clinical Psychology",
    "specialization": "relationships",
    "slots": ["10:00", "12:00", "15:00"]
  },
  {
    "name": "Dr. Nisha Rao",
    "email": "nisha.rao@example.com",
      "password": "123456", 
    "qualifications": "PhD Psychology",
    "specialization": "stress",
    "slots": ["09:00", "11:00", "14:00"]
  },
  {
    "name": "Ms. Ritu Verma",
    "email": "ritu.verma@example.com",
      "password": "123456", 
    "qualifications": "MA Counseling",
    "specialization": "academics",
    "slots": ["10:00", "13:00", "15:00"]
  },
  {
    "name": "Mr. Akash Jain",
    "email": "akash.jain@example.com",
      "password": "123456", 
    "qualifications": "MSc Psychology",
    "specialization": "career",
    "slots": ["09:30", "12:00", "16:00"]
  },
  {
    "name": "Dr. Snehal Patil",
    "email": "snehal.patil@example.com",
      "password": "123456", 
    "qualifications": "PhD Counseling Psychology",
    "specialization": "relationships",
    "slots": ["10:00", "11:30", "14:30"]
  },
  {
    "name": "Ms. Ishita Kapoor",
    "email": "ishita.kapoor@example.com",
      "password": "123456", 
    "qualifications": "MA Counseling",
    "specialization": "stress",
    "slots": ["09:00", "12:00", "15:00"]
  },
  {
    "name": "Mr. Dev Malhotra",
    "email": "dev.malhotra@example.com",
      "password": "123456", 
    "qualifications": "MSc Psychology",
    "specialization": "academics",
    "slots": ["10:00", "13:00", "16:00"]
  },
  {
    "name": "Dr. Priyanka Desai",
    "email": "priyanka.desai@example.com",
      "password": "123456", 
    "qualifications": "PhD Clinical Psychology",
    "specialization": "career",
    "slots": ["09:30", "12:30", "15:30"]
  },
  {
    "name": "Ms. Tanya Mehta",
    "email": "tanya.mehta@example.com",
      "password": "123456", 
    "qualifications": "MA Counseling",
    "specialization": "relationships",
    "slots": ["10:00", "11:00", "14:00"]
  }
  // ... (Add similar 30 more objects following this pattern)


];

async function insertData() {
  try {
    await connectDB();

    await Counsellor.deleteMany(); // clear existing
    await Counsellor.insertMany(sampleCounsellors);

    console.log("✅ Sample counsellors inserted successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error inserting counsellors:", error);
    mongoose.connection.close();
  }
}

insertData();
Counsellor.deleteMany(); // clear existing
