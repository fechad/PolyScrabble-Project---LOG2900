/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { GridService } from './grid.service';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!

@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mousePosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    prevPos: Vec2 = { x: 0, y: 0 };
    isHorizontal = true;
    writingAllowed = false;
    enter = false;
    constructor(public gridService: GridService) {}

    mouseHitDetect(event: MouseEvent) {
        if (event.button === MouseButton.Left) {
            this.prevPos = this.mousePosition;
            this.mousePosition = {
                x: Math.ceil(((event.offsetX * 500) / 615 - 15) / 33) * 33 + 15,
                y: Math.ceil(((event.offsetY * 500) / 615 - 5) / 33) * 33 + 5,
            };
            if (this.mousePosition.x >= 18 && this.mousePosition.y >= 18) {
                this.gridService.drawArrow(this.mousePosition.x, this.mousePosition.y, true);
                this.writingAllowed = true;
                this.enter = false;
            }
            if (this.prevPos.x === this.mousePosition.x && this.prevPos.y === this.mousePosition.y) {
                console.log(this.isHorizontal);
                this.isHorizontal = !this.isHorizontal;
                this.gridService.drawArrow(this.mousePosition.x, this.mousePosition.y, this.isHorizontal);
                this.enter = false;
            } else {
                this.isHorizontal = true;
            }
        }
    }
}
