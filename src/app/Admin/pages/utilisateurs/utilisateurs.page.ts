import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController } from '@ionic/angular';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  type: 'freelance' | 'client';
  specialite?: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  dateInscription: Date;
  derniereConnexion: Date;
  nombreMissions: number;
  noteGlobale: number;
  avatar?: string;
  telephone?: string;
  pays: string;
  ville: string;
  signalements: number;
}

@Component({
  selector: 'app-utilisateurs',
  templateUrl: './utilisateurs.page.html',
  styleUrls: ['./utilisateurs.page.scss'],
  standalone: false,
})
export class UtilisateursPage implements OnInit {

  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUsers: string[] = [];
  showFilters = false;
  showAddModal = false;
  showEditModal = false;
  showViewModal = false;
  selectedUser: User | null = null;

  // Nouveau utilisateur pour l'ajout
  newUser: Partial<User> = {};

  // Filtres
  filters = {
    search: '',
    type: '',
    statut: '',
    specialite: '',
    pays: '',
    dateInscription: '',
    signalements: false
  };

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 0;

  // Stats
  stats = {
    total: 0,
    freelances: 0,
    clients: 0,
    actifs: 0,
    inactifs: 0,
    suspendus: 0
  };

  specialites = [
    'Développeur Web',
    'Designer UI/UX',
    'Graphiste',
    'Rédacteur',
    'Traducteur',
    'Marketing Digital',
    'Community Manager',
    'Vidéaste',
    'Photographe',
    'Consultant'
  ];

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.calculateStats();
  }

  loadUsers() {
    // Simulation de données - à remplacer par votre service Firebase
    this.users = [
      {
        id: '1',
        nom: 'Diallo',
        prenom: 'Amadou',
        email: 'amadou.diallo@email.com',
        type: 'freelance',
        specialite: 'Développeur Web',
        statut: 'actif',
        dateInscription: new Date('2024-01-15'),
        derniereConnexion: new Date('2025-05-28'),
        nombreMissions: 12,
        noteGlobale: 4.5,
        telephone: '+221 77 123 45 67',
        pays: 'Sénégal',
        ville: 'Dakar',
        signalements: 0,
        avatar: 'assets/images/avatar1.jpg'
      },
      {
        id: '2',
        nom: 'Sow',
        prenom: 'Fatou',
        email: 'fatou.sow@email.com',
        type: 'client',
        statut: 'actif',
        dateInscription: new Date('2024-02-20'),
        derniereConnexion: new Date('2025-05-29'),
        nombreMissions: 8,
        noteGlobale: 4.2,
        telephone: '+221 76 987 65 43',
        pays: 'Sénégal',
        ville: 'Thiès',
        signalements: 1,
        avatar: 'assets/images/avatar2.jpg'
      },
      {
        id: '3',
        nom: 'Ba',
        prenom: 'Moussa',
        email: 'moussa.ba@email.com',
        type: 'freelance',
        specialite: 'Designer UI/UX',
        statut: 'suspendu',
        dateInscription: new Date('2024-03-10'),
        derniereConnexion: new Date('2025-05-25'),
        nombreMissions: 5,
        noteGlobale: 3.8,
        telephone: '+221 78 456 78 90',
        pays: 'Sénégal',
        ville: 'Saint-Louis',
        signalements: 3
      }
    ];
    
    this.applyFilters();
    this.calculateStats();
  }

  calculateStats() {
    this.stats.total = this.users.length;
    this.stats.freelances = this.users.filter(u => u.type === 'freelance').length;
    this.stats.clients = this.users.filter(u => u.type === 'client').length;
    this.stats.actifs = this.users.filter(u => u.statut === 'actif').length;
    this.stats.inactifs = this.users.filter(u => u.statut === 'inactif').length;
    this.stats.suspendus = this.users.filter(u => u.statut === 'suspendu').length;
  }

  applyFilters() {
    this.filteredUsers = this.users.filter(user => {
      const matchSearch = !this.filters.search || 
        user.nom.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(this.filters.search.toLowerCase());
      
      const matchType = !this.filters.type || user.type === this.filters.type;
      const matchStatut = !this.filters.statut || user.statut === this.filters.statut;
      const matchSpecialite = !this.filters.specialite || user.specialite === this.filters.specialite;
      const matchPays = !this.filters.pays || user.pays.toLowerCase().includes(this.filters.pays.toLowerCase());
      const matchSignalements = !this.filters.signalements || user.signalements > 0;

      return matchSearch && matchType && matchStatut && matchSpecialite && matchPays && matchSignalements;
    });

    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  getPaginatedUsers() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  onSearchChange(event: any) {
    this.filters.search = event.target.value;
    this.applyFilters();
  }

  clearFilters() {
    this.filters = {
      search: '',
      type: '',
      statut: '',
      specialite: '',
      pays: '',
      dateInscription: '',
      signalements: false
    };
    this.applyFilters();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // CORRECTION : Initialiser newUser
  openAddModal() {
    this.newUser = {
      nom: '',
      prenom: '',
      email: '',
      type: 'freelance',
      statut: 'actif',
      telephone: '',
      pays: 'Sénégal',
      ville: '',
      specialite: '',
      nombreMissions: 0,
      noteGlobale: 0,
      signalements: 0,
      dateInscription: new Date(),
      derniereConnexion: new Date()
    };
    this.showAddModal = true;
  }

  openEditModal(user: User) {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  openViewModal(user: User) {
    this.selectedUser = user;
    this.showViewModal = true;
  }

  closeModal(modalType: string) {
    switch(modalType) {
      case 'add':
        this.showAddModal = false;
        this.newUser = {};
        break;
      case 'edit':
        this.showEditModal = false;
        break;
      case 'view':
        this.showViewModal = false;
        break;
    }
    this.selectedUser = null;
  }

  async confirmAction(action: string, user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${action} cet utilisateur ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.executeAction(action, user);
          }
        }
      ]
    });

    await alert.present();
  }

  executeAction(action: string, user: User) {
    switch(action) {
      case 'activer':
        user.statut = 'actif';
        this.showToast('Utilisateur activé avec succès');
        break;
      case 'désactiver':
        user.statut = 'inactif';
        this.showToast('Utilisateur désactivé avec succès');
        break;
      case 'suspendre':
        user.statut = 'suspendu';
        this.showToast('Utilisateur suspendu avec succès');
        break;
      case 'supprimer':
        this.users = this.users.filter(u => u.id !== user.id);
        this.applyFilters();
        this.showToast('Utilisateur supprimé avec succès');
        break;
    }
    this.calculateStats();
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    toast.present();
  }

  selectUser(userId: string) {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  selectAllUsers() {
    if (this.selectedUsers.length === this.getPaginatedUsers().length) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = this.getPaginatedUsers().map(u => u.id);
    }
  }

  async bulkAction(action: string) {
    if (this.selectedUsers.length === 0) {
      this.showToast('Aucun utilisateur sélectionné');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir ${action} ${this.selectedUsers.length} utilisateur(s) ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.executeBulkAction(action);
          }
        }
      ]
    });

    await alert.present();
  }

  executeBulkAction(action: string) {
    this.selectedUsers.forEach(userId => {
      const user = this.users.find(u => u.id === userId);
      if (user) {
        switch(action) {
          case 'activer':
            user.statut = 'actif';
            break;
          case 'desactiver':
            user.statut = 'inactif';
            break;
          case 'suspendre':
            user.statut = 'suspendu';
            break;
        }
      }
    });
    
    this.selectedUsers = [];
    this.applyFilters();
    this.calculateStats();
    this.showToast(`Action ${action} appliquée avec succès`);
  }

  // CORRECTION : Fonction d'export fonctionnelle
  exportUsers() {
    try {
      // Créer les données CSV
      const headers = ['ID', 'Prénom', 'Nom', 'Email', 'Type', 'Statut', 'Spécialité', 'Pays', 'Ville', 'Téléphone', 'Missions', 'Note', 'Signalements'];
      const csvData = this.filteredUsers.map(user => [
        user.id,
        user.prenom,
        user.nom,
        user.email,
        user.type,
        user.statut,
        user.specialite || '',
        user.pays,
        user.ville,
        user.telephone || '',
        user.nombreMissions,
        user.noteGlobale,
        user.signalements
      ]);

      // Créer le contenu CSV
      let csvContent = headers.join(',') + '\n';
      csvData.forEach(row => {
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
      });

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showToast('Export réalisé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.showToast('Erreur lors de l\'export');
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getStatusColor(statut: string): string {
    switch(statut) {
      case 'actif': return 'text-green-600';
      case 'inactif': return 'text-yellow-600';
      case 'suspendu': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }

  getTypeIcon(type: string): string {
    return type === 'freelance' ? '👨‍💻' : '🏢';
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  // CORRECTION : Fonction de sauvegarde avec validation
  saveUser() {
    if (!this.selectedUser) return;

    // Validation basique
    if (!this.selectedUser.nom || !this.selectedUser.prenom || !this.selectedUser.email) {
      this.showToast('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.selectedUser.email)) {
      this.showToast('Veuillez saisir un email valide');
      return;
    }

    try {
      const index = this.users.findIndex(u => u.id === this.selectedUser!.id);
      if (index > -1) {
        this.users[index] = { ...this.selectedUser };
        this.applyFilters();
        this.calculateStats();
        this.showToast('Utilisateur modifié avec succès');
        this.closeModal('edit');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      this.showToast('Erreur lors de la sauvegarde');
    }
  }

  // CORRECTION : Fonction d'ajout avec validation
  addUser() {
    // Validation basique  
    if (!this.newUser.nom || !this.newUser.prenom || !this.newUser.email) {
      this.showToast('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newUser.email)) {
      this.showToast('Veuillez saisir un email valide');
      return;
    }

    // Vérifier si l'email existe déjà
    if (this.users.some(u => u.email === this.newUser.email)) {
      this.showToast('Cet email est déjà utilisé');
      return;
    }

    try {
      // Créer le nouvel utilisateur
      const user: User = {
        id: Date.now().toString(), // ID temporaire
        nom: this.newUser.nom!,
        prenom: this.newUser.prenom!,
        email: this.newUser.email!,
        type: this.newUser.type as 'freelance' | 'client' || 'freelance',
        statut: this.newUser.statut as 'actif' | 'inactif' | 'suspendu' || 'actif',
        telephone: this.newUser.telephone || '',
        pays: this.newUser.pays || 'Sénégal',
        ville: this.newUser.ville || '',
        specialite: this.newUser.specialite || '',
        nombreMissions: 0,
        noteGlobale: 0,
        signalements: 0,
        dateInscription: new Date(),
        derniereConnexion: new Date()
      };

      this.users.push(user);
      this.applyFilters();
      this.calculateStats();
      this.showToast('Utilisateur ajouté avec succès');
      this.closeModal('add');
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      this.showToast('Erreur lors de l\'ajout');
    }
  }

  // CORRECTION : Fonction de suppression
  async deleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirmation de suppression',
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur ${user.prenom} ${user.nom} ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: () => {
            this.executeAction('supprimer', user);
          }
        }
      ]
    });

    await alert.present();
  }

  // Méthode helper pour Math dans le template
  get Math() {
    return Math;
  }
}