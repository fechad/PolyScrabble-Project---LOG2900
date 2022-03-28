import { Injectable } from '@angular/core';
import * as cst from '@app/constants';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
@Injectable({
    providedIn: 'root',
})
export class AvatarSelectionService {
    imgChosen: string = cst.imgList[0];
    idx: number = 0;
    faAngleRight = faAngleRight;
    faAngleLeft = faAngleLeft;

    chooseIcon(next: boolean) {
        if (next) this.idx++;
        else this.idx--;
        if (this.idx < 0) this.imgChosen = cst.imgList[(this.idx + cst.NUMBER_ICONS) % cst.NUMBER_ICONS];
        else this.imgChosen = cst.imgList[this.idx % cst.NUMBER_ICONS];
    }
}
