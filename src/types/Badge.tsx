import { UserBase } from 'types';

export type Badge = {
  id: string;
  title: string;
  description: string;
  total_completion_percentage: number;
  badge_category: BadgeCategory['id'] | null;
  active_from: string;
  active_to: string;
  image: string | null;
  image_alt: string | null;
};

export type BadgeCategory = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  image_alt: string | null;
};

export type UserBadge = {
  user: UserBase;
  badge: Badge;
};

export type BadgesOverallLeaderboard = {
  user: UserBase;
  number_of_badges: number;
};

export type BadgeLeaderboard = {
  user: UserBase;
  created_at: string;
};
