import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { LetterRackComponent } from './letter-rack.component';

describe('LetterRackComponent', () => {
    let component: LetterRackComponent;
    let fixture: ComponentFixture<LetterRackComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterRackComponent],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LetterRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.letters = [
            { name: 'a', score: 1 },
            { name: 'b', score: 1 },
            { name: 'c', score: 1 },
            { name: 'd', score: 1 },
            { name: 'e', score: 1 },
            { name: 'f', score: 1 },
            { name: 'f', score: 1 },
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ArrowLeft and ArrowRight event should call shiftLetter()', () => {
        const shiftLetterSpy = spyOn(component, 'shiftLetter').and.callThrough();
        const keypress = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        component.buttonDetect(keypress);
        expect(shiftLetterSpy).toHaveBeenCalled();

        const keypress2 = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        component.buttonDetect(keypress2);
        expect(shiftLetterSpy).toHaveBeenCalled();
    });

    it('pressing a letter in rack should call setToManipulate', () => {
        const setToManipulateSpy = spyOn(component, 'setToManipulate').and.callThrough();
        const keypress = new KeyboardEvent('keydown', { key: 'b' });
        component.buttonDetect(keypress);
        expect(setToManipulateSpy).toHaveBeenCalled();
    });

    it('scrolling mouse should call shiftLetter', () => {
        const shiftLetterSpy = spyOn(component, 'shiftLetter').and.callThrough();
        const mouseWheel = new WheelEvent('scroll');
        component.scrollDetect(mouseWheel);
        expect(shiftLetterSpy).toHaveBeenCalled();
    });

    // it('swap letter position to the right if ArrowRight pressed and letter is set to manipulate', async () => {
    //     window.addEventListener('load', () => {
    //         const container = document.getElementsByClassName('letter-container');
    //         Array.from(container)[0].setAttribute('id', 'manipulating');
    //         component.shiftLetter('ArrowRight');
    //         expect(component.letters[1]).toBe({ name: 'a', score: 1 });
    //         expect(component.letters[0]).toBe({ name: 'b', score: 1 });
    //     });
    // });

    // it('swap letter position to the left if ArrowLeft pressed and letter is set to manipulate', async () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     Array.from(container)[1].setAttribute('id', 'manipulating');
    //     component.shiftLetter('ArrowLeft');
    //     expect(component.letters[0]).toBe({ name: 'b', score: 1 });
    //     expect(component.letters[1]).toBe({ name: 'a', score: 1 });
    // });

    // it('if letter position is at the end of rack, swap letter to the first position on ArrowRight pressed', async () => {
    //     window.addEventListener('load', () => {
    //         const container = document.getElementsByClassName('letter-container');
    //         Array.from(container)[6].setAttribute('id', 'manipulating');
    //         component.shiftLetter('ArrowRight');
    //         expect(component.letters[0]).toBe({ name: 'f', score: 1 });
    //         expect(component.letters[6]).toBe({ name: 'f', score: 1 });
    //     });
    // });

    // it('if letter is in first position of rack, swap letter to the last position on ArrowLeft pressed', async () => {
    //     window.addEventListener('load', () => {
    //         const container = document.getElementsByClassName('letter-container');
    //         Array.from(container)[0].setAttribute('id', 'manipulating');
    //         component.shiftLetter('ArrowLeft');
    //         expect(component.letters[0]).toBe({ name: 'b', score: 1 });
    //         expect(component.letters[6]).toBe({ name: 'a', score: 1 });
    //     });
    // });
});
