import type { UserPublic, ItemPublic } from "@/client";
import type { QueryKey } from "@tanstack/query-core";

// combined type for all util functions that require a combined generic type
export type DatabasePublic = UserPublic | ItemPublic;

export type EnumeratedData = {
  data: DatabasePublic[];
  count: number;
};

export type OpenAPIQueryKey = QueryKey | QueryKey[0];
