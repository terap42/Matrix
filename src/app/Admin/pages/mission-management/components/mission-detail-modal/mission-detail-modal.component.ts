import { Component, Input, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { Mission, MissionStatus } from '../../models/mission.interface';

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
      coverLetter: 'Bonjour, je suis très intéressée par votre projet...',
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
      coverLetter: 'Fort de 5 ans d\'expérience en développement...',
      proposedPrice: 5200,
      estimatedDuration: '2.5 mois',
      status: 'accepted'
    }
  ];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.editedMission = { ...this.mission };
    // Pour l'édition, convertir le tableau en chaîne si besoin
    if (this.mission.skillsRequired) {
      (this.editedMission as any).skillsRequired = this.mission.skillsRequired.join(', ');
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
      this.editedMission = { ...this.mission };
      if (this.mission.skillsRequired) {
        (this.editedMission as any).skillsRequired = this.mission.skillsRequired.join(', ');
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
            // Avant de sauvegarder, convertir la chaîne en tableau
            if (typeof (this.editedMission as any).skillsRequired === 'string') {
              this.editedMission.skillsRequired = ((this.editedMission as any).skillsRequired as string)
                .split(',')
                .map(s => s.trim())
                .filter(s => !!s);
            }
            // Simulation de la sauvegarde
            const toast = await this.toastController.create({
              message: 'Mission mise à jour avec succès',
              duration: 3000,
              color: 'success',
              position: 'top'
            });
            await toast.present();
            
            this.editMode = false;
            this.modalController.dismiss({ action: 'updated', mission: this.editedMission });
          }
        }
      ]
    });

    await alert.present();
  }

  // Correction : on ne caste plus dans le template, on passe l'événement ici
  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as MissionStatus;
    this.changeStatus(value);
  }

  async changeStatus(newStatus: MissionStatus) {
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
            this.mission.status = newStatus;
            const toast = await this.toastController.create({
              message: 'Statut mis à jour',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
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
            this.mission.isReported = false;
            this.mission.reportReason = undefined;
            
            const toast = await this.toastController.create({
              message: 'Signalement résolu',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
          }
        }
      ]
    });

    await alert.present();
  }

  getStatusColor(status: MissionStatus): string {
    const colors = {
      [MissionStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [MissionStatus.PUBLISHED]: 'bg-blue-100 text-blue-800',
      [MissionStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [MissionStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [MissionStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [MissionStatus.REPORTED]: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: MissionStatus): string {
    const labels = {
      [MissionStatus.DRAFT]: 'Brouillon',
      [MissionStatus.PUBLISHED]: 'Publiée',
      [MissionStatus.IN_PROGRESS]: 'En cours',
      [MissionStatus.COMPLETED]: 'Terminée',
      [MissionStatus.CANCELLED]: 'Annulée',
      [MissionStatus.REPORTED]: 'Signalée'
    };
    return labels[status] || status;
  }
}