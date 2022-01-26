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
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    // TODO : pas de valeurs magiques!! Faudrait avoir une meilleure manière de le faire
    /* eslint-disable @typescript-eslint/no-magic-numbers */
    drawGrid() {
        const dimension = 15;
        const offset = dimension / dimension;
        const squareSize = DEFAULT_WIDTH / dimension - offset;
        this.gridContext.lineWidth = offset;
        this.gridContext.beginPath();
        this.drawWord('ABCDEFGHIJKLMNO');
        this.drawNumbers('0 1 2 3 4 5 6 7 8 9 10 11 12 13 14');

        this.gridContext.fillStyle = '#838383';
        this.gridContext.strokeStyle = '#B1ACAC';
        const gridOrigin = 20;

        for (let i = 0; i < dimension; i++) {
            for (let j = 0; j < dimension; j++) {
                this.gridContext.beginPath();
                this.gridContext.rect((squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin, squareSize, squareSize);
                this.gridContext.fill();
            }
        }
        // this.gridContext.lineWidth
        /*
        this.gridContext.moveTo((this.width * 3) / 10, (this.height * 4) / 10);
        this.gridContext.lineTo((this.width * 7) / 10, (this.height * 4) / 10);

        this.gridContext.moveTo((this.width * 3) / 10, (this.height * 6) / 10);
        this.gridContext.lineTo((this.width * 7) / 10, (this.height * 6) / 10);

        this.gridContext.moveTo((this.width * 4) / 10, (this.height * 3) / 10);
        this.gridContext.lineTo((this.width * 4) / 10, (this.height * 7) / 10);

        this.gridContext.moveTo((this.width * 6) / 10, (this.height * 3) / 10);
        this.gridContext.lineTo((this.width * 6) / 10, (this.height * 7) / 10);
        */
    }

    drawWord(word: string) {
        const startPosition: Vec2 = { x: 20, y: 20 };
        const step = 32;
        this.gridContext.font = '20px system-ui';
        for (let i = 0; i < word.length; i++) {
            this.gridContext.fillText(word[i], startPosition.x + step * i, startPosition.y);
        }
    }
    drawNumbers(numbers: string) {
        const startPosition: Vec2 = { x: 0, y: 40 };
        const step = 32;
        this.gridContext.font = '20px system-ui';
        const numberList = numbers.split(' ', 15);

        for (let i = 0; i < numberList.length; i++) {
            const number: string = numberList[i];
            this.gridContext.fillText(number.toString(), startPosition.x, startPosition.y + step * i);
        }
    }
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
