import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { CommunicationService } from '@app/services/communication.service';
import { LetterRackComponent } from './letter-rack.component';

const setHTML = () => {
    document.body.innerHTML = '';
    const page = document.createElement('div');
    const rackContainer = document.createElement('div');
    rackContainer.classList.add('rack-container');

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
    rackContainer.appendChild(element);
    rackContainer.appendChild(element2);
    rackContainer.appendChild(element3);
    rackContainer.appendChild(element4);
    rackContainer.appendChild(element5);
    rackContainer.appendChild(element6);
    rackContainer.appendChild(element7);

    const child1 = document.createElement('div');
    child1.classList.add('letter-name');
    child1.textContent = 'a';
    const child2 = document.createElement('div');
    child2.classList.add('letter-name');
    child2.textContent = 'b';
    const child3 = document.createElement('div');
    child3.classList.add('letter-name');
    child3.textContent = 'c';
    const child4 = document.createElement('div');
    child4.classList.add('letter-name');
    child4.textContent = 'd';
    const child5 = document.createElement('div');
    child5.classList.add('letter-name');
    child5.textContent = 'e';
    const child6 = document.createElement('div');
    child6.classList.add('letter-name');
    child6.textContent = 'f';
    const child7 = document.createElement('div');
    child7.classList.add('letter-name');
    child7.textContent = 'g';

    element.appendChild(child1);
    element2.appendChild(child2);
    element3.appendChild(child3);
    element4.appendChild(child4);
    element5.appendChild(child5);
    element6.appendChild(child6);
    element7.appendChild(child7);

    page.appendChild(rackContainer);
    document.body.appendChild(page);
};

