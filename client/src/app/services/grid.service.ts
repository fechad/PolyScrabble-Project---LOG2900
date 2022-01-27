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
                this.drawTripleWord(i, j, (squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin + 16);
                this.drawTripleLetter(i, j, (squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin + 16);
                this.drawDoubleWord(i, j, (squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin + 16);
                this.drawDoubleLetter(i, j, (squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin + 16);
                this.drawStar(i, j, (squareSize + offset) * i + gridOrigin, (squareSize + offset) * j + gridOrigin + 16)
                this.gridContext.fillStyle = "#838383";
            }
        }
    }
    //
    drawTripleWord(posX:number, posY:number, canvasX:number, canvasY:number) {
        const coord:string = posX.toString()+posY.toString();
        const tripleWord = ["00", "07", "014", "70", "714", "147", "140", "1414"];
        if(tripleWord.includes(coord)) {
            this.gridContext.fillStyle = "#c93de0";
            this.gridContext.fill();
                
            this.drawMessage("TRIPLE WORD", canvasX, canvasY);
            
        }
    }

    drawTripleLetter(posX:number, posY:number, canvasX:number, canvasY:number) {
        const coord:string = posX.toString()+posY.toString();
        const tripleWord = ["15", "19", "51", "55", "59", "513", "91", "95", "99", "913", "135", "139"];
        if(tripleWord.includes(coord)) {
            this.gridContext.fillStyle = "#54bd9d";
            this.gridContext.fill();
                
            this.drawMessage("TRIPLE LETTER", canvasX, canvasY);
            
        }
    }

    drawDoubleWord(posX:number, posY:number, canvasX:number, canvasY:number) {
        const coord:string = posX.toString()+posY.toString();
        const tripleWord = ["11", "22", "33", "44", "1010", "1111", "1212", "1313", "113", "212", "311", "410", "131", "122", "113", "104"];
        if(tripleWord.includes(coord)) {
            this.gridContext.fillStyle = "#e1adf3";
            this.gridContext.fill();
                
            this.drawMessage("DOUBLE WORD", canvasX, canvasY);
            
        }
    }

    drawDoubleLetter(posX:number, posY:number, canvasX:number, canvasY:number) {
        const coord:string = posX.toString()+posY.toString();
        const tripleWord = ["03", "011", "30", "314", "37", "26", "28", "62", "66", "68", "612", "73", "711", "82", "86", "88", "812", "117", "1114", "126", "128", "143", "1411"];
        if(tripleWord.includes(coord) || (posX == 11 && posY == 0)) {
            this.gridContext.fillStyle = "#b7ffe5";
            this.gridContext.fill();
                
            this.drawMessage("DOUBLE LETTER", canvasX, canvasY);
            
        }
    }

    drawStar(posX:number, posY:number, canvasX:number, canvasY:number){
        if(posX==7 && posY==7){
            this.gridContext.fillStyle = "#e1adf3";
            this.gridContext.fill();
            this.drawMessage("étoile !", canvasX, canvasY)

            /*const etoile = new Image();
            etoile.src = 'client\src\assets\transparent-background-star-115497268824j1ftohfyn (1).png';
            //this.gridContext.drawImage(etoile, 0, 0);
            
            etoile.onload = () => {

                this.gridContext.drawImage(etoile, canvasX, canvasY);
     };
            img.onload = function() {
                var canvas = document.getElementById("myCanvas");
                var ctx = canvas.getContext("2d");        
            
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, 500, 500);
            }});*/
    }
}
    
    drawMessage(word:string, posX:number, posY:number){
        
        if(this.gridContext.fillStyle != "#838383"){
            this.gridContext.fillStyle = "#000000";
            this.gridContext.font = '8px system-ui';
            const sentence = word.split(" ");
            this.gridContext.fillText(sentence[0], posX , posY);
            this.gridContext.fillText(sentence[1], posX, posY + 10);
        }
    }
    drawWord(word: string) {
        const startPosition: Vec2 = { x: 30, y: 16 };
        const step = 33;
        this.gridContext.font = '20px system-ui';
        for (let i = 0; i < word.length; i++) {
            this.gridContext.fillText(word[i], startPosition.x + step * i, startPosition.y);
        }
    }
    drawNumbers(numbers: string) {
        const startPosition: Vec2 = { x: -4, y: 40 };
        const step = 34;
        this.gridContext.font = '20px system-ui';
        const numberList = numbers.split(' ', 15);

        for (let i = 0; i < numberList.length; i++) {
            const number: number = +numberList[i];
            if(number < 10) {
                this.gridContext.fillText(number.toString(), startPosition.x + 4, startPosition.y + step * i);
            }
            else {
            this.gridContext.fillText(number.toString(), startPosition.x, startPosition.y + step * i);
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
