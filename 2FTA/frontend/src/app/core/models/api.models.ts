export interface User {
  id: number;
  username: string;
  bio?: string;
  avatar?: string | null;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface MuscleGroup {
  id: number;
  code: string;
  name: string;
  points_modifier: string;
}

export interface ExerciseMuscle {
  id?: number;
  muscle_group: MuscleGroup;
  contribution_percent: string;
  is_primary: boolean;
}

export interface Exercise {
  id: number;
  name: string;
  target_muscle: string;
  description: string;
  image_url: string;
  video_url: string;
  exercise_type: string;
  base_coefficient: string;
  is_active: boolean;
  exercise_muscles: ExerciseMuscle[];
}

export interface Session {
  id: number;
  date: string;
  start_time: string;
  finish_time: string | null;
  duration: string | null;
  points_sum: string;
  status: 'in_progress' | 'completed';
}

export interface SessionExercise {
  id: number;
  session: number;
  exercise: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: string;
  points: string;
  notes: string;
  created_at: string;
}

export interface WeeklyStats {
  period: 'week';
  total_sessions: number;
  total_points: number;
  line_chart: Array<{ date: string; points: number }>;
  muscle_distribution: Array<{ muscle: string; points: number }>;
}
