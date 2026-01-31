import { api } from "../api";
import type { SearchResponse } from "./types";

/* -------------------------------------------------------------------------- */
/*                                   PARAMS                                   */
/* -------------------------------------------------------------------------- */

export type SearchType = "all" | "players" | "teams" | "matches" | "clubs";

export interface SearchParams {
  q: string;
  type?: SearchType;
  leagueId?: string;
  seasonId?: string;
}

/* -------------------------------------------------------------------------- */
/*                                   SERVICE                                  */
/* -------------------------------------------------------------------------- */

export const searchService = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const { data } = await api.get<SearchResponse>("/search", {
      params,
    });

    return data;
  },
};