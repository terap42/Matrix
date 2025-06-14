import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Services
import { AuthService } from './features/auth/services/auth.service';
import { UsersManagementService } from './Admin/pages/utilisateurs/services/users-management.service';

// Interceptors
import { UsersAuthInterceptor } from './Admin/pages/utilisateurs/interceptors/users-auth.interceptor';
import { MissionService } from './features/missions/services/mission.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot() // ✅ Important pour AuthService
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    
    // ✅ Services
    AuthService,
    UsersManagementService,
    MissionService,
    
    // ✅ Interceptor corrigé
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UsersAuthInterceptor,
      multi: true
    }
    
    // 🔧 OPTION TEMPORAIRE : Commentez cette ligne pour désactiver l'interceptor
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: UsersAuthInterceptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}