import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridService } from '@app/services/grid.service';

describe('GridService', () => {
    let service: GridService;
    let ctxStub: CanvasRenderingContext2D;
    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
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
        service.drawMessage('test', 0, 0);
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
        service.drawMessage(message, 0, 0);
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

    it('bonusConditions should call drawTripleWord 8 times', () => {
        const drawTripleWordSpy = spyOn(service, 'drawTripleWord').and.callThrough();
        service.drawGrid();
        expect(drawTripleWordSpy).toHaveBeenCalledTimes(8);
    });
    it('bonusConditions should call drawTripleLetter 12 times', () => {
        const drawTripleLetterSpy = spyOn(service, 'drawTripleLetter').and.callThrough();
        service.drawGrid();
        expect(drawTripleLetterSpy).toHaveBeenCalledTimes(12);
    });
    it('bonusConditions should call drawDoubleWord 17 times', () => {
        const drawDoubleWordSpy = spyOn(service, 'drawDoubleWord').and.callThrough();
        service.drawGrid();
        expect(drawDoubleWordSpy).toHaveBeenCalledTimes(16);
    });
    it('bonusConditions should call drawDoubleLetter 24 times', () => {
        const drawDoubleLetterSpy = spyOn(service, 'drawDoubleLetter').and.callThrough();
        service.drawGrid();
        expect(drawDoubleLetterSpy).toHaveBeenCalledTimes(24);
    });

    it('bonusConditions should call drawStar 1 time', () => {
        const drawStarSpy = spyOn(service, 'drawStar').and.callThrough();
        service.drawGrid();
        expect(drawStarSpy).toHaveBeenCalledTimes(1);
    });
});
