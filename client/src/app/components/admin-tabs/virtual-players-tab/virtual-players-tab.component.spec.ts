import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualPlayersTabComponent } from './virtual-players-tab.component';

describe('VirtualPlayersTabComponent', () => {
    let component: VirtualPlayersTabComponent;
    let fixture: ComponentFixture<VirtualPlayersTabComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [VirtualPlayersTabComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(VirtualPlayersTabComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
