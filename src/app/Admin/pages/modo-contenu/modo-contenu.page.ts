import { Component, OnInit } from '@angular/core';

interface ContenuSignale {
  id: string;
  type: 'portfolio' | 'mission' | 'message';
  titre: string;
  description: string;
  utilisateur: {
    nom: string;
    email: string;
    avatar?: string;
  };
  dateSignalement: Date;
  statut: 'en_attente' | 'traite' | 'rejete';
  motifSignalement: string;
  commentaireModo?: string;
}

@Component({
  selector: 'app-modo-contenu',
  templateUrl: './modo-contenu.page.html',
  styleUrls: ['./modo-contenu.page.scss'],
  standalone:false,
})
export class ModoContenuPage implements OnInit {
  contenusSignales: ContenuSignale[] = [];
  contenusAffiches: ContenuSignale[] = [];
  
  // États des modales
  showFilterModal = false;
  showViewModal = false;
  showEditModal = false;
  showAddModal = false;
  
  // Contenu sélectionné
  contenuSelectionne: ContenuSignale | null = null;
  
  // Filtres
  filtres = {
    type: '',
    statut: '',
    dateDebut: '',
    dateFin: '',
    recherche: ''
  };
  
  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    traites: 0,
    rejetes: 0
  };

  constructor() { }

  ngOnInit() {
    this.loadContenusSignales();
    this.calculerStats();
  }

  loadContenusSignales() {
    // Simulation de données - à remplacer par un service Firebase
    this.contenusSignales = [
      {
        id: '1',
        type: 'portfolio',
        titre: 'Portfolio Design Graphique',
        description: 'Contenu inapproprié dans les images',
        utilisateur: {
          nom: 'Jean Dupont',
          email: 'jean.dupont@email.com'
        },
        dateSignalement: new Date('2024-05-20'),
        statut: 'en_attente',
        motifSignalement: 'Contenu inapproprié'
      },
      {
        id: '2',
        type: 'mission',
        titre: 'Développement site e-commerce',
        description: 'Description de mission suspecte',
        utilisateur: {
          nom: 'Marie Martin',
          email: 'marie.martin@email.com'
        },
        dateSignalement: new Date('2024-05-22'),
        statut: 'traite',
        motifSignalement: 'Spam',
        commentaireModo: 'Mission vérifiée et approuvée'
      },
      {
        id: '3',
        type: 'message',
        titre: 'Message privé',
        description: 'Langage inapproprié dans la conversation',
        utilisateur: {
          nom: 'Paul Durand',
          email: 'paul.durand@email.com'
        },
        dateSignalement: new Date('2024-05-25'),
        statut: 'en_attente',
        motifSignalement: 'Harcèlement'
      }
    ];
    
    this.appliquerFiltres();
  }

  calculerStats() {
    this.stats.total = this.contenusSignales.length;
    this.stats.enAttente = this.contenusSignales.filter(c => c.statut === 'en_attente').length;
    this.stats.traites = this.contenusSignales.filter(c => c.statut === 'traite').length;
    this.stats.rejetes = this.contenusSignales.filter(c => c.statut === 'rejete').length;
  }

  appliquerFiltres() {
    this.contenusAffiches = this.contenusSignales.filter(contenu => {
      let passe = true;
      
      if (this.filtres.type && contenu.type !== this.filtres.type) {
        passe = false;
      }
      
      if (this.filtres.statut && contenu.statut !== this.filtres.statut) {
        passe = false;
      }
      
      if (this.filtres.recherche) {
        const recherche = this.filtres.recherche.toLowerCase();
        passe = contenu.titre.toLowerCase().includes(recherche) ||
                contenu.utilisateur.nom.toLowerCase().includes(recherche) ||
                contenu.motifSignalement.toLowerCase().includes(recherche);
      }
      
      return passe;
    });
  }

  onRechercheChange(event: any) {
    this.filtres.recherche = event.target.value;
    this.appliquerFiltres();
  }

  openFilterModal() {
    this.showFilterModal = true;
  }

  closeFilterModal() {
    this.showFilterModal = false;
  }

  openViewModal(contenu: ContenuSignale) {
    this.contenuSelectionne = contenu;
    this.showViewModal = true;
  }

  closeViewModal() {
    this.showViewModal = false;
    this.contenuSelectionne = null;
  }

  openEditModal(contenu: ContenuSignale) {
    this.contenuSelectionne = {...contenu};
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.contenuSelectionne = null;
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  onFilterApply() {
    this.appliquerFiltres();
    this.closeFilterModal();
  }

  onEditSave(contenuModifie: ContenuSignale) {
    const index = this.contenusSignales.findIndex(c => c.id === contenuModifie.id);
    if (index !== -1) {
      this.contenusSignales[index] = contenuModifie;
      this.appliquerFiltres();
      this.calculerStats();
    }
    this.closeEditModal();
  }

  supprimerContenu(id: string) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      this.contenusSignales = this.contenusSignales.filter(c => c.id !== id);
      this.appliquerFiltres();
      this.calculerStats();
    }
  }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'portfolio': return 'Portfolio';
      case 'mission': return 'Mission';
      case 'message': return 'Message';
      default: return type;
    }
  }

  getStatutLabel(statut: string): string {
    switch(statut) {
      case 'en_attente': return 'En attente';
      case 'traite': return 'Traité';
      case 'rejete': return 'Rejeté';
      default: return statut;
    }
  }

  getStatutClass(statut: string): string {
    switch(statut) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800';
      case 'traite': return 'bg-green-100 text-green-800';
      case 'rejete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeIcon(type: string): string {
    switch(type) {
      case 'portfolio': return '🎨';
      case 'mission': return '💼';
      case 'message': return '💬';
      default: return '📄';
    }
  }
}