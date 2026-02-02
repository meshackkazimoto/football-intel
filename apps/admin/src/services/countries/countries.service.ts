import { apiClient } from "../api-client";
import type {
  Country,
  CreateCountryInput,
  UpdateCountryInput,
} from "./types";

export const countriesService = {
  getCountries: async (): Promise<Country[]> => {
    const { data } = await apiClient.get<Country[]>("/admin/countries");
    return data;
  },

  createCountry: async (
    input: CreateCountryInput,
  ): Promise<Country> => {
    const { data } = await apiClient.post<Country>(
      "/admin/countries",
      input,
    );
    return data;
  },

  updateCountry: async (
    id: string,
    input: UpdateCountryInput,
  ): Promise<Country> => {
    const { data } = await apiClient.patch<Country>(
      `/admin/countries/${id}`,
      input,
    );
    return data;
  },

  deleteCountry: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/countries/${id}`);
  },
};