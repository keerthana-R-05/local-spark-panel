export interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  gpsLocation?: { lat: number; lng: number };
  name?: string;
  email?: string;
  department: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
  inProgressAt?: string;
  completionPhoto?: string;
  completedAt?: string;
  attachments?: string[];
  points?: number;
}

export interface User {
  isAdmin: boolean;
  workId?: string;
}