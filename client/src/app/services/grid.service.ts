import { HostListener, Injectable } from '@angular/core';
import { Letter } from '@app/classes/letter';
import { Vec2 } from '@app/classes/vec2';
import * as cst from '@app/constants';
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
    private canvasSize: Vec2 = { x: cst.DEFAULT_INNER_WIDTH, y: cst.DEFAULT_INNER_HEIGHT };

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
        this.gridContext.clearRect(0, 0, cst.PLAY_AREA_SIZE, cst.PLAY_AREA_SIZE);
        this.gridContext.lineWidth = cst.BOUNDS;
        this.gridContext.beginPath();
        this.drawWord('ABCDEFGHIJKLMNO');
        this.drawNumbers('1 2 3 4 5 6 7 8 9 10 11 12 13 14 15');

        this.gridContext.fillStyle = cst.Colors.DarkGrey;
        this.gridContext.strokeStyle = cst.Colors.Black;
        for (let i = 0; i < cst.BOARD_LENGTH; i++) {
            for (let j = 0; j < cst.BOARD_LENGTH; j++) {
                this.gridContext.beginPath();
                this.gridContext.rect(
                    (cst.SQUARE_SIZE + cst.BOUNDS) * i + cst.GRID_ORIGIN,
                    (cst.SQUARE_SIZE + cst.BOUNDS) * j + cst.GRID_ORIGIN,
                    cst.SQUARE_SIZE,
                    cst.SQUARE_SIZE,
                );
                this.gridContext.fill();
                this.bonusConditions(
                    i,
                    j,
                    (cst.SQUARE_SIZE + cst.BOUNDS) * i + cst.GRID_ORIGIN,
                    (cst.SQUARE_SIZE + cst.BOUNDS) * j + cst.GRID_ORIGIN + cst.AJUST_Y,
                );
                this.drawTiles(
                    i,
                    j,
                    (cst.SQUARE_SIZE + cst.BOUNDS) * i + cst.GRID_ORIGIN,
                    (cst.SQUARE_SIZE + cst.BOUNDS) * j + cst.GRID_ORIGIN + cst.AJUST_Y,
                );
                this.drawWhiteSquare(i, j);
                this.gridContext.fillStyle = cst.Colors.DarkGrey;
            }
        }
    }

    drawWhiteSquare(posX: number, posY: number) {
        for (const elem of this.letterPosition) {
            if (elem[1] === posX && elem[0] === posY && this.gameContext.state.value.board[posY][posX] !== null) {
                this.gridContext.strokeStyle = cst.Colors.White;
                this.gridContext.lineWidth = 2.5;
                this.gridContext.stroke();
            }
        }
    }

    drawArrow(canvasX: number, canvasY: number, isHorizontal: boolean) {
        const x = canvasX;
        const y = canvasY;
        this.gridContext.fillStyle = cst.Colors.Black;
        this.gridContext.beginPath();
        if (isHorizontal) {
            this.gridContext.moveTo(x, y);
            this.gridContext.lineTo(x - cst.SQUARE_SIZE / cst.FOURTH_SQUARE, y + cst.SQUARE_SIZE / cst.FOURTH_SQUARE);
            this.gridContext.lineTo(x - cst.SQUARE_SIZE / cst.FOURTH_SQUARE, y - cst.SQUARE_SIZE / cst.FOURTH_SQUARE);
            this.gridContext.fill();
        } else {
            this.gridContext.moveTo(x - cst.SQUARE_SIZE / cst.FOURTH_SQUARE, y + cst.SQUARE_SIZE / cst.FOURTH_SQUARE);
            this.gridContext.lineTo(x - cst.SQUARE_SIZE / 2, y);
            this.gridContext.lineTo(x, y);
            this.gridContext.fill();
        }
    }

    drawTiles(posY: number, posX: number, canvasX: number, canvasY: number) {
        if (this.gameContext.state.value.board[posX][posY] !== undefined && this.gameContext.state.value.board[posX][posY] !== null) {
            const tile = this.gameContext.state.value.board[posX][posY] as Letter;
            this.gridContext.fillStyle = 'burlywood';
            this.gridContext.fill();
            this.drawMessage(tile.name, canvasX + cst.AJUST_TILE_X, canvasY + cst.AJUST_TILE_Y, cst.TILE_SIZE);
        }
    }

    tempUpdateBoard(lettersToAdd: string, verticalIndex: number, horizontalIndex: number, isHorizontalPlacement: boolean | undefined) {
        const iterationPosition = isHorizontalPlacement ? horizontalIndex : verticalIndex;
        const temporaryBoard = this.gameContext.state.value.board;
        if (isHorizontalPlacement === undefined) {
            const letter: Tile = {
                name: lettersToAdd[0].toUpperCase(),
                score: 0,
            } as Letter;
            temporaryBoard[verticalIndex][horizontalIndex] = letter;
        } else {
            let pos = 0;
            for (let i = iterationPosition; i < cst.BOARD_LENGTH; i++) {
                if (pos > lettersToAdd.length - 1) break;
                const tile = isHorizontalPlacement ? temporaryBoard[verticalIndex][i] : temporaryBoard[i][horizontalIndex];
                if (tile !== null) continue;
                const letter: Tile = {
                    name: lettersToAdd[pos].toUpperCase(),
                    score: 0,
                } as Letter;
                if (isHorizontalPlacement) {
                    temporaryBoard[verticalIndex][i] = letter;
                    this.letterPosition.push([verticalIndex, i]);
                } else {
                    temporaryBoard[i][horizontalIndex] = letter;
                    this.letterPosition.push([i, horizontalIndex]);
                }
                pos++;
            }
        }
        const newState = this.gameContext.state.value;
        newState.board = temporaryBoard;
        this.gameContext.state.next(newState);
    }

    bonusConditions(posX: number, posY: number, canvasX: number, canvasY: number) {
        const coord: string = posX.toString() + posY.toString();
        const tripleWord = ['00', '07', '014', '70', '714', '147', '140', '1414'];
        const tripleLetter = ['15', '19', '51', '55', '59', '513', '91', '95', '99', '913', '135', '139'];
        const doubleWord = ['11', '22', '33', '44', '1010', '1111', '1212', '1313', '113', '212', '311', '410', '131', '122', '113', '104'];
        const doubleLetter = [
            '03',
            '011',
            '30',
            '314',
            '37',
            '26',
            '28',
            '62',
            '66',
            '68',
            '612',
            '73',
            '711',
            '82',
            '86',
            '88',
            '812',
            '117',
            '1114',
            '126',
            '128',
            '143',
            '1411',
        ];
        if (tripleWord.includes(coord)) {
            this.drawBonus(canvasX, canvasY, cst.Colors.Mustard, 'MOT x3');
        } else if (tripleLetter.includes(coord)) {
            this.drawBonus(canvasX, canvasY, cst.Colors.Green, 'LETTRE x3');
        } else if (doubleWord.includes(coord)) {
            this.drawBonus(canvasX, canvasY, cst.Colors.Yellow, 'MOT x2');
        } else if (doubleLetter.includes(coord) || (posX === cst.EXCEPTION_X && posY === cst.EXCEPTION_Y)) {
            this.drawBonus(canvasX, canvasY, cst.Colors.Blue, 'LETTRE x2');
        } else if (posX === cst.CENTER_TILE && posY === cst.CENTER_TILE) {
            this.drawBonus(canvasX - cst.AJUST_STAR_X, canvasY + cst.AJUST_STAR_Y, cst.Colors.Grey, '⭐');
        }
    }

    drawBonus(canvasX: number, canvasY: number, color: string, word: string) {
        this.gridContext.fillStyle = color;
        this.gridContext.fill();
        this.drawMessage(word, canvasX, canvasY, cst.INITIAL_SIZE);
    }

    drawMessage(word: string, posX: number, posY: number, size: number) {
        this.gridContext.fillStyle = cst.Colors.Black;
        this.gridContext.font = word === '⭐' ? '30px system-ui' : this.multiplier * size + 'px system-ui';
        const sentence = word.split(' ');
        const step = 10;
        if (sentence.length === 2 && sentence[0] === 'MOT') {
            this.gridContext.fillText(sentence[0], posX + cst.AJUST_BONUS_WORD, posY);
            this.gridContext.fillText(sentence[1], posX + cst.AJUST_BONUS, posY + step);
        } else if (sentence.length === 2 && sentence[0] === 'LETTRE') {
            this.gridContext.fillText(sentence[0], posX + cst.AJUST_BONUS_LETTER, posY);
            this.gridContext.fillText(sentence[1], posX + cst.AJUST_BONUS, posY + step);
        } else {
            for (let i = 0; i < sentence.length; i++) {
                this.gridContext.fillText(sentence[i], posX, posY + step * i);
            }
        }
    }

    drawWord(word: string) {
        const startPosition: Vec2 = { x: -4, y: 40 };
        const step = 33.5;
        this.gridContext.font = cst.DEFAULT_FONT;
        for (let i = 0; i < word.length; i++) {
            this.gridContext.fillStyle = cst.Colors.Mustard;
            this.gridContext.fillText(word[i], startPosition.x + cst.AJUST_LETTER, startPosition.y + step * i);
        }
    }

    drawNumbers(numbers: string) {
        const startPosition: Vec2 = { x: 28, y: 10 };
        const step = 33.5;
        this.gridContext.fillStyle = cst.Colors.Mustard;
        this.gridContext.font = cst.DEFAULT_FONT;
        const numberList = numbers.split(' ', cst.AMOUNT_OF_NUMBER);

        for (let i = 0; i < numberList.length; i++) {
            const number: number = +numberList[i];
            if (number < cst.TWO_CHAR_NUMBER) {
                this.gridContext.fillText(number.toString(), startPosition.x + step * i, startPosition.y + cst.AJUST_LETTER);
            } else {
                this.gridContext.fillText(number.toString(), startPosition.x + (step - cst.AJUST_STEP) * i, startPosition.y + cst.AJUST_LETTER);
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
