// src/app/admin/mission-management/components/mission-detail-modal/mission-detail-modal.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { Mission } from '../../service/mission.service';

// Interface pour les statuts
export enum MissionStatus {
  DRAFT = 'draft',
  PUBLISHED = 'open',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REPORTED = 'reported'
}

@Component({
  selector: 'app-mission-detail-modal',
  templateUrl: './mission-detail-modal.component.html',
  styleUrls: ['./mission-detail-modal.component.scss'],
  standalone: false,
})
export class MissionDetailModalComponent implements OnInit {
  
  @Input() mission!: Mission;
  
  activeTab: string = 'details';
  editMode: boolean = false;
  editedMission: Partial<Mission> = {};

  statusOptions = [
    { value: MissionStatus.DRAFT, label: 'Brouillon' },
    { value: MissionStatus.PUBLISHED, label: 'Publiée' },
    { value: MissionStatus.IN_PROGRESS, label: 'En cours' },
    { value: MissionStatus.COMPLETED, label: 'Terminée' },
    { value: MissionStatus.CANCELLED, label: 'Annulée' },
    { value: MissionStatus.REPORTED, label: 'Signalée' }
  ];

  // Données de simulation pour les candidatures
  mockApplications = [
    {
      id: '1',
      freelancerId: 'f1',
      freelancerName: 'Sophie Martin',
      freelancerEmail: 'sophie.martin@email.com',
      appliedAt: new Date('2024-01-16'),
      coverLetter: 'Bonjour, je suis très intéressée par votre projet de développement web. Avec mes 5 années d\'expérience en Angular et TypeScript, je peux vous garantir un travail de qualité dans les délais impartis.',
      proposedPrice: 4500,
      estimatedDuration: '2 mois',
      status: 'pending'
    },
    {
      id: '2', 
      freelancerId: 'f2',
      freelancerName: 'Thomas Dubois',
      freelancerEmail: 'thomas.dubois@email.com',
      appliedAt: new Date('2024-01-17'),
      coverLetter: 'Fort de 5 ans d\'expérience en développement full-stack, je suis spécialisé dans les technologies que vous recherchez. Mon portfolio inclut plusieurs projets similaires au vôtre.',
      proposedPrice: 5200,
      estimatedDuration: '2.5 mois',
      status: 'accepted'
    },
    {
      id: '3',
      freelancerId: 'f3', 
      freelancerName: 'Marie Leroy',
      freelancerEmail: 'marie.leroy@email.com',
      appliedAt: new Date('2024-01-18'),
      coverLetter: 'Développeuse passionnée avec une expertise en Angular et Ionic, je serais ravie de contribuer à votre projet. Mon approche méthodique garantit des livrables de haute qualité.',
      proposedPrice: 4800,
      estimatedDuration: '2.2 mois',
      status: 'pending'
    }
  ];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    console.log('🔍 Initialisation du modal avec mission:', this.mission);
    
    // Protection contre les valeurs undefined
    this.editedMission = { 
      ...this.mission,
      skillsRequired: this.mission.skillsRequired || []
    };
    
    // Pour l'édition, convertir le tableau en chaîne si besoin
    if (this.mission.skillsRequired && Array.isArray(this.mission.skillsRequired)) {
      (this.editedMission as any).skillsRequired = this.mission.skillsRequired.join(', ');
    } else {
      (this.editedMission as any).skillsRequired = '';
    }

