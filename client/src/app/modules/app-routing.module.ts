import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { JoiningRoomPageComponent } from '@app/pages/joining-room-page/joining-room-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ModesPageComponent } from '@app/pages/modes-page/modes-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/admin', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'classic', component: ModesPageComponent },
    { path: 'log2990', component: ModesPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'waiting-room', component: WaitingRoomPageComponent },
    { path: 'joining-room', component: JoiningRoomPageComponent },
    { path: 'joining-room-log2990', component: JoiningRoomPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
