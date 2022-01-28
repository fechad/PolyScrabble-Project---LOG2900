import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { IgxIconModule, IgxInputGroupModule, IgxTimePickerModule } from 'igniteui-angular';
import { GameSetupDialogComponent } from './components/game-setup-dialog/game-setup-dialog.component';
import { ThreeButtonOptionsComponent } from './components/three-button-options/three-button-options.component';
import { ClassicModesPageComponent } from './pages/classic-modes-page/classic-modes-page.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';
import { GamesListService } from './services/games-list.service';
import { JoiningRoomPageComponent } from './pages/joining-room-page/joining-room-page.component';
import { JoinSetupDialogComponent } from './components/join-setup-dialog/join-setup-dialog.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        ClassicModesPageComponent,
        WaitingRoomPageComponent,
        ThreeButtonOptionsComponent,
        GameSetupDialogComponent,
        JoiningRoomPageComponent,
        JoinSetupDialogComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MatDialogModule,
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        IgxTimePickerModule,
        IgxInputGroupModule,
        IgxIconModule,
    ],
    providers: [GamesListService],
    bootstrap: [AppComponent],
})
export class AppModule {}
