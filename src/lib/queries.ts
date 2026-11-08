import { queryOptions } from "@tanstack/react-query";
import { listEncouragements, listPapers, listStruggles } from "./community.functions";

export const strugglesQuery = queryOptions({
  queryKey: ["struggles"],
  queryFn: () => listStruggles(),
});

export const encouragementsQuery = queryOptions({
  queryKey: ["encouragements"],
  queryFn: () => listEncouragements(),
});

export const papersQuery = queryOptions({
  queryKey: ["papers"],
  queryFn: () => listPapers(),
});
