import { EventEmitter } from "node:events";

export type RealtimeReportEvent = {
  type: "request-log" | "task-updated";
  timestamp: string;
  usuarioId?: string | null;
  usuario?: string | null;
  metodo?: string;
  endpoint?: string;
  statusCode?: number;
  tarefaId?: string;
};

const emitter = new EventEmitter();
emitter.setMaxListeners(200);

export function publishReportEvent(event: RealtimeReportEvent) {
  emitter.emit("report-event", event);
}

export function subscribeReportEvents(listener: (event: RealtimeReportEvent) => void) {
  emitter.on("report-event", listener);
  return () => emitter.off("report-event", listener);
}
