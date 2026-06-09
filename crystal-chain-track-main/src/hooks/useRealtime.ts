import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName = "products" | "shipments" | "retail_details" | "blockchain_events";

interface UseRealtimeOptions {
  table: TableName;
  /** Optional filter: only trigger for rows matching this column=value */
  filter?: { column: string; value: string };
  /** Called whenever any change (INSERT/UPDATE/DELETE) occurs */
  onChanged: () => void;
}

/**
 * Subscribe to Postgres changes on a table via Supabase Realtime.
 * Calls `onChanged` on any INSERT, UPDATE, or DELETE.
 */
export function useRealtimeSubscription({ table, filter, onChanged }: UseRealtimeOptions) {
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    const channelName = filter
      ? `realtime-${table}-${filter.column}-${filter.value}`
      : `realtime-${table}`;

    const filterStr = filter ? `${filter.column}=eq.${filter.value}` : undefined;

    const channel: RealtimeChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filterStr ? { filter: filterStr } : {}),
        },
        () => {
          onChangedRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value]);
}

/**
 * Subscribe to multiple tables at once. Calls onChanged on any change.
 */
export function useMultiTableRealtime(tables: TableName[], onChanged: () => void) {
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    const channelName = `realtime-multi-${tables.join("-")}`;

    let channel = supabase.channel(channelName);
    for (const table of tables) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          onChangedRef.current();
        }
      );
    }
    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables.join(",")]);
}
