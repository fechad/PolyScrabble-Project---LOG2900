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
    // eslint-disable-next-line no-invalid-this
    mousePosition = this.mouseDetectService.mousePosition;
    rack: string[] = [];
    private isLoaded = false;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(private readonly gridService: GridService, private gameContextService: GameContextService, public mouseDetectService: MouseService) {
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
            this.rack.push(this.gridService.letters[this.gridService.letters.length - 1].toUpperCase());
            this.gridService.letters.pop();
            this.gridService.drawGrid();
            for (let i = 0; i < this.gridService.letters.length; i++) {
                this.drawRightDirection(this.gridService.letters[i], i);
            }
        } else if (
            this.mouseDetectService.writingAllowed &&
            this.mouseDetectService.mousePosition.x + (this.gridService.letters.length * 100) / 3 <= 520 &&
            this.mouseDetectService.isHorizontal &&
            this.isInTempRack(this.buttonPressed)
        ) {
            this.drawRightDirection(this.buttonPressed, this.gridService.letters.length);
            this.gridService.letters.push(this.buttonPressed);
        } else if (
            this.mouseDetectService.writingAllowed &&
            this.mouseDetectService.mousePosition.y + (this.gridService.letters.length * 100) / 3 <= 520 &&
            !this.mouseDetectService.isHorizontal &&
            this.isInTempRack(this.buttonPressed)
        ) {
            this.drawRightDirection(this.buttonPressed, this.gridService.letters.length);
            this.gridService.letters.push(this.buttonPressed);
        }
    }

    drawRightDirection(letter: string, pos: number) {
        if (this.mouseDetectService.isHorizontal) {
            this.gridService.drawTempTiles(
                letter,
                this.mouseDetectService.mousePosition.x + (pos * 100) / 3,
                this.mouseDetectService.mousePosition.y,
            );
        } else {
            this.gridService.drawTempTiles(
                letter,
                this.mouseDetectService.mousePosition.x,
                this.mouseDetectService.mousePosition.y + (pos * 100) / 3,
            );
        }
    }

    isInTempRack(letter: string) {
        for (let i = 0; i < this.rack.length; i++) {
            if (this.rack[i] === letter.toUpperCase()) {
                console.log(this.rack);
                this.rack.splice(i, 1);
                return true;
            }
        }
        return false;
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
