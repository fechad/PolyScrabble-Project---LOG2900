import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassicModesPageComponent } from './classic-modes-page.component';

describe('ClassicModesPageComponent', () => {
    let component: ClassicModesPageComponent;
    let fixture: ComponentFixture<ClassicModesPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ClassicModesPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ClassicModesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