    // Filtrer les candidatures en fonction de la mission (simulation)
    // En réalité, vous feriez un appel API ici
    if (this.mission.applicationsCount > 0) {
      // Prendre seulement le nombre de candidatures correspondant
      this.mockApplications = this.mockApplications.slice(0, Math.min(this.mission.applicationsCount, 3));
    } else {
      this.mockApplications = [];
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      // Reset les modifications
      this.editedMission = { 
        ...this.mission,
        skillsRequired: this.mission.skillsRequired || []
      };
      if (this.mission.skillsRequired && Array.isArray(this.mission.skillsRequired)) {
        (this.editedMission as any).skillsRequired = this.mission.skillsRequired.join(', ');
      } else {
        (this.editedMission as any).skillsRequired = '';
      }
    }
  }

  async saveMission() {
    const alert = await this.alertController.create({
      header: 'Confirmer les modifications',
      message: 'Voulez-vous enregistrer les modifications apportées à cette mission ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Enregistrer',
          handler: async () => {
            try {
              // Avant de sauvegarder, convertir la chaîne en tableau
              if (typeof (this.editedMission as any).skillsRequired === 'string') {
                const skillsString = (this.editedMission as any).skillsRequired as string;
                this.editedMission.skillsRequired = skillsString
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => !!s);
              }
              
              // Simulation de la sauvegarde - ici vous appelleriez votre service
              console.log('💾 Sauvegarde mission:', this.editedMission);
              
              const toast = await this.toastController.create({
                message: 'Mission mise à jour avec succès',
                duration: 3000,
                color: 'success',
                position: 'top'
              });
              await toast.present();
              
              this.editMode = false;
              
              // Mettre à jour la mission locale
              Object.assign(this.mission, this.editedMission);
              
              // Fermer le modal avec les données mises à jour
              this.modalController.dismiss({ 
                action: 'updated', 
                mission: this.editedMission 
              });
              
            } catch (error) {
              console.error('❌ Erreur lors de la sauvegarde:', error);
              const errorToast = await this.toastController.create({
                message: 'Erreur lors de la sauvegarde',
                duration: 3000,
                color: 'danger',
                position: 'top'
              });
              await errorToast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.editedMission.status = value;
    console.log('🔄 Nouveau statut sélectionné:', value);
  }

  async changeStatus(newStatus: string) {
    const alert = await this.alertController.create({
      header: 'Changer le statut',
      message: `Voulez-vous changer le statut de cette mission vers "${this.getStatusLabel(newStatus)}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: async () => {
            try {
              // Ici vous appelleriez votre service pour mettre à jour le statut
              console.log('🔄 Changement de statut vers:', newStatus);
              
              this.mission.status = newStatus;
              
              const toast = await this.toastController.create({
                message: 'Statut mis à jour',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
              
              // Notifier le changement au composant parent
              this.modalController.dismiss({ 
                action: 'statusChanged', 
                mission: this.mission 
              });
              
            } catch (error) {
              console.error('❌ Erreur changement statut:', error);
              const errorToast = await this.toastController.create({
                message: 'Erreur lors du changement de statut',
                duration: 3000,
                color: 'danger'
              });
              await errorToast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async resolveReport() {
    const alert = await this.alertController.create({
      header: 'Résoudre le signalement',
      message: 'Cette action marquera le signalement comme résolu. Continuer ?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Résoudre',
          handler: async () => {
            try {
              // Ici vous appelleriez votre service pour résoudre le signalement
              console.log('✅ Résolution du signalement pour la mission:', this.mission.id);
              
              this.mission.isReported = false;
              this.mission.reportReason = '';
              
              const toast = await this.toastController.create({
                message: 'Signalement résolu',
                duration: 2000,
                color: 'success'
              });
              await toast.present();
              
              // Notifier le changement au composant parent
              this.modalController.dismiss({ 
                action: 'reportResolved', 
                mission: this.mission 
              });
              
            } catch (error) {
              console.error('❌ Erreur résolution signalement:', error);
              const errorToast = await this.toastController.create({
                message: 'Erreur lors de la résolution du signalement',
                duration: 3000,
                color: 'danger'
              });
              await errorToast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Actions sur les candidatures
  async acceptApplication(application: any) {
    const alert = await this.alertController.create({
      header: 'Accepter la candidature',
      message: `Voulez-vous accepter la candidature de ${application.freelancerName} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Accepter',
          handler: async () => {
            try {
              console.log('✅ Acceptation candidature:', application.id);
              application.status = 'accepted';
              
              const toast = await this.toastController.create({
                message: `Candidature de ${application.freelancerName} acceptée`,
                duration: 3000,
                color: 'success'
              });
              await toast.present();
              
            } catch (error) {
              console.error('❌ Erreur acceptation candidature:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async rejectApplication(application: any) {
    const alert = await this.alertController.create({
      header: 'Refuser la candidature',
      message: `Voulez-vous refuser la candidature de ${application.freelancerName} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Refuser',
          handler: async () => {
            try {
              console.log('❌ Refus candidature:', application.id);
              application.status = 'rejected';
              
              const toast = await this.toastController.create({
                message: `Candidature de ${application.freelancerName} refusée`,
                duration: 3000,
                color: 'warning'
              });
              await toast.present();
              
            } catch (error) {
              console.error('❌ Erreur refus candidature:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: string): string {
    // Mapping des statuts enum vers les classes CSS
    const enumColors: { [key in MissionStatus]: string } = {
      [MissionStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [MissionStatus.PUBLISHED]: 'bg-blue-100 text-blue-800',
      [MissionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [MissionStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [MissionStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [MissionStatus.REPORTED]: 'bg-red-100 text-red-800'
    };

    // Mapping des statuts string vers les classes CSS (pour compatibilité)
    const stringColors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'open': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'reported': 'bg-red-100 text-red-800'
    };

    // Essayer d'abord avec les enum, puis avec les strings
    return enumColors[status as MissionStatus] || stringColors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    // Mapping des statuts enum vers les labels
    const enumLabels: { [key in MissionStatus]: string } = {
      [MissionStatus.DRAFT]: 'Brouillon',
      [MissionStatus.PUBLISHED]: 'Publiée',
      [MissionStatus.IN_PROGRESS]: 'En cours',
      [MissionStatus.COMPLETED]: 'Terminée',
      [MissionStatus.CANCELLED]: 'Annulée',
      [MissionStatus.REPORTED]: 'Signalée'
    };

    // Mapping des statuts string vers les labels (pour compatibilité)
    const stringLabels: { [key: string]: string } = {
      'draft': 'Brouillon',
      'open': 'Ouverte',
      'in_progress': 'En cours',
      'completed': 'Terminée',
      'cancelled': 'Annulée',
      'reported': 'Signalée'
    };

    // Essayer d'abord avec les enum, puis avec les strings
    return enumLabels[status as MissionStatus] || stringLabels[status] || status;
  }

  // Méthodes utilitaires pour l'affichage
  formatDate(date: string | Date): string {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
}