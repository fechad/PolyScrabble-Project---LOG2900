import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { GameContextService } from '@app/services/game-context.service';
import { GridService } from '@app/services/grid.service';
import { MouseService } from '@app/services/mouse.service';

// TODO : Avoir un fichier séparé pour les constantes!
export const DEFAULT_WIDTH = 525;
export const DEFAULT_HEIGHT = 525;

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
    // eslint-disable-next-line no-invalid-this
    mousePosition = this.mouseDetectService.mousePosition;
    rack: string[] = [];
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
        this.gameContextService.rack.subscribe((rack) => {
            for (const i of rack) {
                if (this.rack.length <= 7) this.rack.push(i.name);
            }
        });
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if (this.buttonPressed === 'Enter') {
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
