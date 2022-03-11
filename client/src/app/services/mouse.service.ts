import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/components/play-area/play-area.component';
import { take } from 'rxjs/operators';
import { GameContextService } from './game-context.service';
import { GridService } from './grid.service';
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!

const DEFAULT_SIZE = 500;
const offset = 1;
const TILE = 32;
const NUMBER_OF_TILES = 15;
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
    constructor(public gridService: GridService, public gameContextService: GameContextService) {}

    async mouseHitDetect(event: MouseEvent) {
        const myTurn = await this.gameContextService.isMyTurn().pipe(take(1)).toPromise();
        if (myTurn) {
            if (this.gridService.letterWritten < 0) this.gridService.letterWritten = 0;
            if (event.button === MouseButton.Left && this.isInBound(event)) {
                if (this.gridService.letterWritten !== 0) this.mousePosition = this.prevPos;
                else {
                    this.prevPos = this.mousePosition;
                    this.mousePosition = {
                        x: this.calculateX(event.offsetX),
                        y: this.calculateY(event.offsetY),
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

    isInBound(event: MouseEvent): boolean {
        const size = document.getElementById('canvas')?.clientWidth;
        const GRID_BORDERS = [GRID_ORIGIN, size];
        if (
            event.offsetX >= GRID_BORDERS[0]?.valueOf()! &&
            event.offsetX <= GRID_BORDERS[1]?.valueOf()! &&
            event.offsetY >= GRID_BORDERS[0]?.valueOf()! &&
            event.offsetY <= GRID_BORDERS[1]?.valueOf()!
        )
            return true;
        return false;
    }
    calculateX(xPosition: number): number {
        const size = document.getElementById('canvas')?.clientWidth;
        const sqrSize = DEFAULT_SIZE / NUMBER_OF_TILES;
        const converted = (xPosition * DEFAULT_SIZE) / size?.valueOf()!;
        let x = Math.floor((converted - GRID_ORIGIN) / TILE);
        if (x < 0) x = 0;
        return (sqrSize + offset) * x + GRID_ORIGIN + CANVAS_ADJUSTMENT;
    }
    calculateY(yPosition: number): number {
        const size = document.getElementById('canvas')?.clientWidth;
        const sqrSize = DEFAULT_SIZE / NUMBER_OF_TILES - offset;
        const converted = (yPosition * DEFAULT_SIZE) / size?.valueOf()!;
        let y = Math.floor((converted - GRID_ORIGIN) / TILE);
        if (y < 0) y = 0;
        return (sqrSize + offset) * y + GRID_ORIGIN + CANVAS_ADJUSTMENT;
    }
}
