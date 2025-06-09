import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectTheme } from 'src/app/store/theme.selectors';
import { Colors, ThemeMode, ColorKey, getColorClass } from 'src/app/theme/colors';
import { Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TabsService } from 'src/app/features/tabs/services/tabs.service';

@Component({
  selector: 'app-base-layout',
  templateUrl: './base-layout.component.html',
  styleUrls: ['./base-layout.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class BaseLayoutComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Page Title';
  @Input() showBackButton: boolean = true;
  @Input() iconEnd: string = '';
  @Input() headerClass: string = '';
  @Input() contentClass: string = '';
  @Output() buttonClick = new EventEmitter<void>();
  @Input() colorName: ColorKey = 'surface';
  @Input() textColorName: ColorKey = 'text';
  @Input() lightColor?: ColorKey;
  @Input() darkColor?: ColorKey;

  backgroundClass = '';
  private themeSub?: Subscription;
  theme: ThemeMode = 'light';

  constructor(private store: Store,
    private location: Location,
    private navigationService: TabsService,
    private navController: NavController) {}
  
  ngOnInit(): void {
    this.themeSub = this.store.select(selectTheme).subscribe(theme => {
      this.theme = theme.theme;
      this.updateBackgroundClass(theme.theme);
    });
  }

  goBack(tab:string) {
    // this.location.replaceState("/home");
    this.navigationService.setActiveTab(tab);
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  onClick(): void {
      this.buttonClick.emit();
  }

  private updateBackgroundClass(theme: ThemeMode) {
    console.log('Thème actuel:', Colors.dark[this.colorName!]);
    
    this.backgroundClass =
      theme === 'light'
        ? this.lightColor || (this.colorName ? Colors.light[this.colorName] : 'bg-transparent')
        : this.darkColor || (this.colorName ? Colors.dark[this.colorName] : 'bg-transparent');
  }

  get textColor(): string {
      return getColorClass(this.theme, this.textColorName!)!.replace('bg-', 'text-');

  }
}

// Exemple d'utilisation dans une page
/**
<app-base-layout title="Accueil" [showBackButton]="false">
  <ion-button header-end>
    <ion-icon name="settings-outline"></ion-icon>
  </ion-button>
  
  <div>
    <!-- Contenu principal de la page -->
    <h1 class="text-2xl font-bold mb-4">Bienvenue sur notre application</h1>
    <p class="text-gray-600">Lorem ipsum dolor sit amet...</p>
  </div>
  
  <div footer>
    <p class="text-center text-sm text-gray-500">© 2025 Mon Application</p>
  </div>
</app-base-layout>
*/

/**
 * 2. TAB LAYOUT
 * =============
 * Un layout avec une barre d'onglets en bas pour la navigation principale.
 * Parfait pour les applications avec plusieurs sections principales.
 */
