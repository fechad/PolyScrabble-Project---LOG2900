import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ModeServiceService {
    mode: string = '';
    constructor() {}

    appendMode(partMode: string) {
        this.mode = this.mode + partMode;
    }
}