describe('LetterRackComponent', () => {
    let component: LetterRackComponent;
    let fixture: ComponentFixture<LetterRackComponent>;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    /*
    const menu = document.createElement('div');
    menu.classList.add('context-menu');
    menu.id = 'menu';

    const button1 = document.createElement('button');
    button1.id = 'exchange';
    button1.addEventListener('click', () => component.exchange());

    const button2 = document.createElement('button');
    button2.id = 'cancel';
    button2.addEventListener('click', () => component.hideMenu()); */

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterRackComponent],
            imports: [HttpClientTestingModule, RouterTestingModule.withRoutes(routes), HttpClientModule, AppRoutingModule],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
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

    it('pressing a letter assign value to manipulating if letter is in rack', () => {
        const keypress = new KeyboardEvent('keydown', { key: 'b' });
        component.buttonDetect(keypress);
        expect(component.manipulating).not.toBeUndefined();
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

    it('swap letter position to the left if ArrowLeft pressed and letter is set to manipulate', () => {
        const container = document.getElementsByClassName('letter-container');
        Array.from(container)[1].setAttribute('id', 'manipulating');
        component.shiftLetter('ArrowLeft');
        expect(component.letters[0]).toEqual({ name: 'b', score: 1 });
        expect(component.letters[1]).toEqual({ name: 'a', score: 1 });
    });

    it('if letter position is at the end of rack, swap letter to the first position on ArrowRight pressed', () => {
        const container = document.getElementsByClassName('letter-container');
        Array.from(container)[6].setAttribute('id', 'manipulating');
        component.shiftLetter('ArrowRight');
        expect(component.letters[0]).toEqual({ name: 'f', score: 1 });
        expect(component.letters[6]).toEqual({ name: 'f', score: 1 });
    });

    it('if letter is in first position of rack, swap letter to the last position on ArrowLeft pressed', () => {
        const container = document.getElementsByClassName('letter-container');
        Array.from(container)[0].setAttribute('id', 'manipulating');
        component.shiftLetter('ArrowLeft');
        expect(component.letters[0]).toEqual({ name: 'b', score: 1 });
        expect(component.letters[6]).toEqual({ name: 'a', score: 1 });
    });

    it('should set letter pressed to manipulation mode', () => {
        const container = document.getElementsByClassName('letter-container');
        const keypress = new KeyboardEvent('keydown', { key: 'a' });
        component.buttonDetect(keypress);
        expect(Array.from(container)[0].getAttribute('id')).toBe('manipulating');
    });

    // it('exchange should call communicationService exchange', () => {
    //     const spy = spyOn(component, 'getSelectedLetters').and.callThrough();
    //     component.exchange();
    //     expect(spy).toHaveBeenCalled();
    // });

    // it('should exchange a selected letter', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     const exchangeSpy = spyOn(component.communicationService, 'exchange').and.callThrough();
    //     container[0].setAttribute('id', 'selected');
    //     component.exchange();
    //     expect(exchangeSpy).toHaveBeenCalled();
    // });

    // it('getSelectedLetters should update the list of selectedLetters', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     container[0].setAttribute('id', 'selected');
    //     expect(component.selectedLetters.length).toBe(0);
    //     component.getSelectedLetters();
    //     expect(component.selectedLetters.length).toBe(1);
    //     expect(component.selectedLetters[0]).toBe('a');
    // });

    // it('checkSelection should not call hideMenu if letters are selected', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     const hideMenuSpy = spyOn(component, 'hideMenu').and.callThrough();
    //     container[2].setAttribute('id', 'selected');
    //     component.checkSelection();
    //     expect(hideMenuSpy).not.toHaveBeenCalled();
    // });

    // it('checkSelection should call hideMenu if no letters are selected', () => {
    //     component.clearSelection('exchange');
    //     const hideMenuSpy = spyOn(component, 'hideMenu').and.callThrough();
    //     component.checkSelection();
    //     expect(hideMenuSpy).toHaveBeenCalled();
    // });

    // it('getReserveCount should return a boolean', () => {
    //     const reserveStatus = component.getReserveCount();
    //     expect(typeof reserveStatus).toBe('boolean');
    // });

    // it('clearSelection should remove all letter selection ids', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     container[1].setAttribute('id', 'selected');
    //     container[0].setAttribute('id', 'manipulating');
    //     component.clearSelection('exchange');
    //     component.clearSelection('manipulate');
    //     let everythingIsCleared = true;
    //     Array.from(container).forEach((letter) => {
    //         if (letter.getAttribute('id') === 'selected' || letter.getAttribute('id') === 'manipulating') {
    //             everythingIsCleared = false;
    //         }
    //     });
    //     expect(everythingIsCleared).toBeTrue();
    // });

    // it('clear should clear every selection', () => {
    //     const clearSelectionSPy = spyOn(component, 'clearSelection').and.callThrough();
    //     const mockClick = new MouseEvent('click');
    //     component.clear(mockClick);
    //     expect(clearSelectionSPy).toHaveBeenCalledTimes(2);
    // });

    // it('click should call manipulate', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     container[0].addEventListener('click', (event) => component.manipulate(event));
    //     const manipulateSPy = spyOn(component, 'manipulate').and.callThrough();
    //     const mockClick = new MouseEvent('click');
    //     container[0].dispatchEvent(mockClick);
    //     expect(manipulateSPy).toHaveBeenCalled();
    //     container[0].removeEventListener('click', component.manipulate);
    // });

    // it('rightClick should call menu', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     container[0].addEventListener('contextmenu', (event) => component.menu(event));
    //     const menuSPy = spyOn(component, 'menu').and.callThrough();
    //     const mockRightClick = new MouseEvent('contextmenu');
    //     container[0].dispatchEvent(mockRightClick);
    //     expect(menuSPy).toHaveBeenCalled();
    //     container[0].removeEventListener('contextmenu', component.menu);
    // });

    // it('click on a selected letter for manipulation should remove selection id', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     container[0].setAttribute('id', 'manipulating');
    //     container[0].addEventListener('click', (event) => component.manipulate(event));
    //     const mockClick = new MouseEvent('click');
    //     container[0].dispatchEvent(mockClick);
    //     component.menu(mockClick);
    //     expect(container[0].getAttribute('id')).toEqual(null);
    //     container[0].removeEventListener('click', component.menu);
    // });

    // it('rightClick on a selected letter for exchange should remove selection id', () => {
    //     const container = document.getElementsByClassName('letter-container');
    //     container[0].setAttribute('id', 'selected');
    //     container[0].addEventListener('contextmenu', (event) => component.menu(event));
    //     const mockRightClick = new MouseEvent('contextmenu');
    //     container[0].dispatchEvent(mockRightClick);
    //     component.menu(mockRightClick);
    //     expect(container[0].getAttribute('id')).toEqual(null);
    //     container[0].removeEventListener('contextmenu', component.menu);
    // });
});
