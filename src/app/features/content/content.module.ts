import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContentPageRoutingModule } from './content-routing.module';
import { ContentPage } from './content.page';
import { CreatePostModalComponent } from './components/create-post-modal/create-post-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ContentPageRoutingModule
  ],
  declarations: [
    ContentPage,
    CreatePostModalComponent
  ]
})
export class ContentPageModule {}