import type { MatchListItem } from '@/services/matches/types/match-list';

export interface TeamMatch extends MatchListItem {
  competition: string;
  isHome: boolean;
}
