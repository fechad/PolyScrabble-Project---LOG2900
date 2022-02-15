import EventEmitter from 'events';

export class SocketMock {
    readonly events: EventEmitter = new EventEmitter();
    readonly emitSpy: jasmine.Spy<(event: string, ...params: unknown[]) => void>;
    connected: boolean = true;

    constructor() {
        this.emitSpy = spyOn(this, 'emit' as never);
    }

    emit() {
        /* do nothing */
    }
    on(event: string, listener: (...params: unknown[]) => void) {
        this.events.on(event, listener);
    }
    once(event: string, listener: (...params: unknown[]) => void) {
        this.events.once(event, listener);
    }
    connect() {
        this.connected = true;
    }
    disconnect() {
        this.connected = false;
    }
    close() {
        /* do nothing */
    }
}
