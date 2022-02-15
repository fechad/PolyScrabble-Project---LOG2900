import { Injectable } from '@angular/core';
import { io as ioSocket, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class IoWrapper {
    io(path: string, params?: { auth: { [key: string]: unknown } }): Socket {
        return ioSocket(path, params);
    }
}
