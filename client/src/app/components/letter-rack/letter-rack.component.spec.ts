import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { LetterRackComponent } from './letter-rack.component';

const setHTML = () => {
    const element = document.createElement('div');
    element.classList.add('letter-container');
    const element2 = document.createElement('div');
    element2.classList.add('letter-container');
    const element3 = document.createElement('div');
    element3.classList.add('letter-container');
    const element4 = document.createElement('div');
    element4.classList.add('letter-container');
    const element5 = document.createElement('div');
    element5.classList.add('letter-container');
    const element6 = document.createElement('div');
    element6.classList.add('letter-container');
    const element7 = document.createElement('div');
    element7.classList.add('letter-container');
    document.body.appendChild(element);
    document.body.appendChild(element2);
    document.body.appendChild(element3);
    document.body.appendChild(element4);
    document.body.appendChild(element5);
    document.body.appendChild(element6);
    document.body.appendChild(element7);

    const child1 = document.createElement('div');
    child1.classList.add('letter-name');
    const child2 = document.createElement('div');
    child2.classList.add('letter-name');
    const child3 = document.createElement('div');
    child3.classList.add('letter-name');
    const child4 = document.createElement('div');
    child4.classList.add('letter-name');
    const child5 = document.createElement('div');
    child5.classList.add('letter-name');
    const child6 = document.createElement('div');
    child6.classList.add('letter-name');
    const child7 = document.createElement('div');
    child7.classList.add('letter-name');

    element.appendChild(child1);
    element2.appendChild(child2);
    element3.appendChild(child3);
    element4.appendChild(child4);
    element5.appendChild(child5);
    element6.appendChild(child6);
    element7.appendChild(child7);
};

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

        setHTML();

        fixture.detectChanges();
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

    it('swap letter position to the right if ArrowRight pressed and letter is set to manipulate', () => {
        const container = document.getElementsByClassName('letter-container');
        Array.from(container)[0].setAttribute('id', 'manipulating');
        component.shiftLetter('ArrowRight');
        expect(component.letters[1]).toEqual({ name: 'a', score: 1 });
        expect(component.letters[0]).toEqual({ name: 'b', score: 1 });
    });

    // it('swap letter position to the left if ArrowLeft pressed and letter is set to manipulate', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     Array.from(container)[1].setAttribute('id', 'manipulating');
    //     component.shiftLetter('ArrowLeft');
    //     expect(component.letters[0]).toEqual({ name: 'b', score: 1 });
    //     expect(component.letters[1]).toEqual({ name: 'a', score: 1 });
    // });

    // it('if letter position is at the end of rack, swap letter to the first position on ArrowRight pressed', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     Array.from(container)[6].setAttribute('id', 'manipulating');
    //     component.shiftLetter('ArrowRight');
    //     expect(component.letters[0]).toEqual({ name: 'f', score: 1 });
    //     expect(component.letters[6]).toEqual({ name: 'f', score: 1 });
    // });

    // it('if letter is in first position of rack, swap letter to the last position on ArrowLeft pressed', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     Array.from(container)[0].setAttribute('id', 'manipulating');
    //     component.shiftLetter('ArrowLeft');
    //     expect(component.letters[0]).toEqual({ name: 'b', score: 1 });
    //     expect(component.letters[6]).toEqual({ name: 'a', score: 1 });
    // });

    // it('should set letter pressed to manipulation mode', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     component.setToManipulate('a', 0);
    //     console.log(container[0]);
    //     expect(Array.from(container)[0].getAttribute('id')).toBe('manipulating');
    // });
});
