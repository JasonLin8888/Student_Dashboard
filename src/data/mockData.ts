import { Task, CalendarEvent, EmailMessage, ClassInfo, Note, Assignment } from '../types';

export const mockClasses: ClassInfo[] = [
  { id: 'cs101', name: 'Introduction to CS', professor: 'Dr. Smith', color: '#4F46E5', credits: 3, schedule: 'MWF 9:00-10:00', room: 'Tech 201' },
  { id: 'math201', name: 'Calculus II', professor: 'Dr. Johnson', color: '#0891B2', credits: 4, schedule: 'TTh 11:00-12:30', room: 'Math 105' },
  { id: 'eng101', name: 'English Composition', professor: 'Prof. Williams', color: '#059669', credits: 3, schedule: 'MWF 2:00-3:00', room: 'Hum 302' },
  { id: 'phys101', name: 'Physics I', professor: 'Dr. Chen', color: '#DC2626', credits: 4, schedule: 'TTh 9:00-10:30', room: 'Sci 150' },
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Complete CS Assignment 3', completed: false, dueDate: '2024-10-20', classId: 'cs101', priority: 'high', createdAt: '2024-10-15' },
  { id: 't2', title: 'Read Chapter 5 - Calculus', completed: false, dueDate: '2024-10-18', classId: 'math201', priority: 'medium', createdAt: '2024-10-14' },
  { id: 't3', title: 'Write Essay Outline', completed: true, dueDate: '2024-10-16', classId: 'eng101', priority: 'high', createdAt: '2024-10-12' },
  { id: 't4', title: 'Physics Lab Report', completed: false, dueDate: '2024-10-22', classId: 'phys101', priority: 'medium', createdAt: '2024-10-14' },
  { id: 't5', title: 'Study for Midterm', completed: false, dueDate: '2024-10-25', classId: 'cs101', priority: 'high', createdAt: '2024-10-13' },
];

export const mockEvents: CalendarEvent[] = [
  { id: 'e1', title: 'CS Assignment 3 Due', date: '2024-10-20', type: 'assignment', classId: 'cs101', color: '#4F46E5' },
  { id: 'e2', title: 'Calculus Quiz', date: '2024-10-18', type: 'exam', classId: 'math201', color: '#0891B2' },
  { id: 'e3', title: 'English Essay Due', date: '2024-10-16', type: 'assignment', classId: 'eng101', color: '#059669' },
  { id: 'e4', title: 'CS Midterm', date: '2024-10-25', type: 'exam', classId: 'cs101', color: '#4F46E5' },
  { id: 'e5', title: 'Study Group - Physics', date: '2024-10-19', type: 'event', color: '#F59E0B' },
  { id: 'e6', title: 'Office Hours - Dr. Smith', date: '2024-10-17', type: 'reminder', color: '#6366F1' },
];

export const mockEmails: EmailMessage[] = [
  { id: 'm1', from: 'Dr. Smith <smith@university.edu>', subject: 'Assignment 3 Details', preview: 'Please find attached the requirements for Assignment 3...', date: '2024-10-15', read: false, hasAttachment: true, body: 'Dear Students, Please find attached the requirements for Assignment 3. The assignment is due October 20th. Make sure to review the rubric carefully. Best, Dr. Smith' },
  { id: 'm2', from: 'Canvas <noreply@canvas.edu>', subject: 'New Assignment: Calculus Quiz', preview: 'A new quiz has been posted in Calculus II...', date: '2024-10-14', read: false, hasAttachment: false, body: 'A new quiz "Chapter 5 Quiz" has been posted in Calculus II. Due date: October 18, 2024. Please complete it before class.' },
  { id: 'm3', from: 'Prof. Williams <williams@university.edu>', subject: 'Essay Feedback', preview: 'I have reviewed your outline and have some feedback...', date: '2024-10-13', read: true, hasAttachment: false, body: 'Hello, I have reviewed your essay outline and wanted to share some feedback. Overall your structure is good, but consider expanding the thesis statement. Let me know if you have questions.' },
  { id: 'm4', from: 'Student Services <services@university.edu>', subject: 'Upcoming Career Fair', preview: "Don't miss the annual career fair next week...", date: '2024-10-12', read: true, hasAttachment: false, body: 'The annual career fair will be held on October 24th from 10am-3pm in the Student Union. Over 50 companies will be in attendance. Dress professionally and bring copies of your resume.' },
  { id: 'm5', from: 'Dr. Chen <chen@university.edu>', subject: 'Lab Report Guidelines', preview: 'Here are the guidelines for your Physics lab report...', date: '2024-10-11', read: true, hasAttachment: true, body: 'Please review the attached guidelines for the Physics lab report. The report should be 3-5 pages and include methodology, data, and conclusions. Due October 22nd.' },
];

export const mockNotes: Note[] = [
  { id: 'n1', title: 'CS Lecture Notes - Week 5', content: '# Week 5: Data Structures\n\n## Arrays\nArrays are fixed-size sequential collections...\n\n## Linked Lists\nLinked lists are dynamic data structures...', classId: 'cs101', createdAt: '2024-10-14', updatedAt: '2024-10-15', tags: ['arrays', 'linked-lists'] },
  { id: 'n2', title: 'Calculus - Integration Techniques', content: '# Integration Techniques\n\n## u-Substitution\nUsed when the integrand contains a composite function...\n\n## Integration by Parts\n∫u dv = uv - ∫v du', classId: 'math201', createdAt: '2024-10-13', updatedAt: '2024-10-13', tags: ['integration', 'calculus'] },
  { id: 'n3', title: 'Essay Ideas - English', content: '# Essay Topic: Technology and Society\n\n## Possible Arguments\n1. Technology increases productivity\n2. Social media affects mental health\n3. AI in education benefits...', classId: 'eng101', createdAt: '2024-10-12', updatedAt: '2024-10-14', tags: ['essay', 'technology'] },
];

export const mockAssignments: Assignment[] = [
  { id: 'a1', title: 'Assignment 3: Binary Trees', classId: 'cs101', dueDate: '2024-10-20', status: 'in-progress', instructions: 'Implement a binary search tree with insert, delete, and search operations.', points: 100 },
  { id: 'a2', title: 'Chapter 5 Quiz', classId: 'math201', dueDate: '2024-10-18', status: 'not-started', instructions: 'Online quiz covering integration techniques from Chapter 5.', points: 50 },
  { id: 'a3', title: 'Essay Outline', classId: 'eng101', dueDate: '2024-10-16', status: 'completed', grade: 92, instructions: 'Submit a detailed outline for your 5-page technology essay.', points: 25 },
  { id: 'a4', title: 'Lab Report: Projectile Motion', classId: 'phys101', dueDate: '2024-10-22', status: 'not-started', instructions: 'Write a full lab report for the projectile motion experiment conducted in lab.', points: 75 },
];
