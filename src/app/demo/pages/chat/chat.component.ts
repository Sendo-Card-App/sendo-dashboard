// angular import
import { AfterViewInit, Component, effect, inject, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';

// angular material
import { MatDrawerMode } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';
import { chatPersonData } from 'src/app/demo/data/chat';
import { chatsHistory } from 'src/app/demo/data/chat-history';
import { AbleProConfig } from 'src/app/app-config';
import { ThemeLayoutService } from 'src/app/@theme/services/theme-layout.service';

// type
import { chatHistory, chatPersonType } from 'src/app/@theme/types/chat-type';

//const
import { MIN_WIDTH_1025PX, MAX_WIDTH_1024PX, MIN_WIDTH_1400PX, MAX_WIDTH_1399PX, RTL } from 'src/app/@theme/const';
import { Conversation } from 'src/app/@theme/models/chat';
import { ChatService } from 'src/app/@theme/services/chat.service';
import { SocketService } from 'src/app/@theme/services/socket.service';

@Component({
  selector: 'app-chat',

  imports: [SharedModule, CommonModule, MatExpansionModule, MatSlideToggleModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewInit {
  // breakpoint observer
  private breakpointObserver = inject(BreakpointObserver);

  // theme service
  private themeService = inject(ThemeLayoutService);

  // public props
  modeValue: MatDrawerMode = 'side';
  infoStatus: string = 'false';
  personStatus: string = 'true';
  direction: string = 'ltr';
  userStatus: string = 'active';
  rtlMode: boolean = false;

  chatPersonList: chatPersonType[] = chatPersonData; // chat person list
  chatHistory: chatHistory[] = chatsHistory; // chat history
  selectedUser: chatPersonType; // sidebar on click to selected user data
  selectedUserChatHistory: chatHistory[] = []; // sidebar on click to selected user chat history
  selectedPersonId!: string; // sidebar on click to selected user id

  message: string = ''; // send new message
  errorMessage: string = ''; // error message

  // list to search any person
  searchTerm: string = '';

  // constructor
  constructor(private chatService: ChatService,private socketService: SocketService) {
    effect(() => {
      this.themeDirection(this.themeService.directionChange());
    });
  }

  // life cycle hook
  ngOnInit() {
    this.breakpointObserver.observe([MIN_WIDTH_1025PX, MAX_WIDTH_1024PX]).subscribe((result) => {
      if (result.breakpoints[MAX_WIDTH_1024PX]) {
        this.modeValue = 'over';
      } else if (result.breakpoints[MIN_WIDTH_1025PX]) {
        this.modeValue = 'side';
      }
    });
    this.breakpointObserver.observe([MIN_WIDTH_1400PX, MAX_WIDTH_1399PX]).subscribe((result) => {
      if (result.breakpoints[MAX_WIDTH_1399PX]) {
        this.personStatus = 'false';
      } else if (result.breakpoints[MIN_WIDTH_1400PX]) {
        this.personStatus = 'true';
      }
    });

    this.chatService.getConversations().subscribe({
      next: (res) => {
        const items = res.data.items;
        console.log('Conversations récupérées:', items);

        this.chatPersonList = items.map((conversation) =>
          this.mapConversationToChatPerson(conversation)
        );

        if (this.chatPersonList.length) {
          this.selectedUser = this.chatPersonList[0];
          this.selectedPersonId = this.selectedUser.id;
          // this.loadMessages(this.selectedUser.id);
        }
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des conversations', err);
      }
    });
  }

  ngAfterViewInit() {
    this.rtlMode = AbleProConfig.isRtlLayout;
  }


  // ...existing code...
  chatPerson(id: string) {
    this.selectedUser = this.chatPersonList.find((x) => x.id === id)!;
    this.selectedPersonId = this.selectedUser.id;

    this.chatService.getMessagesByConversationId(id).subscribe({
  next: (res) => {
    const messages = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
    this.selectedUserChatHistory = messages.map((msg) => ({
      id: msg.id,
      from: msg.senderType === 'ADMIN' ? 'Moi' : `${msg.user.firstname} ${msg.user.lastname}`,
      to: msg.senderType === 'CUSTOMER' ? 'Moi' : `${msg.user.firstname} ${msg.user.lastname}`,
      text: msg.content === '[Pièce jointe]'
        ? (msg.attachments && msg.attachments.length > 0 ? msg.attachments[0] : '[Pièce jointe]')
        : msg.content,
      attachments: msg.attachments, // tu peux garder ce champ si tu veux l'utiliser dans le template
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: msg.senderType === 'ADMIN'
    }));
  },
  error: (err) => {
    this.selectedUserChatHistory = [];
    console.error('Erreur lors de la récupération des messages', err);
  }
});
  }
  // ...existing code...

  // send new message
 sendNewMessage() {
  if (this.message.trim() !== '') {
    const payload = {
      conversationId: this.selectedPersonId,
      content: this.message,
      senderType: 'ADMIN', // utile pour l'API REST, pas pour le socket natif sauf si tu le gères côté serveur
      attachments: []
    };

    // Envoi via le socket
    this.socketService.sendMessage({
      conversationId: payload.conversationId,
      content: payload.content,
      attachments: payload.attachments
    });

    // Affichage immédiat côté front (optimiste)
    this.selectedUserChatHistory.push({
      id: (Math.max(...this.selectedUserChatHistory.map((m) => Number(m.id) || 0), 0) + 1).toString(),
      from: 'Moi',
      to: this.selectedUser.name,
      text: this.message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    });

    this.message = '';
    this.errorMessage = '';
  } else {
    this.errorMessage = 'Please Enter Any Message.';
  }
}

  // user status
  setStatus(status: string) {
    this.userStatus = status;
  }

  /**
   * Listen to Theme direction change. RTL/LTR
   */
  private themeDirection(direction: string) {
    this.rtlMode = direction === RTL ? true : false;
  }

  // filter person form list
  filterPerson(searchTerm: string): void {
    this.chatPersonList = chatPersonData.filter(
      (person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) || person.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  footer_icon = [
    {
      icon: 'ti ti-mood-smile'
    },
    {
      icon: 'ti ti-paperclip'
    },
    {
      icon: 'ti ti-photo-scan'
    },
    {
      icon: 'ti ti-microphone'
    }
  ];

  cards = [
    {
      title: 'All File',
      amount: '231',
      background: 'bg-primary-100',
      text_color: 'text-primary-500 ti ti-folder-open'
    },
    {
      title: 'All Link',
      amount: '250',
      background: 'bg-accent-100',
      text_color: 'text-accent-500 ti ti-link'
    }
  ];

  file = [
    {
      background: 'bg-success-50 text-success-500',
      icon: 'ti ti-clipboard-text',
      title: 'Document',
      text: '123 files, 193MB'
    },
    {
      background: 'bg-warning-50 text-warning-500',
      icon: 'ti ti-photo',
      title: 'Photos',
      text: '53 files, 321MB'
    },
    {
      background: 'bg-primary-50 text-primary-500',
      icon: 'ti ti-file-chart',
      title: 'Other',
      text: '49 files, 193MB'
    }
  ];


  private mapConversationToChatPerson(conversation: Conversation): chatPersonType {
    const user = conversation.user;

    return {
      id: conversation.id,
      name: `${user.firstname} ${user.lastname}`,
      company: '', // pas fourni par l'API (à compléter ou vide)
      role: '', // idem
      work_email: '', // idem
      personal_email: user.email || '',
      work_phone: '', // idem
      personal_phone: '', // idem
      location: '', // idem
      avatar: '', // avatar par défaut ou récupéré d'une autre source
      status: conversation.status, // "OPEN" ou "CLOSE"
      lastMessage: '', // à compléter avec un call pour récupérer le dernier message
      birthdayText: '', // si applicable
      unReadChatCount: 0, // valeur par défaut ou à compléter si tu as une API pour ça
      online_status: 'available' // à adapter selon le système de présence
    };
  }

  getAvatarColor(name: string): string {
  // Génère une couleur à partir du nom
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#3F51B5', '#03A9F4',
    '#009688', '#4CAF50', '#FF9800', '#795548', '#607D8B'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

changeConversationStatus(status: 'OPEN' | 'CLOSED') {
  if (!this.selectedPersonId) return;
  this.chatService.changeConversationStatus(this.selectedPersonId, status).subscribe({
    next: () => {
      this.selectedUser.status = status;
      // Optionnel : message de succès ou rafraîchir la liste
    },
    error: (err) => {
      console.error('Erreur lors du changement de statut de la conversation', err);
      // Optionnel : afficher un message d'erreur à l'utilisateur
    }
  });
}
}
