import { EventEmitter } from "node:events";
const emitter = new EventEmitter();
emitter.setMaxListeners(200);
export function publishReportEvent(event) {
    emitter.emit("report-event", event);
}
export function subscribeReportEvents(listener) {
    emitter.on("report-event", listener);
    return () => emitter.off("report-event", listener);
}
