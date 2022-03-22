import { Injectable } from '@angular/core';
import { io as ioSocket, Socket } from 'socket.io-client';

type Param = { auth: { [key: string]: unknown } };
@Injectable({
    providedIn: 'root',
})
export class IoWrapper {
    io(path: string, params?: Param): Socket {
        return ioSocket(path, params);
    }
}
