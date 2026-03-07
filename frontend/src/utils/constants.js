export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const FORM_STATUS = {
  PENDING: 'pending',
  LEVEL1_APPROVED: 'level1_approved',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const FORM_STATUS_LABELS = {
  pending: 'Pending',
  level1_approved: 'Level 1 Approved',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const FORM_STATUS_COLORS = {
  pending: 'yellow',
  level1_approved: 'blue',
  approved: 'green',
  rejected: 'red',
};

export const USER_ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
};

export const APPROVAL_LEVELS = {
  LEVEL_1: 1,
  LEVEL_2: 2,
};

export const DEFAULT_CATEGORIES = [
  {
    name: 'Leave Application',
    description: 'Apply for leave of absence',
    icon: '🏖️',
  },
  {
    name: 'Fee Concession',
    description: 'Request fee concession or waiver',
    icon: '💰',
  },
  {
    name: 'Certificate Request',
    description: 'Request various certificates',
    icon: '📜',
  },
  {
    name: 'Internship Approval',
    description: 'Get internship approved',
    icon: '💼',
  },
  {
    name: 'Event Permission',
    description: 'Request permission for events',
    icon: '🎉',
  },
  {
    name: 'Library Request',
    description: 'Library related requests',
    icon: '📚',
  },
];