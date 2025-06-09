import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-messagerie',
  templateUrl: './messagerie.page.html',
  styleUrls: ['./messagerie.page.scss'],
  standalone: false,
})
export class MessageriePage implements OnInit, OnDestroy {
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  // État de la conversation
  selectedConversation: any = null;
  conversations: any[] = [];
  messages: any[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  showContractModal: boolean = false;
  isMobileView: boolean = false;
  private resizeSubscription!: Subscription;

  // Gestion des fichiers
  selectedFile: File | null = null;
  isUploading: boolean = false;

  // Informations utilisateur actuel
  currentUser = {
    id: '1',
    name: 'Alexandre',
    type: 'freelance', // ou 'client'
    avatar: '/assets/avatars/default.png'
  };

  constructor() {
    this.checkViewport();
  }

  ngOnInit() {
    this.loadConversations();
    this.setupViewportListener();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }
  }

  private setupViewportListener() {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => this.checkViewport());
  }

  private checkViewport() {
    this.isMobileView = window.innerWidth < 768; // md breakpoint de Tailwind
  }

  loadConversations() {
    // Simulation des données - À remplacer par un service Firebase
    this.conversations = [
      {
        id: '1',
        participant: {
          name: 'TechStart Solutions',
          avatar: '/assets/avatars/techstart.png',
          type: 'client'
        },
        lastMessage: 'Logo Design E-commerce',
        lastMessageTime: '2h',
        unreadCount: 2,
        projectTitle: 'Logo Design E-commerce',
        budget: '450€',
        status: 'active'
      },
      {
        id: '2',
        participant: {
          name: 'InnovateCorp',
          avatar: '/assets/avatars/innovate.png',
          type: 'client'
        },
        lastMessage: 'Parfait, merci pour les détails !',
        lastMessageTime: 'Hier',
        unreadCount: 0,
        projectTitle: 'Site Web Vitrine',
        budget: '1200€',
        status: 'completed'
      },
      {
        id: '3',
        participant: {
          name: 'StartupXYZ',
          avatar: '/assets/avatars/startup.png',
          type: 'client'
        },
        lastMessage: 'Quand pouvez-vous commencer ?',
        lastMessageTime: '3j',
        unreadCount: 1,
        projectTitle: 'Application Mobile',
        budget: '2500€',
        status: 'pending'
      }
    ];

    // Sélectionner la première conversation par défaut
    if (this.conversations.length > 0) {
      this.selectConversation(this.conversations[0]);
    }
  }

  selectConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    
    // Marquer comme lu
    conversation.unreadCount = 0;
  }

  loadMessages(conversationId: string) {
    this.isLoading = true;
    
    // Simulation des messages - À remplacer par un service Firebase
    setTimeout(() => {
      this.messages = [
        {
          id: '1',
          senderId: 'client1',
          senderName: 'TechStart Solutions',
          content: 'Bonjour Alexandre, j\'ai vu votre portfolio et je suis intéressé par vos services pour notre logo.',
          timestamp: new Date(Date.now() - 7200000), // 2h ago
          type: 'text',
          isCurrentUser: false
        },
        {
          id: '2',
          senderId: this.currentUser.id,
          senderName: this.currentUser.name,
          content: 'Bonjour ! Merci pour votre intérêt. Pouvez-vous me donner plus de détails sur le projet ?',
          timestamp: new Date(Date.now() - 7000000),
          type: 'text',
          isCurrentUser: true
        },
        {
          id: '3',
          senderId: 'client1',
          senderName: 'TechStart Solutions',
          content: 'Nous avons besoin d\'un logo moderne pour notre plateforme e-commerce. Budget : 450€',
          timestamp: new Date(Date.now() - 6800000),
          type: 'text',
          isCurrentUser: false
        },
        {
          id: '4',
          senderId: 'client1',
          senderName: 'TechStart Solutions',
          content: '',
          timestamp: new Date(Date.now() - 6600000),
          type: 'file',
          fileName: 'brief-logo.pdf',
          fileSize: '2.1 MB',
          isCurrentUser: false
        }
      ];
      
      this.isLoading = false;
      this.scrollToBottom();
    }, 500);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      content: this.newMessage,
      timestamp: new Date(),
      type: 'text',
      isCurrentUser: true
    };

    this.messages.push(message);
    this.newMessage = '';
    
    // Mettre à jour la dernière conversation
    if (this.selectedConversation) {
      this.selectedConversation.lastMessage = message.content;
      this.selectedConversation.lastMessageTime = 'Maintenant';
    }

    this.scrollToBottom();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadFile();
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    
    // Simulation upload - À remplacer par Firebase Storage
    setTimeout(() => {
      const fileMessage = {
        id: Date.now().toString(),
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        content: '',
        timestamp: new Date(),
        type: 'file',
        fileName: this.selectedFile!.name,
        fileSize: this.formatFileSize(this.selectedFile!.size),
        isCurrentUser: true
      };

      this.messages.push(fileMessage);
      this.isUploading = false;
      this.selectedFile = null;
      this.scrollToBottom();
    }, 2000);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Maintenant';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}j`;
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  openContractModal() {
    this.showContractModal = true;
  }

  closeContractModal() {
    this.showContractModal = false;
  }

  generateContract() {
    // Logique de génération de contrat PDF
    console.log('Génération du contrat pour:', this.selectedConversation);
    this.closeContractModal();
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'En cours';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminé';
      default: return 'Inconnu';
    }
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}