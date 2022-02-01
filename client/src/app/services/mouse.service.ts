/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/components/play-area/play-area.component';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };
        }
    }
}
