import { Injectable } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { Vec2 } from '@app/classes/vec2';
import * as constants from '@app/constants';
import { GameContextService } from './game-context.service';
import { GridService } from './grid.service';
import { MouseService } from './mouse.service';

@Injectable({
    providedIn: 'root',
})
export class PlaceLetterService {
    constructor(private gridService: GridService, private gameContextService: GameContextService, private mouseDetectService: MouseService) {}

    removeWord() {
        for (const letter of this.gridService.letters) {
            this.gridService.rack.push(letter);
            this.gameContextService.addTempRack(letter);
        }
        for (const position of this.gridService.letterPosition) {
            this.gameContextService.state.value.board[position.x][position.y] = null;
        }
        this.clear();
    }

    sendPlacedLetters() {
        for (const position of this.gridService.letterPosition) this.gameContextService.state.value.board[position.x][position.y] = null;
        this.gameContextService.place(
            this.gridService.letterForServer,
            this.gridService.firstLetter[1],
            this.gridService.firstLetter[0],
            this.mouseDetectService.isHorizontal,
        );
        this.gridService.tempUpdateBoard(
            this.gridService.letterForServer,
            this.gridService.firstLetter[1],
            this.gridService.firstLetter[0],
            this.mouseDetectService.isHorizontal,
        );
        this.clear();
    }

    clear() {
        this.gridService.letterPosition = [];
        this.gridService.letterWritten = 0;
        this.gridService.letters = [];
        this.gridService.letterForServer = '';
        this.gridService.drawGrid();
    }

    removeLetterOnCanvas() {
        const letter = this.gridService.letters.pop();
        const letterRemoved = this.gridService.letterPosition[this.gridService.letterPosition.length - 1];
        this.gridService.letterPosition.pop();
        this.gridService.letterForServer = this.gridService.letterForServer.slice(0, constants.LAST_INDEX);
        if (!letter) throw new Error('tried to remove a letter when word is empty');
        this.gridService.rack.push(letter);
        this.gameContextService.addTempRack(letter);
        this.gameContextService.state.value.board[letterRemoved.x][letterRemoved.y] = null;
        this.gridService.drawGrid();
        this.drawShiftedArrow(letterRemoved, 1);
        this.gridService.letterWritten--;
    }

    placeWordOnCanvas(word: string) {
        const asterisk: Letter = { name: '*', score: 0 };
        this.gameContextService.attemptTempRackUpdate(word);
        this.gridService.letterWritten++;
        const item = this.gridService.rack.find((i) => i.name === word.toUpperCase() && word.toLowerCase() === word);
        this.gridService.letters.push(item || asterisk);
        this.gridService.letterForServer += word;
        if (this.gridService.letters.length === 1)
            this.gridService.firstLetter = [
                Math.ceil(this.mouseDetectService.mousePosition.x / constants.CANVAS_SQUARE_SIZE) - constants.ADJUSTMENT,
                Math.ceil(this.mouseDetectService.mousePosition.y / constants.CANVAS_SQUARE_SIZE) - constants.ADJUSTMENT,
            ];
        this.gridService.tempUpdateBoard(
            word,
            Math.ceil(this.mouseDetectService.mousePosition.y / constants.CANVAS_SQUARE_SIZE) - constants.ADJUSTMENT,
            Math.ceil(this.mouseDetectService.mousePosition.x / constants.CANVAS_SQUARE_SIZE) - constants.ADJUSTMENT,
            this.mouseDetectService.isHorizontal,
        );
        const lastLetter = this.gridService.letterPosition[this.gridService.letterPosition.length - 1];
        this.nextPosExist();
        if (this.nextPosExist()) this.drawShiftedArrow(lastLetter, this.getShift(lastLetter));
        this.gameContextService.tempUpdateRack();
    }

    nextPosExist() {
        const lastLetter = this.gridService.letterPosition[this.gridService.letterPosition.length - 1];
        return (
            (this.getShift(lastLetter) + lastLetter.y < constants.POS_AND_SHIFT && this.mouseDetectService.isHorizontal) ||
            (this.getShift(lastLetter) + lastLetter.x < constants.POS_AND_SHIFT && !this.mouseDetectService.isHorizontal)
        );
    }

    drawShiftedArrow(pos: Vec2, shift: number) {
        if (this.mouseDetectService.isHorizontal)
            this.gridService.drawArrow((pos.y + shift) * constants.CANVAS_SQUARE_SIZE, this.mouseDetectService.mousePosition.y, true);
        else this.gridService.drawArrow(this.mouseDetectService.mousePosition.x, (pos.x + shift) * constants.CANVAS_SQUARE_SIZE, false);
    }

    getShift(pos: Vec2): number {
        const board = this.gameContextService.state.value.board;
        let shift = 2;
        const horizontal = this.mouseDetectService.isHorizontal;
        let x = !horizontal ? pos.x + 1 : pos.x;
        let y = !horizontal ? pos.y : pos.y + 1;
        while (y !== constants.BOARD_SIZE && x !== constants.BOARD_SIZE && board[x][y]) {
            if (!horizontal) x++;
            else y++;
            shift++;
        }
        return shift;
    }
}
