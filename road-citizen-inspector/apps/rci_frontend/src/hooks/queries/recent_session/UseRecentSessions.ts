import {  queryOptions } from "@tanstack/react-query";
import type {UseSuspenseQueryOptions} from "@tanstack/react-query";
import type {RecentSession} from "@/integrations/dexie/RecentSessions.db";
import { queryRecentSessions } from "@/data/indexed_db/recent_session/QueryRecentSessions";

function useRecentSessions(options?: UseSuspenseQueryOptions<Array<RecentSession>, Error, Array<RecentSession>, [string]>) {
  return queryOptions({
    queryKey: ['recent_session'],
    queryFn: async () => await queryRecentSessions(),
    ...options,
  })
}

export default useRecentSessions;