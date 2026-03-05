export interface SearchFilters {
  etl: string;
  schema: string;
  table: string;
  level: number;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  etl: "dbetl_t2_t3",
  schema: "dbigz_prod",
  table: "f_spt_ppn_induk",
  level: 1,
};
