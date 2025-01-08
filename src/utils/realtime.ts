import { type RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Entity = Record<string, unknown>;

export function handleRealtimeUpdate<T extends Entity>(
    payload: RealtimePostgresChangesPayload<T>,
    idField: string,
    schema: (data: unknown) => T,
    collection: T[] = [],
): T[] {
    const entity = schema(payload.new);

    switch (payload.eventType) {
        case "DELETE": {
            const oldEntity = schema(payload.old);
            return collection.filter((item) =>
                item[idField] !== oldEntity[idField]
            );
        }

        case "INSERT":
            return [...collection, entity];

        case "UPDATE":
            return collection.map((item) =>
                item[idField] === entity[idField] ? entity : item
            );

        default:
            return collection;
    }
}
