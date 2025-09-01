// angular import
import { AfterViewInit, Component, effect, inject, OnInit, OnDestroy } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat',

  imports: [SharedModule, CommonModule, MatExpansionModule, MatSlideToggleModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
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
  attachments: string[] = [];
  isloadingattachments: boolean = false;
  totalMessages: number = 0;

  chatPersonList: chatPersonType[] = chatPersonData; // chat person list
  chatHistory: chatHistory[] = chatsHistory; // chat history
  selectedUser: chatPersonType; // sidebar on click to selected user data
  selectedUserChatHistory: chatHistory[] = []; // sidebar on click to selected user chat history
  selectedPersonId!: string; // sidebar on click to selected user id

  message: string = ''; // send new message
  errorMessage: string = ''; // error message

  // list to search any person
  searchTerm: string = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pollingInterval: any;

  // constructor
  constructor(private chatService: ChatService, private socketService: SocketService, private snackbar: MatSnackBar) {
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

        this.totalMessages = items.length;

        this.chatPersonList = items.map((conversation) =>
          this.mapConversationToChatPerson(conversation)
        ).sort((a, b) => {
          return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
        });

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
  //    this.pollingInterval = setInterval(() => {
  // }, 5000);

   this.socketService.onNewMessage().subscribe((msg) => {
    this.playNotificationSound();
    this.snackbar.open(`Nouveau message reçu ${msg.content}`, 'Fermer', {
      duration: 3000
    });
  });
  }

  playNotificationSound(): void {
  const audio = new Audio('assets/sound/sound 2.mp3');
  audio.play();
}

  ngAfterViewInit() {
    this.rtlMode = AbleProConfig.isRtlLayout;
  }
  ngOnDestroy() {
  if (this.pollingInterval) {
    clearInterval(this.pollingInterval);
  }
}

refreshDom(): void {
  this.chatService.getConversations().subscribe({
      next: (res) => {
        const items = res.data.items;
        console.log('Conversations récupérées:', items);

        this.totalMessages = items.length;

        this.chatPersonList = items.map((conversation) =>
          this.mapConversationToChatPerson(conversation)
        ).sort((a, b) => {
          return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime();
        });

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


  // ...existing code...
  chatPerson(id: string) {
    this.selectedUser = this.chatPersonList.find((x) => x.id === id)!;
    this.selectedPersonId = this.selectedUser.id;

    this.chatService.getMessagesByConversationId(id).subscribe({
      next: (res) => {
        // console.log('Messages récupérés:', res.data);
        const messages = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        this.selectedUserChatHistory = messages
          .map((msg) => ({
            id: msg.id,
            from: msg.senderType === 'ADMIN' ? 'Moi' : `${msg.user.firstname} ${msg.user.lastname}`,
            to: msg.senderType === 'CUSTOMER' ? 'Moi' : `${msg.user.firstname} ${msg.user.lastname}`,
            text: msg.content === '[Attachment]'
              ? (msg.attachments && msg.attachments.length > 0 ? msg.attachments[0] : '[Attachment]')
              : msg.content,
            attachments: msg.attachments,
            time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date(msg.createdAt), // 🔑 garde la date réelle
            isMine: msg.senderType === 'ADMIN'
          }))
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // 🔑 tri ascendant

      },
      error: (err) => {
        this.selectedUserChatHistory = [];
        console.error('Erreur lors de la récupération des messages', err);
      }
    });
  }
  // ...existing code...

  selectedImages: string[] = [];

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);

      // Génère les previews pour les images sélectionnées
      this.selectedImages = files
        .filter(file => file.type.startsWith('image/'))
        .map(file => URL.createObjectURL(file));

      this.isloadingattachments = true;

      this.chatService.uploadAttachments(files).subscribe({
        next: (response) => {
          // Ajoute les URLs retournées à attachments
          this.attachments.push(...response.data);

          this.isloadingattachments = false;
          // Tu peux maintenant utiliser attachments dans sendNewMessage
          this.snackbar.open('Fichiers uploadés avec succès', 'Fermer', {
            duration: 3000
          });

        },
        error: (error) => {
          // Gère l’erreur (snackbar, etc.)

          this.isloadingattachments = false;
          console.error('Erreur lors de l\'upload des fichiers', error);
          this.snackbar.open('Erreur lors de l\'upload des fichiers', 'Fermer', {
            duration: 3000
          });
        }
      });
    }
  }


  // send new message
  sendNewMessage() {
    if (this.message.trim() !== '') {
      const payload = {
        conversationId: this.selectedPersonId,
        content: this.message,
        senderType: 'ADMIN',
        attachments: this.attachments.length ? this.attachments : []
      };



      const sent = this.socketService.sendMessage({
        conversationId: payload.conversationId,
        content: payload.content,
        attachments: payload.attachments
      });

      if (sent) {
        this.selectedImages = [];
        // console.log("✅ Message émis via socket:", payload);
      } else {
        console.error("❌ Impossible d’envoyer (socket non connectée)");
      }

      // Ajout optimiste côté front
      this.selectedUserChatHistory.push({
        id: (Math.max(...this.selectedUserChatHistory.map((m) => Number(m.id) || 0), 0) + 1).toString(),
        from: 'Moi',
        to: this.selectedUser.name,
        text: this.message,
        attachments: this.attachments.length ? [...this.attachments] : [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date(),
        isMine: true
      });
      this.attachments = [];

      this.message = '';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Please Enter Any Message.';
    }
  }

  deleteMessage(messageId: string) {
    this.chatService.deleteMessage(messageId).subscribe({
      next: () => {
        this.selectedUserChatHistory = this.selectedUserChatHistory.filter(msg => msg.id !== messageId);
        this.snackbar.open('Message deleted successfully', 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error deleting message', err);
        this.snackbar.open('Error deleting message', 'Close', { duration: 3000 });
      }
    });
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
    if (!searchTerm.trim()) {
      // Si la recherche est vide, restaurer la liste complète
      this.chatService.getConversations().subscribe({
        next: (res) => {
          const items = res.data.items;
          this.chatPersonList = items.map((conversation) =>
            this.mapConversationToChatPerson(conversation)
          );
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des conversations', err);
        }
      });
    } else {
      this.chatService.getConversations().subscribe({
        next: (res) => {
          const items = res.data.items;
          const fullList = items.map((conversation) =>
            this.mapConversationToChatPerson(conversation)
          );
          this.chatPersonList = fullList.filter(
            (person) =>
              person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              person.status.toLowerCase().includes(searchTerm.toLowerCase())
          );
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des conversations', err);
        }
      });
    }
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
