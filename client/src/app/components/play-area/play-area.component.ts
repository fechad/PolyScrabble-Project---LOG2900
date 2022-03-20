import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { CommandParsing } from '@app/classes/command-parsing';
import { State } from '@app/classes/room';
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
const POS_AND_SHIFT = 16;
const BOARD_SIZE = 15;

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
export class PlayAreaComponent implements AfterViewInit, AfterViewChecked {
    @Input() sending: boolean = false;
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    buttonPressed = '';
    // eslint-disable-next-line no-invalid-this
    mousePosition = this.mouseDetectService.mousePosition;
    rack: string[] = [];
    shift: number[] = [];
    myTurn = false;
    private isLoaded = false;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(
        public gridService: GridService,
        public gameContextService: GameContextService,
        public mouseDetectService: MouseService,
        public communicationservice: CommunicationService,
    ) {
        this.gameContextService.state.subscribe(() => {
            if (this.isLoaded) this.gridService.drawGrid();
        });
        this.gameContextService.rack.subscribe((rack) => {
            for (const i of rack) {
                if (this.rack.length <= MAX_RACK_SIZE) this.rack.push(i.name);
            }
        });
        this.gameContextService.isMyTurn().subscribe((bool) => {
            this.myTurn = bool;
        });
    }
    @HostListener('document:click', ['$event'])
    click(event: MouseEvent) {
        if (this.sending && this.myTurn) {
            this.sendPlacedLetters();
            this.sending = false;
        } else if (this.gridCanvas.nativeElement !== event.target && this.myTurn) {
            this.removeWord();
        }
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (!this.myTurn || this.gameContextService.state.value.state !== State.Started) return;
        this.buttonPressed = event.key;
        if (this.buttonPressed === 'Enter') {
            this.sendPlacedLetters();
        } else if (this.buttonPressed === 'Backspace' && this.gridService.letters.length > 0) {
            this.removeLetterOnCanvas();
        } else if (this.buttonPressed === 'Escape') {
            this.removeWord();
        } else if (this.isInBound() && this.buttonPressed.match(/[A-Za-zÀ-ú]/g)?.length === 1) {
            try {
                this.placeWordOnCanvas();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (e: any) {
                this.communicationservice.sendLocalMessage(e.message);
            }
        }
    }

    removeWord() {
        for (const elem of this.gridService.letters) {
            this.gridService.rack.push(elem);
            this.gameContextService.addTempRack(elem);
        }
        for (const elem of this.gridService.letterPosition) {
            this.gameContextService.state.value.board[elem[0]][elem[1]] = null;
        }
        this.gridService.letterPosition = [[0, 0]];
        this.gridService.letterWritten = 0;
        this.gridService.letters = [];
        this.gridService.letterForServer = '';
        this.gridService.drawGrid();
    }

    sendPlacedLetters() {
        for (const elem of this.gridService.letterPosition) this.gameContextService.state.value.board[elem[0]][elem[1]] = null;
        this.communicationservice.place(
            this.gridService.letterForServer,
            this.gridService.firstLetter[1],
            this.gridService.firstLetter[0],
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
        if (letterRemoved[1] !== undefined && letterRemoved[0] !== undefined)
            this.gameContextService.state.value.board[letterRemoved[0]][letterRemoved[1]] = null;
        this.gridService.drawGrid();
        this.drawShiftedArrow(letterRemoved, 1);
        this.gridService.letterWritten -= 1;
    }

    placeWordOnCanvas() {
        const word = CommandParsing.removeAccents(this.buttonPressed);
        this.gameContextService.attemptTempRackUpdate(word);
        this.gridService.letterWritten += 1;
        const item = this.gridService.rack.find((i) => i.name === word.toUpperCase() && word.toLowerCase() === word);
        if (item === undefined) this.gridService.letters.push({ name: '*', score: 0 });
        else this.gridService.letters.push(item);
        this.gridService.letterForServer += word;
        if (this.gridService.letters.length === 1)
            this.gridService.firstLetter = [
                Math.ceil(this.mouseDetectService.mousePosition.x / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
                Math.ceil(this.mouseDetectService.mousePosition.y / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
            ];
        this.gridService.tempUpdateBoard(
            word,
            Math.ceil(this.mouseDetectService.mousePosition.y / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
            Math.ceil(this.mouseDetectService.mousePosition.x / CANVAS_SQUARE_SIZE) - ADJUSTMENT,
            this.mouseDetectService.isHorizontal,
        );
        const lastLetter = this.gridService.letterPosition[this.gridService.letterPosition.length - 1];
        if (
            (this.getShift(lastLetter) + lastLetter[1] < POS_AND_SHIFT && this.mouseDetectService.isHorizontal) ||
            (this.getShift(lastLetter) + lastLetter[0] < POS_AND_SHIFT && !this.mouseDetectService.isHorizontal)
        )
            this.drawShiftedArrow(lastLetter, this.getShift(lastLetter));
        this.gameContextService.tempUpdateRack();
    }

    drawShiftedArrow(pos: number[], shift: number) {
        if (this.mouseDetectService.isHorizontal)
            this.gridService.drawArrow((pos[1] + shift) * CANVAS_SQUARE_SIZE, this.mouseDetectService.mousePosition.y, true);
        else this.gridService.drawArrow(this.mouseDetectService.mousePosition.x, (pos[0] + shift) * CANVAS_SQUARE_SIZE, false);
    }
    isInBound() {
        return (
            (this.mouseDetectService.isHorizontal &&
                this.mouseDetectService.mousePosition.x + this.gridService.letters.length * CANVAS_SQUARE_SIZE <= PLAY_AREA_SIZE) ||
            (!this.mouseDetectService.isHorizontal &&
                this.mouseDetectService.mousePosition.y + this.gridService.letters.length * CANVAS_SQUARE_SIZE <= PLAY_AREA_SIZE)
        );
    }

    getShift(pos: number[]): number {
        const board = this.gameContextService.state.value.board;
        let shift = 2;
        const horizontal = this.mouseDetectService.isHorizontal;
        let y = horizontal ? pos[0] : pos[0] + 1;
        let x = horizontal ? pos[1] + 1 : pos[1];
        while (y !== BOARD_SIZE && board[y][x]) {
            if (horizontal) x++;
            else y++;
            shift++;
        }
        return shift;
    }
    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawGrid();
        this.gridCanvas.nativeElement.focus();
        this.isLoaded = true;
    }
    ngAfterViewChecked() {
        if (!this.myTurn) this.removeWord();
    }
    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
}
