/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { GridService } from './grid.service';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
const GRID_SIZE = 500;
const MOUSE_DETECT_SIZE = 615;
const ADJUST_X = 15;
const ADJUST_Y = 5;
const SQUARE_SIZE = 33;
const IN_BOARD_AREA = 18;
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
        if (this.gridService.letterWritten < 0) this.gridService.letterWritten = 0;
        if (event.button === MouseButton.Left) {
            if (this.gridService.letterWritten !== 0) this.mousePosition = this.prevPos;
            else {
                this.prevPos = this.mousePosition;
                this.mousePosition = {
                    x: Math.ceil(((event.offsetX * GRID_SIZE) / MOUSE_DETECT_SIZE - ADJUST_X) / SQUARE_SIZE) * SQUARE_SIZE + ADJUST_X,
                    y: Math.ceil(((event.offsetY * GRID_SIZE) / MOUSE_DETECT_SIZE - ADJUST_Y) / SQUARE_SIZE) * SQUARE_SIZE + ADJUST_Y,
                };
            }
            if (this.mousePosition.x >= IN_BOARD_AREA && this.mousePosition.y >= IN_BOARD_AREA && this.gridService.letterWritten === 0) {
                this.gridService.drawGrid();
                this.gridService.drawArrow(this.mousePosition.x, this.mousePosition.y, true);
                this.writingAllowed = true;
                this.enter = false;
            }
            if (this.prevPos.x === this.mousePosition.x && this.prevPos.y === this.mousePosition.y && this.gridService.letterWritten === 0) {
                this.isHorizontal = !this.isHorizontal;
                this.gridService.drawGrid();
                this.gridService.drawArrow(this.mousePosition.x, this.mousePosition.y, this.isHorizontal);
                this.enter = false;
            }
        }
    }
}
