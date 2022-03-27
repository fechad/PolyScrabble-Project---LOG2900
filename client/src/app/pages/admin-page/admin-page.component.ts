import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { faHome } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit, AfterViewInit {
    @ViewChild('tabs') tabsRef: ElementRef;
    faHome = faHome;
    tabSelection: string = 'history';
    constructor() {}

    ngOnInit(): void {}

    ngAfterViewInit() {
        console.log(this.tabsRef);
    }

    changeSelection(e: MouseEvent) {
        const element = e.target as HTMLElement;
        const id = element.id;
        Array.from(this.tabsRef.nativeElement.children).forEach((element) => {
            const elem = element as HTMLElement;
            if (elem.id === id) {
                elem.classList.add('selected');
                this.tabSelection = id;
            } else elem.classList.remove('selected');
        });
    }
}
