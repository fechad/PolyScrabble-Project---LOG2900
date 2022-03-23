import { TestBed } from '@angular/core/testing';
import { GridService } from '@app/services/grid.service';
import { GameContextService } from './game-context.service';
export class CanvasTestHelper {
    static createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}

const CALL_NUMBER = 61;
describe('GridService', () => {
    let service: GridService;
    let gameContext: GameContextService;
    let ctxStub: CanvasRenderingContext2D;
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;
    const ORIGIN = 0;
    const POLICE_SIZE = 9;
    const H7H_INDEX = 7;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);
        gameContext = TestBed.inject(GameContextService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
        service.tempUpdateBoard('a', H7H_INDEX, H7H_INDEX, true);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_WIDTH);
    });

    it(' height should return the height of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_HEIGHT);
    });

    it(' drawWord should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawWord('test');
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawMessage should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawMessage('test', ORIGIN, ORIGIN, POLICE_SIZE);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawWord should not call fillText if word is empty', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawWord('');
        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });

    it(' drawWord should call fillText as many times as letters in a word', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const word = 'test';
        service.drawWord(word);
        expect(fillTextSpy).toHaveBeenCalledTimes(word.length);
    });

    it(' drawMessage should call fillText as many times as words in a message', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const message = 'test';
        service.drawMessage(message, ORIGIN, ORIGIN, POLICE_SIZE);
        expect(fillTextSpy).toHaveBeenCalledTimes(message.split(' ').length);
    });

    it(' drawWord should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawWord('test');
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawNumbers should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawNumbers('1 2 3');
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawNumbers should draw as much numbers as given to it', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        const testNumbers = '1 2 3 4 5 10 11 12';
        service.drawNumbers(testNumbers);
        expect(fillTextSpy).toHaveBeenCalledTimes(testNumbers.split(' ').length);
    });

    it(' drawGrid should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('bonusConditions should call drawBonus 61 times', () => {
        const drawTripleWordSpy = spyOn(service, 'drawBonus').and.callThrough();
        service.drawGrid();
        expect(drawTripleWordSpy).toHaveBeenCalledTimes(CALL_NUMBER);
    });

    it('should not place two times the same letter', () => {
        service.tempUpdateBoard('V', H7H_INDEX, H7H_INDEX, true);
        service.tempUpdateBoard('Q', H7H_INDEX, H7H_INDEX, true);
        expect(gameContext.state.value.board[H7H_INDEX][H7H_INDEX]?.name).toBe('A');
    });
});
