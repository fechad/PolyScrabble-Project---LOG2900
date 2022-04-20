import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule, routes } from '@app/modules/app-routing.module';
import { LetterRackComponent } from './letter-rack.component';

const setHTML = () => {
    const page = document.createElement('div');
    const rackContainer = document.createElement('div');
    rackContainer.classList.add('rack-container');

    const canvas = document.createElement('div');
    canvas.id = 'canvas';
    rackContainer.appendChild(canvas);

    const chatbox = document.createElement('div');
    chatbox.id = 'writingBox';
    canvas.appendChild(chatbox);

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
            { name: 'e', score: 1 },
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
        const keypress = new KeyboardEvent('keydown', { key: 'a' });
        component.buttonDetect(keypress);
        component.shiftLetter('ArrowRight');
        expect(component.manipulating).toEqual(1);
    });

    it('swap letter position to the left if ArrowLeft pressed and letter is set to manipulate', () => {
        const keypress = new KeyboardEvent('keydown', { key: 'b' });
        component.buttonDetect(keypress);
        component.shiftLetter('ArrowLeft');
        expect(component.manipulating).toEqual(0);
    });

    it('if letter position is at the end of rack, swap letter to the first position on ArrowRight pressed', () => {
        const LAST = 6;
        const keypress = new KeyboardEvent('keydown', { key: 'a' });
        component.buttonDetect(keypress);
        component.shiftLetter('ArrowLeft');
        expect(component.manipulating).toEqual(LAST);
    });

    it('if letter is in first position of rack, swap letter to the last position on ArrowLeft pressed', () => {
        const keypress = new KeyboardEvent('keydown', { key: 'f' });
        component.buttonDetect(keypress);
        component.shiftLetter('ArrowRight');
        expect(component.manipulating).toEqual(0);
    });

    it('exchange should call communicationService exchange', () => {
        const exchangeSpy = spyOn(component.gameContextService, 'executeCommand').and.callThrough();
        component.exchange();
        expect(exchangeSpy).toHaveBeenCalled();
    });

    it('should not assign index to manipulating if key is not in rack', () => {
        const keypress = new KeyboardEvent('keydown', { key: 'p' });
        component.buttonDetect(keypress);
        expect(component.manipulating).toBeUndefined();
    });

    it('should select second occurrence of letter if keypress is the same letter two times in a row', () => {
        const INDEX = 4;
        const keypress = new KeyboardEvent('keydown', { key: 'e' });
        component.buttonDetect(keypress);
        expect(component.manipulating).toEqual(INDEX);
        component.buttonDetect(keypress);
        expect(component.manipulating).toEqual(INDEX + 1);
    });

    it('should select the letter clicked on to be manipulated and remove all selection for exchange', () => {
        component.manipulate(0);
        expect(component.manipulating).toEqual(0);
        expect(component.exchanging).toEqual([]);
    });

    it('click should not set to manipulate if letter is already set for exchange', () => {
        component.exchanging = [0];
        component.manipulate(0);
        expect(component.exchanging).toEqual([0]);
        expect(component.manipulating).toBeUndefined();
    });

    it('should do nothing if no letter was selected to be manipulated', () => {
        const updateSpy = spyOn(component, 'swapLetters').and.callThrough();
        component.manipulating = undefined;
        component.shiftLetter('z');
        expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should assign index of letter to exchanging if right clicked on', () => {
        component.select(0);
        expect(component.exchanging).toEqual([0]);
        component.select(2);
        expect(component.exchanging).toEqual([0, 2]);
    });

    it('should remove index of letter of exchanging if was already set to exchange', () => {
        component.select(0);
        expect(component.exchanging).toEqual([0]);
        component.select(1);
        component.select(0);
        expect(component.exchanging).toEqual([1]);
    });

    it('getReserveCount should return a boolean', () => {
        const reserveStatus = component.getReserveCount();
        expect(typeof reserveStatus).toBe('boolean');
    });

    it('click should call manipulate', () => {
        const container = document.getElementsByClassName('letter-container');
        container[0].addEventListener('click', () => component.manipulate(0));
        const manipulateSPy = spyOn(component, 'manipulate').and.callThrough();
        const mockClick = new MouseEvent('click');
        container[0].dispatchEvent(mockClick);
        expect(manipulateSPy).toHaveBeenCalled();
    });

    it('right click should call exchange', () => {
        const container = document.getElementsByClassName('letter-container');
        container[0].addEventListener('contextmenu', () => component.exchange());
        const menuSpy = spyOn(component, 'exchange').and.callThrough();
        const mockRightClick = new MouseEvent('contextmenu');
        container[0].dispatchEvent(mockRightClick);
        expect(menuSpy).toHaveBeenCalled();
        container[0].removeEventListener('contextmenu', component.exchange);
    });

    it('clear should clear every selection', () => {
        const clearSelectionSpy = spyOn(component, 'clear').and.callThrough();
        const mockClick = new MouseEvent('click');
        component.clear(mockClick);
        expect(clearSelectionSpy).toHaveBeenCalled();
        expect(component.manipulating).toBeUndefined();
        expect(component.exchanging).toEqual([]);
    });

    it('clear should not clear selection', () => {
        const container = document.getElementsByClassName('letter-container');
        container[0].addEventListener('click', () => component.manipulate(0));
        const mockClick = new MouseEvent('click');
        container[0].dispatchEvent(mockClick);
        expect(component.manipulating).toEqual(0);
        container[0].dispatchEvent(mockClick);
        expect(component.manipulating).toEqual(0);
    });

    it('should not select any letter on keypress if focus is on canvas', () => {
        const canvas = document.getElementById('canvas');
        canvas?.focus();
        const keypress = new KeyboardEvent('keydown', { key: 'e' });
        canvas?.addEventListener('click', () => component.buttonDetect(keypress));
        expect(component.manipulating).toBeUndefined();
    });

    it('should not select any letter on keypress if focus is on chatbox', () => {
        const chat = document.getElementById('writingBox');
        chat?.focus();
        const keypress = new KeyboardEvent('keydown', { key: 'e' });
        chat?.addEventListener('click', () => component.buttonDetect(keypress));
        expect(component.manipulating).toBeUndefined();
    });

    it('checkOccurrences should return all indices of present keypress', () => {
        const FIRST_IDX = 4;
        const SECOND_IDX = 5;
        const result = component.checkOccurrences('e');
        expect(result).toEqual([FIRST_IDX, SECOND_IDX]);
    });

    it('checkOccurrences should have no index if no occurrence was found', () => {
        const result = component.checkOccurrences('z');
        expect(result.length).toEqual(0);
    });

    it('should return first occurrence of letter if keypress of a letter in rack', () => {
        const keypress = new KeyboardEvent('keydown', { key: 'c' });
        const index = component.checkOccurrences(keypress.key);
        component.buttonDetect(keypress);
        expect(component.manipulating).toEqual(index[0]);
    });

    it('should not detect letter pressed if clicked in chat box textarea', () => {
        const checkOccurrencesSpy = spyOn(component, 'checkOccurrences').and.callThrough();
        const chatBox = document.getElementById('writingBox');
        const keypress = new KeyboardEvent('keydown', { key: 'c' });
        chatBox?.addEventListener('keydown', () => component.buttonDetect(keypress));
        chatBox?.dispatchEvent(keypress);
        expect(checkOccurrencesSpy).not.toHaveBeenCalled();
    });

    it('should return manipulated rack in new order', () => {
        const keypress = new KeyboardEvent('keydown', { key: 'c' });
        component.buttonDetect(keypress);
        component.shiftLetter('ArrowLeft');
        expect(component.letters).toEqual([
            { name: 'a', score: 1 },
            { name: 'c', score: 1 },
            { name: 'b', score: 1 },
            { name: 'd', score: 1 },
            { name: 'e', score: 1 },
            { name: 'e', score: 1 },
            { name: 'f', score: 1 },
        ]);
    });
});
