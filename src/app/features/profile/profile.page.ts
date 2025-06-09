import { Component, OnDestroy } from '@angular/core';
import { ThemeService } from 'src/app/theme/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnDestroy {
onSubmit() {
throw new Error('Method not implemented.');
}
  isDark = false;
  private themeSub?: Subscription;

  constructor(private themeService: ThemeService) {
    this.themeSub = this.themeService.theme$.subscribe(theme => {
      this.isDark = theme.theme === 'dark';
    });
  }

  toggleTheme(event: any) {
    this.themeService.toggleTheme();
  }

  ngOnDestroy() {
    this.themeSub?.unsubscribe();
  }
}
