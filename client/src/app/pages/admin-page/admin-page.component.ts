import { Component, ElementRef, ViewChild } from '@angular/core';
import { faHome, faSync } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    @ViewChild('tabs') tabsRef: ElementRef;
    faHome = faHome;
    faRefresh = faSync;
    tabSelection: string = 'history';

    changeSelection(e: MouseEvent) {
        const selection = e.target as HTMLElement;
        const id = selection.id;
        Array.from(this.tabsRef.nativeElement.children).forEach((element) => {
            const elem = element as HTMLElement;
            if (elem.id === id) {
                elem.classList.add('selected');
                this.tabSelection = id;
            } else elem.classList.remove('selected');
        });
    }
}
