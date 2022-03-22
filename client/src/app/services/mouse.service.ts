import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import * as cst from '@app/constants';
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
        const board = this.gameContextService.state.value.board;
        const myTurn = await this.gameContextService.isMyTurn().pipe(take(1)).toPromise();
        if (!myTurn) return;
        if (this.gridService.letterWritten !== 0) return;
        if (event.button !== cst.MouseButton.Left || !this.isInBound(event)) return;

        const prevPos = this.mousePosition;
        this.mousePosition = {
            x: this.calculateX(event.offsetX),
            y: this.calculateY(event.offsetY),
        };
        const y = Math.ceil(this.mousePosition.y / 33) - 2;
        const x = Math.ceil(this.mousePosition.x / 33) - 2;
        if (board[y][x] !== null) return;
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
        const GRID_BORDERS = [cst.GRID_ORIGIN, size];
        return (
            event.offsetX >= GRID_BORDERS[0]?.valueOf()! &&
            event.offsetX <= GRID_BORDERS[1]?.valueOf()! &&
            event.offsetY >= GRID_BORDERS[0]?.valueOf()! &&
            event.offsetY <= GRID_BORDERS[1]?.valueOf()!
        );
    }
    calculateX(xPosition: number): number {
        const size = document.getElementById('canvas')?.clientWidth;
        const sqrSize = cst.DEFAULT_SIZE / cst.NUMBER_OF_TILES;
        const converted = (xPosition * cst.DEFAULT_SIZE) / size?.valueOf()!;
        let x = Math.floor((converted - cst.GRID_ORIGIN) / cst.TILE);
        if (x < 0) x = 0;
        return (sqrSize + cst.OFFSET) * x + cst.GRID_ORIGIN + cst.CANVAS_ADJUSTMENT;
    }
    calculateY(yPosition: number): number {
        const size = document.getElementById('canvas')?.clientWidth;
        const sqrSize = cst.DEFAULT_SIZE / cst.NUMBER_OF_TILES - cst.OFFSET;
        const converted = (yPosition * cst.DEFAULT_SIZE) / size?.valueOf()!;
        let y = Math.floor((converted - cst.GRID_ORIGIN) / cst.TILE);
        if (y < 0) y = 0;
        return (sqrSize + cst.OFFSET) * y + cst.GRID_ORIGIN + cst.CANVAS_ADJUSTMENT;
    }
}
