import { Complaint } from '@/types';

const COMPLAINTS_KEY = 'citizen-complaints';

export const saveComplaint = (complaint: Complaint): void => {
  const complaints = getComplaints();
  complaints.push(complaint);
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
};

export const getComplaints = (): Complaint[] => {
  const stored = localStorage.getItem(COMPLAINTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const updateComplaintStatus = (id: string, status: Complaint['status'], completionPhoto?: string): void => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index !== -1) {
    complaints[index].status = status;
    complaints[index].updatedAt = new Date().toISOString();
    
    if (status === 'in-progress' && !complaints[index].inProgressAt) {
      complaints[index].inProgressAt = new Date().toISOString();
    }
    
    if (status === 'resolved') {
      if (completionPhoto) {
        complaints[index].completionPhoto = completionPhoto;
      }
      complaints[index].completedAt = new Date().toISOString();
    }
    
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  }
};

// Rewards system
export const getUserPoints = (): number => {
  const points = localStorage.getItem('user-points');
  return points ? parseInt(points) : 0;
};

export const addUserPoints = (points: number): void => {
  const currentPoints = getUserPoints();
  localStorage.setItem('user-points', (currentPoints + points).toString());
};

export const getUserBadges = (): string[] => {
  const badges = localStorage.getItem('user-badges');
  return badges ? JSON.parse(badges) : [];
};

export const checkAndAwardBadges = (): string[] => {
  const points = getUserPoints();
  const currentBadges = getUserBadges();
  const newBadges: string[] = [];

  const badgeThresholds = [
    { points: 100, badge: 'Community Helper' },
    { points: 200, badge: 'Civic Champion' },
    { points: 300, badge: 'City Guardian' },
    { points: 500, badge: 'Urban Hero' },
  ];

  badgeThresholds.forEach(({ points: threshold, badge }) => {
    if (points >= threshold && !currentBadges.includes(badge)) {
      newBadges.push(badge);
    }
  });

  if (newBadges.length > 0) {
    const allBadges = [...currentBadges, ...newBadges];
    localStorage.setItem('user-badges', JSON.stringify(allBadges));
  }

  return newBadges;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};