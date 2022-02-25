import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
    letterWrited = 0;
    // eslint-disable-next-line no-invalid-this
    mousePosition = this.mouseDetectService.mousePosition;
    private isLoaded = false;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(private readonly gridService: GridService, private gameContextService: GameContextService, public mouseDetectService: MouseService) {
        this.gameContextService.state.subscribe(() => {
            if (this.isLoaded) this.gridService.drawGrid();
        });
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;
        if (this.mouseDetectService.writingAllowed) {
            this.gridService.drawTempTiles(
                this.buttonPressed,
                this.mouseDetectService.mousePosition.x + (this.letterWrited * 100) / 3,
                this.mouseDetectService.mousePosition.y,
            );
            this.letterWrited += 1;
            if (this.buttonPressed === 'Enter') {
                this.letterWrited = 0;
                this.gridService.drawGrid();
            }
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
