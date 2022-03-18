import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { Subject } from 'rxjs';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayAreaComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        component.sent = new Subject<void>();
        component.sent.subscribe();
        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('buttonDetect should modify the buttonPressed variable', () => {
        const keyDetectSpy = spyOn(component, 'buttonDetect');
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });
    it('press enter should send letter to server', () => {
        const keyDetectSpy = spyOn(component, 'sendPlacedLetters');
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });

    it('press enter should try to place letter in the board server side', () => {
        const keyDetectSpy = spyOn(component.communicationservice, 'place');
        const expectedKey = 'Enter';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });

    it('removing a letter should draw a new arrow', () => {
        const keyDetectSpy = spyOn(component, 'drawShiftedArrow');
        component.removeLetterOnCanvas();
        expect(keyDetectSpy).toHaveBeenCalled();
    });

    it('typing an allowed letter should place the letter', () => {
        const keyDetectSpy = spyOn(component, 'placeWordOnCanvas');
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        spyOn(component, 'isInBound').and.callFake(() => {
            return true;
        });
        component.buttonDetect(buttonEvent);
        expect(keyDetectSpy).toHaveBeenCalled();
    });

    it('typing an allowed letter should remove it from the rack', () => {
        const keyDetectSpy = spyOn(component.gameContextService, 'tempUpdateRack');
        component.placeWordOnCanvas();
        expect(keyDetectSpy).toHaveBeenCalled();
    });
    it('isInbound should return true if the letter fit inside the board', () => {
        component.mouseDetectService.isHorizontal = true;
        component.mouseDetectService.mousePosition = { x: 100, y: 520 };
        component.gridService.letters = [{ name: 'a', score: 1 }];
        let result = component.isInBound();
        expect(result).toEqual(true);
        component.mouseDetectService.isHorizontal = false;
        result = component.isInBound();
        expect(result).toEqual(false);
    });
});
