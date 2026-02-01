import { apiClient } from "../api-client";
import {
  Fixture,
  FixturesResponse,
  FixtureFilters,
  CreateFixtureInput,
  UpdateFixtureInput,
} from "./types";

export const fixturesService = {
  getFixtures: async (
    filters?: FixtureFilters,
  ): Promise<FixturesResponse> => {
    const { data } = await apiClient.get<Fixture[]>(
      "/admin/fixtures",
      { params: filters },
    );

    return { fixtures: data };
  },

  createFixture: async (
    input: CreateFixtureInput,
  ): Promise<Fixture> => {
    const { data } = await apiClient.post<Fixture>(
      "/admin/fixtures",
      input,
    );
    return data;
  },

  updateFixture: async (
    id: string,
    input: UpdateFixtureInput,
  ): Promise<Fixture> => {
    const { data } = await apiClient.patch<Fixture>(
      `/admin/fixtures/${id}`,
      input,
    );
    return data;
  },

  deleteFixture: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/fixtures/${id}`);
  },
};