export type VolleyballRole = 'OH' | 'MB' | 'OPP' | 'SET' | 'LIB';

export const ROLE_LABELS: Record<VolleyballRole, string> = {
  OH: 'Outside Hitter',
  MB: 'Middle Blocker',
  OPP: 'Opposite Hitter',
  SET: 'Setter',
  LIB: 'Libero',
};

export const ROLE_COLORS: Record<VolleyballRole, string> = {
  OH: 'bg-orange-500',
  MB: 'bg-blue-500',
  OPP: 'bg-purple-500',
  SET: 'bg-green-500',
  LIB: 'bg-yellow-500',
};

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  platformRole: 'admin' | 'user';
  volleyballRoles: VolleyballRole[];
  teams: string[];
  captainOf: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  user: User;
  role: VolleyballRole;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  jerseyNumber?: number;
}

export interface Team {
  _id: string;
  name: string;
  captain: User;
  members: TeamMember[];
  avatar?: string;
  season?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentPlace {
  placeName: string;
  placeAddress: string;
  placeUrl?: string;
}

export interface Tournament {
  _id: string;
  name: string;
  place: TournamentPlace;
  price: number;
  dateTime: string;
  maxTeamSlots: number;
  format: '6v6' | '4v4' | '2v2';
  skillLevel: string;
  description?: string;
  imageUrl?: string;
  registrationCloseDateTime?: string;
  status: 'UPCOMING' | 'OPEN' | 'FULL' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  organizers: User[];
  registeredTeams: Team[];
  soloRegistrations: Registration[];
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  tournament: Tournament | string;
  type: 'TEAM' | 'SOLO';
  team?: Team | string;
  player?: User;
  roster?: User[];
  role?: VolleyballRole;
  status: 'REGISTERED' | 'WANT_TO_JOIN' | 'CONFIRMED' | 'WAITLIST' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface MarketPlayer {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  volleyballRoles: VolleyballRole[];
  hasTeam: boolean;
  soloRegistration?: {
    _id: string;
    tournament: { _id: string; name: string };
    role: VolleyballRole;
  } | null;
}

export const STANDARD_ROSTER: Record<VolleyballRole, number> = {
  OH: 2,
  MB: 2,
  OPP: 1,
  SET: 1,
  LIB: 1,
};
