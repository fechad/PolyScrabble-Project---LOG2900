import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

// TODO : Avoir un fichier séparé pour les constantes et ne pas les répéter!
export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;

@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    fontSize = '9px system-ui';

    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    drawGrid() {
        const dimension = 15;
        const offset = dimension / dimension;
        const squareSize = DEFAULT_WIDTH / dimension - offset;
        this.gridContext.lineWidth = offset;
        this.gridContext.beginPath();
        this.drawWord('ABCDEFGHIJKLMNO');
        this.drawNumbers('1 2 3 4 5 6 7 8 9 10 11 12 13 14 15');

        this.gridContext.fillStyle = '#c4c4c4';
        this.gridContext.strokeStyle = '#B1ACAC';
        const gridOrigin = 20;

        for (let i = 0; i < dimension; i++) {
            for (let j = 0; j < dimension; j++) {
                this.gridContext.beginPath();
                this.gridContext.rect((squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin, squareSize, squareSize);
                this.gridContext.fill();
                this.bonusConditions(i, j, (squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin + 16);
                this.gridContext.fillStyle = '#838383';
            }
        }
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
            this.drawTripleWord(canvasX, canvasY);
        } else if (tripleLetter.includes(coord)) {
            this.drawTripleLetter(canvasX, canvasY);
        } else if (doubleWord.includes(coord)) {
            this.drawDoubleWord(canvasX, canvasY);
        } else if (doubleLetter.includes(coord) || (posX === 11 && posY === 0)) {
            this.drawDoubleLetter(canvasX, canvasY);
        } else if (posX === 7 && posY === 7) {
            this.drawStar(canvasX, canvasY);
        }
    }

    drawTripleWord(canvasX: number, canvasY: number) {
        this.gridContext.fillStyle = '#c93de0';
        this.gridContext.fill();
        this.drawMessage('WORD x3', canvasX, canvasY);
    }

    drawTripleLetter(canvasX: number, canvasY: number) {
        this.gridContext.fillStyle = '#54bd9d';
        this.gridContext.fill();
        this.drawMessage('LETTER x3', canvasX, canvasY);
    }

    drawDoubleWord(canvasX: number, canvasY: number) {
        this.gridContext.fillStyle = '#e1adf3';
        this.gridContext.fill();
        this.drawMessage('WORD x2', canvasX, canvasY);
    }

    drawDoubleLetter(canvasX: number, canvasY: number) {
        this.gridContext.fillStyle = '#b7ffe5';
        this.gridContext.fill();

        this.drawMessage('LETTER x2', canvasX, canvasY);
    }

    drawStar(canvasX: number, canvasY: number) {
        this.gridContext.fillStyle = '#e1adf3';
        this.gridContext.fill();
        this.drawMessage('STAR', canvasX, canvasY);
    }

    drawMessage(word: string, posX: number, posY: number) {
        this.gridContext.fillStyle = '#000000';
        this.gridContext.font = this.fontSize;
        const sentence = word.split(' ');
        const step = 10;
        for (let i = 0; i < sentence.length; i++) {
            this.gridContext.fillText(sentence[i], posX, posY + step * i);
        }
    }

    drawWord(word: string) {
        const startPosition: Vec2 = { x: -4, y: 40 };
        const step = 33.5;
        this.gridContext.font = '20px system-ui';
        for (let i = 0; i < word.length; i++) {
            this.gridContext.fillStyle = '#000000';
            this.gridContext.fillText(word[i], startPosition.x + 4, startPosition.y + step * i);
        }
    }

    drawNumbers(numbers: string) {
        const startPosition: Vec2 = { x: 28, y: 10 };
        const step = 33.5;
        this.gridContext.fillStyle = '#000000';
        this.gridContext.font = '20px system-ui';
        const numberList = numbers.split(' ', 15);

        for (let i = 0; i < numberList.length; i++) {
            const number: number = +numberList[i];
            if (number < 10) {
                this.gridContext.fillText(number.toString(), startPosition.x + step * i, startPosition.y + 4);
            } else {
                this.gridContext.fillText(number.toString(), startPosition.x + (step - 0.5) * i, startPosition.y + 4);
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
