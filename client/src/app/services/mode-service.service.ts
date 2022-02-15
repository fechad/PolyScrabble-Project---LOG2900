import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ModeServiceService {
    mode: string = '';
    appendMode(partMode: string) {
        this.mode = partMode;
    }
}
