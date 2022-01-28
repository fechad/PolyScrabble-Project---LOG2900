import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassicModesPageComponent } from '@app/pages/classic-modes-page/classic-modes-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { JoiningRoomPageComponent } from '@app/pages/joining-room-page/joining-room-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'modes/classic', component: ClassicModesPageComponent },
    { path: 'waiting-room', component: WaitingRoomPageComponent },
    { path: 'joining-room', component: JoiningRoomPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
