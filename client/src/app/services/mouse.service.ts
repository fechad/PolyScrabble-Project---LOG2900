import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { CANVAS_ADJUSTMENT, DEFAULT_SIZE, GRID_ORIGIN, MouseButton, NUMBER_OF_TILES, OFFSET, TILE } from '@app/constants';
import { take } from 'rxjs/operators';
import { GameContextService } from './game-context.service';
import { GridService } from './grid.service';
/* eslint-disable  @typescript-eslint/no-non-null-assertion */
@Injectable({
    providedIn: 'root',
})
export class MouseService {
    mousePosition: Vec2 = { x: 0, y: 0 };
    isHorizontal = true;
    constructor(private gridService: GridService, public gameContextService: GameContextService) {}

    async mouseHitDetect(event: MouseEvent) {
        const myTurn = await this.gameContextService.isMyTurn().pipe(take(1)).toPromise();
        if (!myTurn) return;
        if (this.gridService.letterWritten !== 0) return;
        if (event.button !== MouseButton.Left || !this.isInBound(event)) return;

        const prevPos = this.mousePosition;
        this.mousePosition = {
            x: this.calculateX(event.offsetX),
            y: this.calculateY(event.offsetY),
        };
        if (prevPos.x === this.mousePosition.x && prevPos.y === this.mousePosition.y) {
            this.isHorizontal = !this.isHorizontal;
        } else {
            this.isHorizontal = true;
        }
        this.gridService.drawGrid();
        this.gridService.drawArrow(this.mousePosition.x, this.mousePosition.y, this.isHorizontal);
    }

    isInBound(event: MouseEvent): boolean {
        const size = document.getElementById('canvas')?.clientWidth;
        const GRID_BORDERS = [GRID_ORIGIN, size];
        return (
            event.offsetX >= GRID_BORDERS[0]?.valueOf()! &&
            event.offsetX <= GRID_BORDERS[1]?.valueOf()! &&
            event.offsetY >= GRID_BORDERS[0]?.valueOf()! &&
            event.offsetY <= GRID_BORDERS[1]?.valueOf()!
        );
    }
    calculateX(xPosition: number): number {
        const size = document.getElementById('canvas')?.clientWidth;
        const sqrSize = DEFAULT_SIZE / NUMBER_OF_TILES;
        const converted = (xPosition * DEFAULT_SIZE) / size?.valueOf()!;
        let x = Math.floor((converted - GRID_ORIGIN) / TILE);
        if (x < 0) x = 0;
        return (sqrSize + OFFSET) * x + GRID_ORIGIN + CANVAS_ADJUSTMENT;
    }
    calculateY(yPosition: number): number {
        const size = document.getElementById('canvas')?.clientWidth;
        const sqrSize = DEFAULT_SIZE / NUMBER_OF_TILES - OFFSET;
        const converted = (yPosition * DEFAULT_SIZE) / size?.valueOf()!;
        let y = Math.floor((converted - GRID_ORIGIN) / TILE);
        if (y < 0) y = 0;
        return (sqrSize + OFFSET) * y + GRID_ORIGIN + CANVAS_ADJUSTMENT;
    }
}
