export interface Organization {
  id: string;
  name: string;
  unique_code: string;
  admin_id: string;
  password: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  unique_code: string;
  organization_id: string;
  created_at: string;
}

export interface Teacher {
  id: string;
  organization_id: string;
  name: string;
  subject: string;
  created_at: string;
}

export interface Room {
  id: string;
  organization_id: string;
  room_number: string;
  branch: string;
  section: string;
  created_at: string;
}

export interface Subject {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
}

export interface Timetable {
  id: string;
  organization_id: string;
  room_id: string;
  generated_date: string;
  periods_per_day: number;
  is_current: boolean;
  created_at: string;
}

export interface TimetableEntry {
  id: string;
  timetable_id: string;
  day_of_week: string;
  period_number: number;
  subject: string | null;
  teacher_name: string | null;
  room_number: string;
  start_time: string;
  end_time: string;
}

export type AuthType = 'organization' | 'user' | null;

export interface AuthContextType {
  authType: AuthType;
  organizationId: string | null;
  organizationName: string | null;
  userName: string | null;
  uniqueCode: string | null;
  login: (type: AuthType, data: any) => void;
  logout: () => void;
}
