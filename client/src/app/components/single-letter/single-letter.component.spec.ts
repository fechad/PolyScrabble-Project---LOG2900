import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleLetterComponent } from './single-letter.component';

describe('SingleLetterComponent', () => {
    let component: SingleLetterComponent;
    let fixture: ComponentFixture<SingleLetterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SingleLetterComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SingleLetterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
