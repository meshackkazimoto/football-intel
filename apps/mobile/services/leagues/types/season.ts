export interface Season {
  id: string;
  leagueId: string;
  name: string; // e.g. 2024/25
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}