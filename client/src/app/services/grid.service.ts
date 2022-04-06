import { HostListener, Injectable } from '@angular/core';
import { alphabet } from '@app/alphabet-letters';
import { Letter } from '@app/classes/letter';
import { Vec2 } from '@app/classes/vec2';
import * as constants from '@app/constants';
import { GameContextService, Tile } from './game-context.service';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    fontSize = '';
    multiplier = 1;
    buttonPressed = '';
    letters: Letter[] = [];
    rack: Letter[] = [];
    letterForServer = '';
    letterWritten = 0;
    letterPosition: number[][] = [];
    firstLetter = [0, 0];
    private canvasSize: Vec2 = { x: constants.DEFAULT_INNER_WIDTH, y: constants.DEFAULT_INNER_HEIGHT };

    constructor(private gameContext: GameContextService) {
        this.gameContext.rack.subscribe((rack) => {
            this.rack = [...rack];
        });
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
    }

    drawGrid() {
        this.gridContext.clearRect(0, 0, constants.PLAY_AREA_SIZE, constants.PLAY_AREA_SIZE);
        this.gridContext.lineWidth = constants.BOUNDS;
        this.gridContext.beginPath();
        this.drawWord('ABCDEFGHIJKLMNO');
        this.drawNumbers('1 2 3 4 5 6 7 8 9 10 11 12 13 14 15');

        this.gridContext.fillStyle = constants.Colors.DarkGrey;
        this.gridContext.strokeStyle = constants.Colors.Black;
        for (let i = 0; i < constants.BOARD_LENGTH; i++) {
            for (let j = 0; j < constants.BOARD_LENGTH; j++) {
                this.gridContext.beginPath();
                this.gridContext.rect(
                    (constants.SQUARE_SIZE + constants.BOUNDS) * i + constants.GRID_ORIGIN,
                    (constants.SQUARE_SIZE + constants.BOUNDS) * j + constants.GRID_ORIGIN,
                    constants.SQUARE_SIZE,
                    constants.SQUARE_SIZE,
                );
                this.gridContext.fill();
                this.bonusConditions(
                    i,
                    j,
                    (constants.SQUARE_SIZE + constants.BOUNDS) * i + constants.GRID_ORIGIN,
                    (constants.SQUARE_SIZE + constants.BOUNDS) * j + constants.GRID_ORIGIN + constants.AJUST_Y,
                );
                this.drawTiles(
                    i,
                    j,
                    (constants.SQUARE_SIZE + constants.BOUNDS) * i + constants.GRID_ORIGIN,
                    (constants.SQUARE_SIZE + constants.BOUNDS) * j + constants.GRID_ORIGIN + constants.AJUST_Y,
                );
                this.drawWhiteSquare(i, j);
                this.gridContext.fillStyle = constants.Colors.DarkGrey;
            }
        }
    }

    drawWhiteSquare(posX: number, posY: number) {
        for (const elem of this.letterPosition) {
            if (elem[1] === posX && elem[0] === posY && this.gameContext.state.value.board[posY][posX]) {
                this.gridContext.strokeStyle = constants.Colors.White;
                this.gridContext.lineWidth = 2.5;
                this.gridContext.stroke();
            }
        }
    }

    drawArrow(canvasX: number, canvasY: number, isHorizontal: boolean) {
        const x = canvasX;
        const y = canvasY;
        this.gridContext.fillStyle = constants.Colors.Black;
        this.gridContext.beginPath();
        if (isHorizontal) {
            this.gridContext.moveTo(x, y);
            this.gridContext.lineTo(x - constants.SQUARE_SIZE / constants.FOURTH_SQUARE, y + constants.SQUARE_SIZE / constants.FOURTH_SQUARE);
            this.gridContext.lineTo(x - constants.SQUARE_SIZE / constants.FOURTH_SQUARE, y - constants.SQUARE_SIZE / constants.FOURTH_SQUARE);
            this.gridContext.fill();
        } else {
            this.gridContext.moveTo(x - constants.SQUARE_SIZE / constants.FOURTH_SQUARE, y + constants.SQUARE_SIZE / constants.FOURTH_SQUARE);
            this.gridContext.lineTo(x - constants.SQUARE_SIZE / 2, y);
            this.gridContext.lineTo(x, y);
            this.gridContext.fill();
        }
    }

    drawTiles(posY: number, posX: number, canvasX: number, canvasY: number) {
        if (this.gameContext.state.value.board[posX][posY]) {
            const tile = this.gameContext.state.value.board[posX][posY] as Letter;
            this.gridContext.fillStyle = 'burlywood';
            this.gridContext.beginPath();
            this.gridContext.moveTo(canvasX + constants.RADIUS, canvasY - constants.Y_PLACEMENT);
            this.gridContext.lineTo(canvasX + constants.SQUARE_SIZE - constants.RADIUS, canvasY - constants.Y_PLACEMENT);
            this.gridContext.quadraticCurveTo(
                canvasX + constants.SQUARE_SIZE,
                canvasY - constants.Y_PLACEMENT,
                canvasX + constants.SQUARE_SIZE,
                canvasY + constants.RADIUS - constants.Y_PLACEMENT,
            );
            this.gridContext.lineTo(canvasX + constants.SQUARE_SIZE, canvasY + constants.SQUARE_SIZE - constants.RADIUS - constants.Y_PLACEMENT);
            this.gridContext.quadraticCurveTo(
                canvasX + constants.SQUARE_SIZE,
                canvasY + constants.SQUARE_SIZE - constants.Y_PLACEMENT,
                canvasX + constants.SQUARE_SIZE - constants.RADIUS,
                canvasY + constants.SQUARE_SIZE - constants.Y_PLACEMENT,
            );
            this.gridContext.lineTo(canvasX + constants.RADIUS, canvasY + constants.SQUARE_SIZE - constants.Y_PLACEMENT);
            this.gridContext.quadraticCurveTo(
                canvasX,
                canvasY + constants.SQUARE_SIZE - constants.Y_PLACEMENT,
                canvasX,
                canvasY + constants.SQUARE_SIZE - constants.RADIUS - constants.Y_PLACEMENT,
            );
            this.gridContext.lineTo(canvasX, canvasY + constants.RADIUS - constants.Y_PLACEMENT);
            this.gridContext.quadraticCurveTo(canvasX, canvasY - constants.Y_PLACEMENT, canvasX + constants.RADIUS, canvasY - constants.Y_PLACEMENT);
            this.gridContext.fill();
            this.gridContext.strokeStyle = '#000';
            this.gridContext.lineWidth = 0.5;
            this.gridContext.stroke();
            this.drawMessage(tile.name, canvasX + constants.AJUST_TILE_X, canvasY + constants.AJUST_TILE_Y, constants.TILE_SIZE);
            this.drawMessage(tile.score.toString(), canvasX + constants.ADJUST_SCORE_X, canvasY + constants.ADJUST_SCORE_Y, constants.SCORE_SIZE);
        }
    }

    tempUpdateBoard(lettersToAdd: string, verticalIndex: number, horizontalIndex: number, isHorizontalPlacement: boolean | undefined) {
        const iterationPosition = isHorizontalPlacement ? horizontalIndex : verticalIndex;
        const temporaryBoard = this.gameContext.state.value.board;
        if (isHorizontalPlacement === undefined) {
            const letter: Tile = {
                name: lettersToAdd[0].toUpperCase(),
                score: alphabet.find((j) => j.name.toLowerCase() === lettersToAdd[0])?.score || 0,
            } as Letter;
            temporaryBoard[verticalIndex][horizontalIndex] = letter;
        } else {
            let pos = 0;
            for (let i = iterationPosition; i < constants.BOARD_LENGTH; i++) {
                if (pos > lettersToAdd.length - 1) break;
                const tile = isHorizontalPlacement ? temporaryBoard[verticalIndex][i] : temporaryBoard[i][horizontalIndex];
                if (tile) continue;
                const letter: Tile = {
                    name: lettersToAdd[pos].toUpperCase(),
                    score: alphabet.find((j) => j.name.toLowerCase() === lettersToAdd[pos])?.score || 0,
                } as Letter;
                temporaryBoard[verticalIndex][i] = isHorizontalPlacement ? letter : temporaryBoard[verticalIndex][i];
                temporaryBoard[i][horizontalIndex] = !isHorizontalPlacement ? temporaryBoard[i][horizontalIndex] : letter;
                this.letterPosition.push(isHorizontalPlacement ? [verticalIndex, i] : [i, horizontalIndex]);
                // if (isHorizontalPlacement) {
                //     temporaryBoard[verticalIndex][i] = letter;
                //     this.letterPosition.push([verticalIndex, i]);
                // } else {
                //     temporaryBoard[i][horizontalIndex] = letter;
                //     this.letterPosition.push([i, horizontalIndex]);
                // }
                pos++;
            }
        }
        const newState = this.gameContext.state.value;
        newState.board = temporaryBoard;
        this.gameContext.state.next(newState);
    }

    bonusConditions(posX: number, posY: number, canvasX: number, canvasY: number) {
        const coord: string = posX.toString() + posY.toString();
        if (constants.TRIPLE_WORD_POS.includes(coord)) {
            this.drawBonus(canvasX, canvasY, constants.Colors.Mustard, 'MOT x3');
        } else if (constants.TRIPLE_LETTER_POS.includes(coord)) {
            this.drawBonus(canvasX, canvasY, constants.Colors.Green, 'LETTRE x3');
        } else if (constants.DOUBLE_WORD_POS.includes(coord)) {
            this.drawBonus(canvasX, canvasY, constants.Colors.Yellow, 'MOT x2');
        } else if (constants.DOUBLE_LETTER_POS.includes(coord) || (posX === constants.EXCEPTION_X && posY === constants.EXCEPTION_Y)) {
            this.drawBonus(canvasX, canvasY, constants.Colors.Blue, 'LETTRE x2');
        } else if (posX === constants.CENTER_TILE && posY === constants.CENTER_TILE) {
            this.drawBonus(canvasX - constants.AJUST_STAR_X, canvasY + constants.AJUST_STAR_Y, constants.Colors.Grey, '⭐');
        }
    }

    drawBonus(canvasX: number, canvasY: number, color: string, word: string) {
        this.gridContext.fillStyle = color;
        this.gridContext.fill();
        this.drawMessage(word, canvasX, canvasY, constants.INITIAL_SIZE);
    }

    drawMessage(word: string, posX: number, posY: number, size: number) {
        this.gridContext.fillStyle = constants.Colors.Black;
        this.gridContext.font = word === '⭐' ? '30px system-ui' : this.multiplier * size + 'px system-ui';
        const sentence = word.split(' ');
        if (sentence.length === 2 && sentence[0] === 'MOT') {
            this.gridContext.fillText(sentence[0], posX + constants.AJUST_BONUS_WORD, posY);
            this.gridContext.fillText(sentence[1], posX + constants.AJUST_BONUS, posY + constants.STEP_MESSAGE);
        } else if (sentence.length === 2 && sentence[0] === 'LETTRE') {
            this.gridContext.fillText(sentence[0], posX + constants.AJUST_BONUS_LETTER, posY);
            this.gridContext.fillText(sentence[1], posX + constants.AJUST_BONUS, posY + constants.STEP_MESSAGE);
        } else {
            for (let i = 0; i < sentence.length; i++) {
                this.gridContext.fillText(sentence[i], posX, posY + constants.STEP_MESSAGE * i);
            }
        }
    }

    drawWord(word: string) {
        const startPosition: Vec2 = { x: -4, y: 40 };
        this.gridContext.font = constants.DEFAULT_FONT;
        for (let i = 0; i < word.length; i++) {
            this.gridContext.fillStyle = constants.Colors.Mustard;
            this.gridContext.fillText(word[i], startPosition.x + constants.AJUST_LETTER, startPosition.y + constants.STEP_HEADER * i);
        }
    }

    drawNumbers(numbers: string) {
        const startPosition: Vec2 = { x: 28, y: 10 };
        this.gridContext.fillStyle = constants.Colors.Mustard;
        this.gridContext.font = constants.DEFAULT_FONT;
        const numberList = numbers.split(' ', constants.AMOUNT_OF_NUMBER);

        for (let i = 0; i < numberList.length; i++) {
            const number: number = +numberList[i];
            if (number < constants.TWO_CHAR_NUMBER) {
                this.gridContext.fillText(number.toString(), startPosition.x + constants.STEP_HEADER * i, startPosition.y + constants.AJUST_LETTER);
            } else {
                this.gridContext.fillText(
                    number.toString(),
                    startPosition.x + (constants.STEP_HEADER - constants.AJUST_STEP) * i,
                    startPosition.y + constants.AJUST_LETTER,
                );
            }
        }
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
