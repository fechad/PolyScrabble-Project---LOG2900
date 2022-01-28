import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LetterRackComponent } from './letter-rack.component';

describe('LetterRackComponent', () => {
    let component: LetterRackComponent;
    let fixture: ComponentFixture<LetterRackComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterRackComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LetterRackComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
