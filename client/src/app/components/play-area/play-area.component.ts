import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';
import { MouseService } from '@app/services/mouse.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 525;
export const DEFAULT_HEIGHT = 525;
const MAX_RACK_SIZE = 7;
const LAST_INDEX = -1;
const CANVAS_SQUARE_SIZE = 33;
const PLAY_AREA_SIZE = 520;
const ADJUSTMENT = 2;

// TODO : Déplacer ça dans un fichier séparé accessible par tous
export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    buttonPressed = '';
    letterWrited = 0;
    // eslint-disable-next-line no-invalid-this
    mousePosition = this.mouseDetectService.mousePosition;
<<<<<<< HEAD
    rack: string[] = [];
<<<<<<< HEAD
    firstLetter = [0, 0];
    shift: number[] = [];
=======
>>>>>>> 4a7aacb (inbound and inRack placing work)
=======
>>>>>>> ed4892f (backspace logic done)
    private isLoaded = false;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(
        private readonly gridService: GridService,
        private gameContextService: GameContextService,
        public mouseDetectService: MouseService,
        public communicationservice: CommunicationService,
    ) {
        this.gameContextService.state.subscribe(() => {
            if (this.isLoaded) this.gridService.drawGrid();
        });
<<<<<<< HEAD
        this.gameContextService.rack.subscribe((rack) => {
            for (const i of rack) {
<<<<<<< HEAD
                if (this.rack.length <= MAX_RACK_SIZE) this.rack.push(i.name);
=======
                if (this.rack.length <= 7) this.rack.push(i.name);
>>>>>>> 4a7aacb (inbound and inRack placing work)
            }
        });
=======
>>>>>>> ed4892f (backspace logic done)
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if (this.buttonPressed === 'Enter') {
<<<<<<< HEAD
            this.sendPlacedLetters();
        } else if (this.buttonPressed === 'Backspace' && this.gridService.letters.length > 0) {
            this.removeLetterOnCanvas();
        } else if (this.mouseDetectService.writingAllowed && this.isInBound()) {
            try {
                this.placeWordOnCanvas();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                this.communicationservice.sendLocalMessage(e.message);
            }
        }
    }

    sendPlacedLetters() {
        for (const elem of this.gridService.letterPosition) this.gameContextService.state.value.board[elem[0]][elem[1]] = null;
        this.communicationservice.place(
            this.gridService.letterForServer,
            this.firstLetter[1],
            this.firstLetter[0],
            this.mouseDetectService.isHorizontal,
        );
        this.gridService.letterPosition = [[0, 0]];
        this.gridService.letterWritten = 0;
        this.gridService.letters = [];
        this.gridService.letterForServer = '';
        this.gridService.drawGrid();
    }

    removeLetterOnCanvas() {
        const letter = this.gridService.letters.pop();
        const letterRemoved = this.gridService.letterPosition[this.gridService.letterPosition.length - 1];
        this.gridService.letterPosition.pop();
        this.gridService.letterForServer = this.gridService.letterForServer.slice(0, LAST_INDEX);
        if (letter !== undefined) {
            this.gridService.rack.push(letter);
            this.gameContextService.addTempRack(letter);
        }
        if (letterRemoved[0] !== undefined && letterRemoved[0] !== undefined)
            this.gameContextService.state.value.board[letterRemoved[0]][letterRemoved[1]] = null;
        this.gridService.drawGrid();
        this.drawShiftedArrow(letterRemoved, 1);
        this.gridService.letterWritten -= 1;
    }

    placeWordOnCanvas() {
        this.gameContextService.attemptTempRackUpdate(this.buttonPressed);
        this.gridService.letterWritten += 1;
        for (const i of this.gridService.rack) {
            if (i.name === this.buttonPressed.toUpperCase()) {
                this.gridService.letters.push(i);
                this.gridService.letterForServer += this.buttonPressed;
                break;
            }
        }
        this.gridService.drawGrid();
        if (this.gridService.letters.length === 1)
            this.firstLetter = [
                Math.ceil(this.mouseDetectService.mousePosition.x / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
                Math.ceil(this.mouseDetectService.mousePosition.y / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
            ];
        this.gridService.tempUpdateBoard(
            this.buttonPressed,
            Math.ceil(this.mouseDetectService.mousePosition.y / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
            Math.ceil(this.mouseDetectService.mousePosition.x / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
            this.mouseDetectService.isHorizontal,
        );
        const lastLetter = this.gridService.letterPosition[this.gridService.letterPosition.length - 1];
        this.drawShiftedArrow(lastLetter, 2);
        this.gameContextService.tempUpdateRack();
    }

    drawShiftedArrow(pos: number[], shift: number) {
        if (this.mouseDetectService.isHorizontal)
            this.gridService.drawArrow((pos[1] + shift) * CANVAS_SQUARE_SIZE, this.mouseDetectService.mousePosition.y, true);
        else this.gridService.drawArrow(this.mouseDetectService.mousePosition.x, (pos[0] + shift) * CANVAS_SQUARE_SIZE, false);
    }
    isInBound() {
        if (
            (this.mouseDetectService.isHorizontal &&
                this.mouseDetectService.mousePosition.x + this.gridService.letters.length * CANVAS_SQUARE_SIZE <= PLAY_AREA_SIZE) ||
            (!this.mouseDetectService.isHorizontal &&
                this.mouseDetectService.mousePosition.y + this.gridService.letters.length * CANVAS_SQUARE_SIZE <= PLAY_AREA_SIZE)
        )
            return true;
        return false;
    }

    getShift(pos: number[]): number {
        const board = this.gameContextService.state.value.board;
        let shift = 2;
        if (this.mouseDetectService.isHorizontal) {
            while (board[pos[0]][pos[1] + 1] !== null) {
                pos[1]++;
                shift++;
            }
            return shift;
        } else {
            while (board[pos[0] + 1][pos[1]] !== null) {
                pos[0]++;
                shift++;
=======
            this.gridService.letters = [];
            this.gridService.drawGrid();
        } else if (this.buttonPressed === 'Backspace') {
            const letter = this.gridService.letters.pop();
            if (letter !== undefined) {
                this.gridService.rack.push(letter);
                this.gameContextService.addTempRack(letter);
            }
            this.gameContextService.tempUpdateRack();
            this.gridService.drawGrid();
            for (let i = 0; i < this.gridService.letters.length; i++) {
                this.drawRightDirection(this.gridService.letters[i].name.toLowerCase(), i, this.mouseDetectService.isHorizontal);
            }
        } else if (this.mouseDetectService.writingAllowed && this.isInBound()) {
            try {
                this.gameContextService.attemptTempRackUpdate(this.buttonPressed);
                this.drawRightDirection(this.buttonPressed, this.gridService.letters.length, this.mouseDetectService.isHorizontal);
                for (const i of this.gridService.rack) {
                    if (i.name === this.buttonPressed.toUpperCase()) {
                        this.gridService.letters.push(i);
                        break;
                    }
                }
                this.gameContextService.tempUpdateRack();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                this.communicationservice.sendLocalMessage(e.message);
            }
        }
    }
    isInBound() {
        if (this.mouseDetectService.isHorizontal && this.mouseDetectService.mousePosition.x + (this.gridService.letters.length * 100) / 3 <= 520)
            return true;
        else if (
            !this.mouseDetectService.isHorizontal &&
            this.mouseDetectService.mousePosition.y + (this.gridService.letters.length * 100) / 3 <= 520
        )
            return true;
        return false;
    }

    drawRightDirection(letter: string, pos: number, horizontal: boolean) {
        if (horizontal && this.mouseDetectService.mousePosition.x + (this.gridService.letters.length * 100) / 3 <= 520) {
            this.gridService.drawTempTiles(
                letter,
                this.mouseDetectService.mousePosition.x + (pos * 100) / 3,
                this.mouseDetectService.mousePosition.y,
            );
        } else if (!horizontal && this.mouseDetectService.mousePosition.y + (this.gridService.letters.length * 100) / 3 <= 520) {
            this.gridService.drawTempTiles(
                letter,
                this.mouseDetectService.mousePosition.x,
                this.mouseDetectService.mousePosition.y + (pos * 100) / 3,
            );
        }
    }

<<<<<<< HEAD
    isInTempRack(letter: string) {
        for (let i = 0; i < this.rack.length; i++) {
            if (this.rack[i] === letter.toUpperCase()) {
                console.log(this.rack);
                this.rack.splice(i, 1);
                return true;
>>>>>>> 4a7aacb (inbound and inRack placing work)
            }
            return shift;
        }
        return false;
    }

=======
>>>>>>> ed4892f (backspace logic done)
    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawGrid();
        this.gridCanvas.nativeElement.focus();
        this.isLoaded = true;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
