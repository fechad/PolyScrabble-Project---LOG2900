import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommandParsing } from '@app/classes/command-parsing';
import { State } from '@app/classes/room';
import * as cst from '@app/constants';
import { GameContextService, MessageType } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';
import { MouseService } from '@app/services/mouse.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
    @Input() sent: Subject<void>;
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;
    buttonPressed = '';
    rack: string[] = [];
    shift: number[] = [];
    myTurn = false;
    private isLoaded = false;
    private canvasSize = { x: cst.DEFAULT_WIDTH, y: cst.DEFAULT_HEIGHT };

    constructor(
        public gridService: GridService,
        public gameContextService: GameContextService,
        public mouseDetectService: MouseService,
        private placeLetterService: PlaceLetterService,
    ) {
        this.gameContextService.state.subscribe(() => {
            if (this.isLoaded) this.gridService.drawGrid();
        });
        this.gameContextService.rack.subscribe((rack) => {
            for (const i of rack) {
                if (this.rack.length <= cst.MAX_RACK_SIZE) this.rack.push(i.name);
            }
        });
        this.gameContextService.isMyTurn().subscribe((bool) => {
            this.myTurn = bool;
        });
    }

    @HostListener('document:click', ['$event'])
    click(event: MouseEvent) {
        if (this.gridCanvas.nativeElement !== event.target && this.myTurn) {
            this.placeLetterService.removeWord();
        }
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        if (!this.myTurn || this.gameContextService.state.value.state !== State.Started) return;
        this.buttonPressed = event.key;
        switch (this.buttonPressed) {
            case 'Enter':
                if (this.gridService.letterForServer.length === 0) {
                    this.gameContextService.addMessage("Vous n'avez placé aucune lettre sur le plateau de jeu", MessageType.Local);
                } else {
                    this.placeLetterService.sendPlacedLetters();
                }
                break;
            case 'Backspace':
                if (this.gridService.letters.length > 0) this.placeLetterService.removeLetterOnCanvas();
                break;
            case 'Escape':
                this.placeLetterService.removeWord();
                (document.activeElement as HTMLElement).blur();
                break;
            default:
                if (this.isInBound() && this.buttonPressed.match(/[A-Za-zÀ-ú]/g)?.length === 1) {
                    try {
                        const word = CommandParsing.removeAccents(this.buttonPressed);
                        this.placeLetterService.placeWordOnCanvas(word);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } catch (e: any) {
                        this.gameContextService.addMessage(e.message, MessageType.Local);
                    }
                }
        }
    }

    ngOnInit() {
        this.sent.subscribe(() => {
            if (this.myTurn) this.placeLetterService.sendPlacedLetters();
        });
    }

    isInBound() {
        return (
            (this.mouseDetectService.isHorizontal &&
                this.mouseDetectService.mousePosition.x + this.gridService.letters.length * cst.CANVAS_SQUARE_SIZE <= cst.PLAY_AREA_SIZE) ||
            (!this.mouseDetectService.isHorizontal &&
                this.mouseDetectService.mousePosition.y + this.gridService.letters.length * cst.CANVAS_SQUARE_SIZE <= cst.PLAY_AREA_SIZE)
        );
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawGrid();
        this.gridCanvas.nativeElement.focus();
        this.isLoaded = true;
    }

    ngAfterViewChecked(): void {
        if (!this.myTurn) this.placeLetterService.removeWord();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    ngOnDestroy() {
        this.sent.unsubscribe();
    }
}
