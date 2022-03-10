/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { GridService } from './grid.service';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const GRID_BORDERS = [20, 500];
const offset = 1;
const TILE = 32;
const numberOfTiles = 15;
const SQR_SIZE = GRID_BORDERS[1] / numberOfTiles - offset;
const GRID_ORIGIN = 20;
const CANVAS_ADJUSTMENT = 16;
const IN_BOARD_AREA = 0;

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
        if (event.button === MouseButton.Left && this.isInBound(event)) {
            if (this.gridService.letterWritten !== 0) this.mousePosition = this.prevPos;
            else {
                this.prevPos = this.mousePosition;
                this.mousePosition = {
                    x: this.calculateX(event.offsetX),
                    y: this.calculateY(event.offsetY),
                };
                // console.log(this.mousePosition.x, this.mousePosition.y);
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

    isInBound(event: MouseEvent): boolean {
        if (
            event.offsetX >= GRID_BORDERS[0] &&
            event.offsetX <= GRID_BORDERS[1] &&
            event.offsetY >= GRID_BORDERS[0] &&
            event.offsetY <= GRID_BORDERS[1]
        )
            return true;
        return false;
    }
    calculateX(xPosition: number): number {
        let x = Math.floor((xPosition - GRID_ORIGIN) / TILE);
        if (x < 0) x = 0;
        return (SQR_SIZE + offset) * x + GRID_ORIGIN + CANVAS_ADJUSTMENT;
    }
    calculateY(yPosition: number): number {
        let y = Math.floor((yPosition - GRID_ORIGIN) / TILE);
        if (y < 0) y = 0;
        return (SQR_SIZE + offset) * y + GRID_ORIGIN + CANVAS_ADJUSTMENT;
    }
}
