export type Role = 'STUDENT' | 'EMPLOYER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  bio?: string;
  skills?: string;
  resume_path?: string;
}

export interface Job {
  id: number;
  employer_id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  experience: string;
  salary: string;
  created_at: string;
}

export interface Application {
  id: number;
  job_id: number;
  student_id: number;
  status: 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'APPROVED';
  applied_at: string;
  cover_letter?: string;
  job_title?: string;
  job_location?: string;
  applicant_name?: string;
  applicant_email?: string;
  resume_path?: string;
}
