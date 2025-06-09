import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface Feature {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

interface FreelanceCategory {
  icon: string;
  title: string;
  description: string;
  color: string;
  slug: string;
}

interface Statistic {
  value: string;
  label: string;
}

interface AppFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
  animations: [
    trigger('slideInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('800ms ease-out')
      ])
    ]),
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out')
      ])
    ]),
    trigger('slideInLeft', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('700ms ease-out')
      ])
    ]),
    trigger('staggerAnimation', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition('hidden => visible', [
        animate('500ms ease-out')
      ])
    ]),
    trigger('countUpAnimation', [
      state('in', style({ opacity: 1, transform: 'scale(1)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('800ms ease-out')
      ])
    ])
  ]
})
export class HomePage implements OnInit {
  
  // États d'animation
  heroAnimationState = 'in';
  featuresAnimationState = 'in';
  categoriesAnimationState = 'in';
  statsAnimationState = 'in';
  appFeaturesAnimationState = 'in';
  ctaAnimationState = 'in';
  
  // État du menu mobile
  isMobileMenuOpen = false;

  // Données des fonctionnalités
  features: Feature[] = [
    {
      icon: 'shield-checkmark',
      title: 'Sécurisé',
      description: 'Paiements protégés et vérification des profils pour votre sécurité',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      icon: 'flash',
      title: 'Rapide',
      description: 'Trouvez le freelance idéal en quelques clics seulement',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      icon: 'star',
      title: 'Qualité',
      description: 'Freelances sélectionnés et évalués par la communauté',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  // Catégories de freelances
  freelanceCategories: FreelanceCategory[] = [
    {
      icon: 'code-slash',
      title: 'Développement Web',
      description: 'Sites web, applications, e-commerce',
      color: 'blue',
      slug: 'developpement-web'
    },
    {
      icon: 'phone-portrait',
      title: 'Applications Mobile',
      description: 'iOS, Android, React Native, Flutter',
      color: 'green',
      slug: 'applications-mobile'
    },
    {
      icon: 'brush',
      title: 'Design & UI/UX',
      description: 'Interface, logo, identité visuelle',
      color: 'pink',
      slug: 'design-ui-ux'
    },
    {
      icon: 'trending-up',
      title: 'Marketing Digital',
      description: 'SEO, réseaux sociaux, publicité',
      color: 'orange',
      slug: 'marketing-digital'
    },
    {
      icon: 'camera',
      title: 'Photo & Vidéo',
      description: 'Shooting, montage, motion design',
      color: 'indigo',
      slug: 'photo-video'
    },
    {
      icon: 'create',
      title: 'Rédaction',
      description: 'Articles, copywriting, traduction',
      color: 'red',
      slug: 'redaction'
    }
  ];

  // Statistiques
  statistics: Statistic[] = [
    { value: '10K+', label: 'Freelances actifs' },
    { value: '5K+', label: 'Clients satisfaits' },
    { value: '25K+', label: 'Projets réalisés' },
    { value: '4.8/5', label: 'Note moyenne' }
  ];

  // Fonctionnalités de l'app
  appFeatures: AppFeature[] = [
    {
      icon: 'chatbubbles',
      title: 'Chat en temps réel',
      description: 'Communiquez instantanément avec vos freelances'
    },
    {
      icon: 'notifications',
      title: 'Notifications push',
      description: 'Restez informé de l\'avancement de vos projets'
    },
    {
      icon: 'card',
      title: 'Paiements sécurisés',
      description: 'Effectuez vos transactions en toute sécurité'
    },
    {
      icon: 'analytics',
      title: 'Suivi de projet',
      description: 'Tableau de bord complet pour gérer vos missions'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.initializeAnimations();
  }

  // Méthodes de navigation avec gestion d'erreur améliorée
  async navigateToLogin() {
    console.log('Navigation vers login');
    try {
      await this.router.navigate(['/login']);
      this.closeMobileMenu();
    } catch (err) {
      console.error('Erreur de navigation vers login:', err);
    }
  }

  async navigateToRegister(userType?: string) {
    console.log('Navigation vers register avec type:', userType);
    try {
      if (userType) {
        await this.router.navigate(['/register'], { queryParams: { type: userType } });
      } else {
        await this.router.navigate(['/register']);
      }
      this.closeMobileMenu();
    } catch (err) {
      console.error('Erreur de navigation vers register:', err);
    }
  }

  async navigateToFreelances() {
    console.log('Navigation vers freelances');
    try {
      await this.router.navigate(['/freelances']);
      this.closeMobileMenu();
    } catch (err) {
      console.error('Erreur de navigation vers freelances:', err);
    }
  }

  async navigateToFreelancesByCategory(categorySlug: string) {
    console.log('Navigation vers freelances par catégorie:', categorySlug);
    try {
      await this.router.navigate(['/freelances'], { queryParams: { category: categorySlug } });
    } catch (err) {
      console.error('Erreur de navigation vers freelances par catégorie:', err);
    }
  }

  async navigateToSupport() {
    console.log('Navigation vers support');
    try {
      await this.router.navigate(['/support']);
    } catch (err) {
      console.error('Erreur de navigation vers support:', err);
    }
  }

  async navigateToAbout() {
    console.log('Navigation vers about');
    try {
      await this.router.navigate(['/about']);
    } catch (err) {
      console.error('Erreur de navigation vers about:', err);
    }
  }

  async navigateToLegal() {
    console.log('Navigation vers legal');
    try {
      await this.router.navigate(['/legal']);
    } catch (err) {
      console.error('Erreur de navigation vers legal:', err);
    }
  }

  // Gestion du menu mobile
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    console.log('Menu mobile toggled:', this.isMobileMenuOpen);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  // Initialisation des animations
  private initializeAnimations() {
    // Déclenchement séquentiel des animations
    setTimeout(() => {
      this.heroAnimationState = 'in';
    }, 100);

    setTimeout(() => {
      this.featuresAnimationState = 'in';
    }, 300);

    setTimeout(() => {
      this.categoriesAnimationState = 'in';
    }, 500);

    setTimeout(() => {
      this.statsAnimationState = 'in';
    }, 700);

    setTimeout(() => {
      this.appFeaturesAnimationState = 'in';
    }, 900);

    setTimeout(() => {
      this.ctaAnimationState = 'in';
    }, 1100);
  }

  // Méthodes utilitaires pour les animations
  getStaggerDelay(index: number): string {
    return `${index * 100}ms`;
  }

  getStaggerState(index: number): string {
    return 'visible';
  }

  // Gestion des événements de clic
  onFeatureClick(feature: Feature) {
    console.log('Feature clicked:', feature.title);
  }

  onCategoryClick(category: FreelanceCategory) {
    this.navigateToFreelancesByCategory(category.slug);
  }

  // Méthodes pour le tracking/analytics
  trackEvent(eventName: string, properties?: any) {
    console.log('Event tracked:', eventName, properties);
  }

  // Gestion du scroll pour les animations
  onScroll(event: any) {
    const scrollTop = event.target.scrollTop;
    // Logique d'animation au scroll si nécessaire
  }
}