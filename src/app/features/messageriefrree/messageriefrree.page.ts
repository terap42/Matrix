import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  isMe: boolean;
  type: 'text' | 'file' | 'contract';
  fileUrl?: string;
  fileName?: string;
}

interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  projectTitle: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'completed' | 'pending';
  projectBudget: string;
}

@Component({
  selector: 'app-messageriefrree',
  templateUrl: './messageriefrree.page.html',
  styleUrls: ['./messageriefrree.page.scss'],
  standalone: false,
})
export class MessageriefrreePage implements OnInit {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput!: ElementRef;

  conversations: Conversation[] = [
    {
      id: '1',
      clientId: 'client1',
      clientName: 'Sarah Martinez',
      clientAvatar: 'https://i.pravatar.cc/100?img=1',
      projectTitle: 'Refonte Site Web WordPress',
      lastMessage: 'Parfait ! Quand pouvez-vous commencer ?',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      unreadCount: 2,
      status: 'active',
      projectBudget: '€800-1,200'
    },
    {
      id: '2',
      clientId: 'client2',
      clientName: 'TechStart Inc.',
      clientAvatar: 'https://i.pravatar.cc/100?img=2',
      projectTitle: 'Identité Visuelle Startup',
      lastMessage: 'Les maquettes sont très intéressantes',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h ago
      unreadCount: 0,
      status: 'pending',
      projectBudget: '€600-900'
    },
    {
      id: '3',
      clientId: 'client3',
      clientName: 'Alexandre Dubois',
      clientAvatar: 'https://i.pravatar.cc/100?img=3',
      projectTitle: 'App Mobile E-learning',
      lastMessage: 'Projet terminé avec succès !',
      lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      unreadCount: 0,
      status: 'completed',
      projectBudget: '€1,500-2,000'
    }
  ];

  messages: Message[] = [
    {
      id: '1',
      senderId: 'client1',
      senderName: 'Sarah Martinez',
      senderAvatar: 'https://i.pravatar.cc/100?img=1',
      content: 'Bonjour ! J\'ai vu votre profil et je suis intéressée par vos services pour refondre mon site WordPress.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isMe: false,
      type: 'text'
    },
    {
      id: '2',
      senderId: 'me',
      senderName: 'Moi',
      senderAvatar: 'https://i.pravatar.cc/100?img=5',
      content: 'Bonjour Sarah ! Merci pour votre message. Je serais ravi de travailler avec vous. Pouvez-vous me donner plus de détails sur votre projet ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), // 23h ago
      isMe: true,
      type: 'text'
    },
    {
      id: '3',
      senderId: 'client1',
      senderName: 'Sarah Martinez',
      senderAvatar: 'https://i.pravatar.cc/100?img=1',
      content: 'Bien sûr ! Il s\'agit d\'un site e-commerce avec environ 200 produits. J\'aimerais un design moderne et responsive.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22), // 22h ago
      isMe: false,
      type: 'text'
    },
    {
      id: '4',
      senderId: 'me',
      senderName: 'Moi',
      senderAvatar: 'https://i.pravatar.cc/100?img=5',
      content: 'J\'ai préparé un devis détaillé pour votre projet.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1h ago
      isMe: true,
      type: 'file',
      fileName: 'Devis_Refonte_WordPress.pdf',
      fileUrl: '#'
    },
    {
      id: '5',
      senderId: 'client1',
      senderName: 'Sarah Martinez',
      senderAvatar: 'https://i.pravatar.cc/100?img=1',
      content: 'Parfait ! Quand pouvez-vous commencer ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      isMe: false,
      type: 'text'
    }
  ];

  selectedConversation: Conversation | null = null;
  newMessage: string = '';
  showConversations: boolean = true;

  constructor(private router: Router) { }

  ngOnInit() {
    // Sélectionner la première conversation par défaut sur desktop
    if (window.innerWidth > 768 && this.conversations.length > 0) {
      this.selectConversation(this.conversations[0]);
    }
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.showConversations = false;
    
    // Marquer les messages comme lus
    conversation.unreadCount = 0;
    
    // Scroll to bottom after a short delay
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  backToConversations() {
    this.showConversations = true;
    this.selectedConversation = null;
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'Moi',
      senderAvatar: 'https://i.pravatar.cc/100?img=5',
      content: this.newMessage.trim(),
      timestamp: new Date(),
      isMe: true,
      type: 'text'
    };

    this.messages.push(message);
    
    // Update last message in conversation
    this.selectedConversation.lastMessage = this.newMessage.trim();
    this.selectedConversation.lastMessageTime = new Date();
    
    this.newMessage = '';
    
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}j`;
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'En cours';
      case 'completed': return 'Terminé';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  }

  attachFile() {
    // Logique pour attacher un fichier
    console.log('Attach file');
  }

  sendContract() {
    // Logique pour envoyer un contrat
    console.log('Send contract');
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  get isMobile(): boolean {
    return window.innerWidth < 768;
  }

  trackByConversationId(index: number, conversation: any): any {
    return conversation.id;
  }

  trackByMessageId(index: number, message: any): any {
    return message.id;
  }
}