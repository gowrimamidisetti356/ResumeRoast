# ResumeRoast – AI-Powered Career Coach & Resume Optimizer

ResumeRoast is an AI-powered career coaching platform that helps students and job seekers improve their resumes and prepare for interviews.

The main idea behind this project is simple: instead of just creating a resume, ResumeRoast helps users understand how good their resume is, how well it matches a particular job, what they can improve, and how they can prepare for the interview.

## What does ResumeRoast do?

Users can upload their resume and get an AI-based analysis of their resume. The system checks different aspects of the resume and provides an ATS compatibility score along with suggestions for improvement.

The platform also allows users to provide a job description and compare it with their resume. This helps identify matching skills, missing keywords, and areas that should be improved before applying for the job.

Some of the main features include:

- AI-based resume analysis
- ATS compatibility score
- Resume and job description matching
- AI-powered resume feedback
- Resume bullet-point improvement
- Skill and keyword gap identification
- Semantic search using Pinecone
- AI-generated mock interview questions

## How it works

The user first uploads their resume. The backend processes the resume content and sends the relevant information to the AI system for analysis.

For job matching, the resume and job description are converted into embeddings and stored/compared using Pinecone. This allows the system to understand the meaning and similarity between the resume and the job description rather than depending only on exact keyword matches.

The AI then generates useful feedback such as:

- What is good in the resume
- What needs improvement
- Which skills are missing
- Which keywords could be added
- How individual bullet points can be written better
- How closely the resume matches the selected job

ResumeRoast also includes an AI mock interview feature that generates questions based on the user's resume and career requirements, allowing users to practice before an actual interview.

## Technologies Used

This project is built using the MERN stack along with Generative AI and vector database technologies.

**Frontend**
- React.js

**Backend**
- Node.js
- Express.js
- REST APIs

**Database**
- MongoDB Atlas

**Vector Database**
- Pinecone

**AI**
- Google AI Studio / Gemini

**Other Tools**
- Git
- GitHub
- Visual Studio Code
- npm

## Project Structure

```text
ResumeRoast/
│
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── config/
│   ├── middleware/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
