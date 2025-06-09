import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-mission-detail-modal',
  templateUrl: './mission-detail-modal.component.html',
  styleUrls: ['./mission-detail-modal.component.scss'],
  standalone: false,
})
export class MissionDetailModalComponent {
  @Input() mission: any;

  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'en_cours': 'bg-blue-100 text-blue-800',
      'terminee': 'bg-green-100 text-green-800',
      'annulee': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }
}


