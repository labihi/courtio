export enum VolleyballRole {
  OUTSIDE_HITTER = 'OH',
  MIDDLE_BLOCKER = 'MB',
  OPPOSITE_HITTER = 'OPP',
  SETTER = 'SET',
  LIBERO = 'LIB',
}

export const ROLE_LABELS: Record<VolleyballRole, string> = {
  [VolleyballRole.OUTSIDE_HITTER]: 'Outside Hitter',
  [VolleyballRole.MIDDLE_BLOCKER]: 'Middle Blocker',
  [VolleyballRole.OPPOSITE_HITTER]: 'Opposite Hitter',
  [VolleyballRole.SETTER]: 'Setter',
  [VolleyballRole.LIBERO]: 'Libero',
};

export const STANDARD_ROSTER: Record<VolleyballRole, number> = {
  [VolleyballRole.OUTSIDE_HITTER]: 2,
  [VolleyballRole.MIDDLE_BLOCKER]: 2,
  [VolleyballRole.OPPOSITE_HITTER]: 1,
  [VolleyballRole.SETTER]: 1,
  [VolleyballRole.LIBERO]: 1,
};

export const TOTAL_ROSTER_SIZE = 7;
