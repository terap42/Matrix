// src/app/features/missions/components/application-modal/application-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { ApplicationService, CreateApplicationRequest } from '../services/application.service';
import { Mission } from '../services/mission.service';

@Component({
  selector: 'app-application-modal',
   standalone: false,
  template: `
    <!-- Modal Overlay -->
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" (click)="closeModal()"></div>
      
      <!-- Modal Content -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] mx-4 overflow-hidden">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <h2 class="text-2xl font-bold text-gray-900">Postuler à la mission</h2>
          <button 
            (click)="closeModal()" 
            class="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="overflow-y-auto max-h-[calc(90vh-140px)]">
          
          <!-- Info Mission -->
          <div *ngIf="mission" class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ mission.title }}</h3>
            <p class="text-gray-600 mb-4">{{ mission.description }}</p>
            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                </svg>
                <span class="font-medium text-gray-900">Budget: €{{ mission.budget.min }}-{{ mission.budget.max }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0v10a1 1 0 001 1h4a1 1 0 001-1V7"/>
                </svg>
                <span class="font-medium text-gray-900">Échéance: {{ mission.deadline | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>

          <!-- Formulaire de Candidature -->
          <div class="p-6 space-y-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Votre candidature</h4>
            
            <!-- Proposition -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Votre proposition * 
                <span class="text-xs text-gray-500">({{ proposal.length }}/1000 caractères, minimum 20)</span>
              </label>
              <textarea 
                [(ngModel)]="proposal"
                placeholder="Décrivez comment vous comptez réaliser cette mission, votre approche, vos compétences..."
                rows="8"
                maxlength="1000"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors text-gray-900 bg-white placeholder-gray-500"
                [class.border-red-300]="proposal.length > 0 && proposal.length < 20"
                [class.border-green-300]="proposal.length >= 20"
              ></textarea>
              <div class="mt-1 flex justify-between text-xs">
                <span [class]="proposal.length >= 20 ? 'text-green-600' : 'text-red-600'">
                  {{ proposal.length >= 20 ? '✅ Longueur suffisante' : '❌ Minimum 20 caractères requis' }}
                </span>
                <span class="text-gray-500">{{ proposal.length }}/1000</span>
              </div>
            </div>

            <!-- Budget Proposé -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Budget proposé (€) 
                <span class="text-xs text-gray-500">(optionnel)</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-gray-500 text-sm">€</span>
                </div>
                <input 
                  type="number"
                  [(ngModel)]="proposedBudget"
                  placeholder="150"
                  min="1"
                  class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Budget suggéré basé sur la mission: €{{ getSuggestedBudget() }}
              </p>
            </div>

            <!-- Date de Livraison -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date de livraison proposée 
                <span class="text-xs text-gray-500">(optionnel)</span>
              </label>
              <input 
                type="date"
                [(ngModel)]="proposedDeadline"
                [min]="getCurrentDate()"
                [max]="mission?.deadline"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
              />
              <p class="mt-1 text-xs text-gray-500">
                Date limite du client: {{ mission?.deadline | date:'dd/MM/yyyy' }}
              </p>
            </div>

            <!-- Section Debug/Validation -->
            <div class="bg-gray-50 rounded-lg p-4 border">
              <h5 class="font-medium text-gray-900 mb-3">État du formulaire</h5>
              <div class="space-y-2 text-sm">
                <div class="flex items-center space-x-2">
                  <span [class]="proposal.length >= 20 ? 'text-green-500' : 'text-red-500'">
                    {{ proposal.length >= 20 ? '✅' : '❌' }}
                  </span>
                  <span>Proposition: {{ proposal.length >= 20 ? 'Valide' : 'Trop courte' }} ({{ proposal.length }}/20 min)</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-blue-500">ℹ️</span>
                  <span>Budget: {{ proposedBudget ? proposedBudget + '€' : 'Non spécifié (optionnel)' }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-blue-500">ℹ️</span>
                  <span>Date: {{ proposedDeadline || 'Non spécifiée (optionnel)' }}</span>
                </div>
                <div class="pt-2 border-t border-gray-200">
                  <span class="font-medium" [class]="isFormValid() ? 'text-green-600' : 'text-red-600'">
                    Formulaire {{ isFormValid() ? '✅ VALIDE' : '❌ INVALIDE' }}
                  </span>
                </div>
              </div>
            </div>
 <div class="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button 
            type="button"
            (click)="closeModal()"
            class="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </button>
          <button 
            type="button"
            (click)="onSubmit()"
            [disabled]="!isFormValid() || isSubmitting"
            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg *ngIf="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg *ngIf="!isSubmitting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <span>{{ isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature' }}</span>
          </button>
        </div>
          </div>
        </div>

        <!-- Footer -->
       

      </div>
    </div>
  `,
  styles: [`
    /* Styles pour assurer la compatibilité */
    .fixed {
      position: fixed;
    }
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    .z-50 {
      z-index: 50;
    }
    
    /* Force la couleur du texte dans les inputs */
    input, textarea {
      color: #1f2937 !important;
      background-color: white !important;
    }
    
    input::placeholder, textarea::placeholder {
      color: #9ca3af !important;
    }
    
    /* Assure que le texte est visible même avec des thèmes sombres */
    input:focus, textarea:focus {
      color: #1f2937 !important;
      background-color: white !important;
    }
  `]
})
export class ApplicationModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() mission: Mission | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() applicationSent = new EventEmitter<void>();

  proposal: string = '';
  proposedBudget: number | null = null;
  proposedDeadline: string = '';
  isSubmitting: boolean = false;

  constructor(private applicationService: ApplicationService) {
    console.log('🏗️ ApplicationModalComponent créé avec Tailwind');
  }

  ngOnInit() {
    console.log('🔧 Modal ngOnInit - Mission:', this.mission);
    this.initializeForm();
  }

  ngOnChanges() {
    console.log('🔄 Modal ngOnChanges - isOpen:', this.isOpen, 'Mission:', this.mission);
    if (this.isOpen && this.mission) {
      this.initializeForm();
    }
  }

  private initializeForm() {
    if (this.mission) {
      // Pré-remplir le budget
      const averageBudget = Math.floor((this.mission.budget.min + this.mission.budget.max) / 2);
      this.proposedBudget = averageBudget;
      
      // Proposition d'exemple plus détaillée
      if (!this.proposal) {
        this.proposal = `Bonjour,

Je suis très intéressé(e) par votre mission "${this.mission.title}".

Voici mon approche pour réaliser ce projet :

📋 Analyse et Planning :
- Étude approfondie de vos besoins
- Définition des objectifs et livrables
- Planning détaillé avec jalons

🛠️ Réalisation :
- Développement méthodique
- Tests réguliers
- Communication continue sur l'avancement

✅ Livraison :
- Respect des délais convenus
- Documentation complète
- Support post-livraison

Je reste à votre disposition pour discuter des détails techniques et répondre à vos questions.

Cordialement`;
      }
      
      console.log('✅ Formulaire initialisé - Budget:', averageBudget, 'Proposition length:', this.proposal.length);
    }
  }

  closeModal() {
    console.log('❌ Fermeture du modal');
    this.modalClosed.emit();
  }

  resetForm() {
    this.proposal = '';
    this.proposedBudget = null;
    this.proposedDeadline = '';
    this.isSubmitting = false;
    console.log('🧹 Formulaire reseté');
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isFormValid(): boolean {
    const valid = !!(this.proposal.trim() && this.proposal.length >= 20);
    return valid;
  }

  getSuggestedBudget(): number {
    if (!this.mission) return 0;
    return Math.floor((this.mission.budget.min + this.mission.budget.max) / 2);
  }

  async onSubmit() {
    console.log('📤 === DÉBUT SOUMISSION CANDIDATURE ===');
    console.log('Mission:', this.mission);
    console.log('Proposition:', this.proposal);
    console.log('Budget proposé:', this.proposedBudget);
    console.log('Date proposée:', this.proposedDeadline);
    console.log('Formulaire valide:', this.isFormValid());
    
    if (!this.mission || !this.isFormValid()) {
      console.log('❌ Conditions non remplies pour envoi');
      alert('Veuillez remplir la proposition (minimum 20 caractères)');
      return;
    }

    this.isSubmitting = true;

    try {
      const applicationData: CreateApplicationRequest = {
        mission_id: this.mission.id,
        proposal: this.proposal.trim(),
        proposed_budget: this.proposedBudget || undefined,
        proposed_deadline: this.proposedDeadline || undefined
      };

      console.log('📤 Données à envoyer au backend:', applicationData);

      this.applicationService.applyToMission(applicationData).subscribe({
        next: (response) => {
          console.log('✅ Réponse du serveur:', response);
          this.isSubmitting = false;
          
          if (response.success) {
            console.log('✅ Candidature envoyée avec succès !');
            alert('🎉 Candidature envoyée avec succès !');
            this.applicationSent.emit();
            this.resetForm();
            this.closeModal();
          } else {
            console.error('❌ Erreur réponse serveur:', response.message);
            alert('❌ Erreur: ' + (response.message || 'Erreur inconnue'));
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('❌ Erreur lors de la candidature:', error);
          alert('❌ Erreur lors de l\'envoi: ' + (error.message || 'Erreur réseau'));
        }
      });

    } catch (error) {
      this.isSubmitting = false;
      console.error('❌ Erreur inattendue:', error);
      alert('❌ Erreur inattendue: ' + error);
    }
  }
}
 
 