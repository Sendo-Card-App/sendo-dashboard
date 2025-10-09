import { Navigation } from 'src/app/@theme/types/navigation';
import { Role1 } from 'src/app/@theme/types/user';

export const menus: Navigation[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
    Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR
    ],
    children: [
      {
        id: 'sample-page',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: '#custom-status-up'
      },
      {
        id: 'commission',
        title: 'Commissions',
        type: 'item',
        classes: 'nav-item',
        url: '/commission/all',
        icon: '#custom-message-2',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN],
      },
    ]
  },

  {
    id: 'pages',
    title: 'Pages',
    type: 'group',
    icon: 'icon-navigation',
    role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
    Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR
    ],
    children: [

      {
        id: 'Utilisateur',
        title: 'Utilisateurs',
        type: 'collapse',
        icon: '#custom-user',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'alluser',
            title: 'Liste des utilisateurs',
            type: 'item',
            url: '/users/alluser',
            // target: true,
            breadcrumbs: true,
            role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
            Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
          },
          {
            id: 'adduser',
            title: 'Creer un utilisateur',
            type: 'item',
            url: '/users/adduser',
            // target: true,
            breadcrumbs: true,
            role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN]
          },

        ]
      },
      {
        id: 'Transaction',
        title: 'Transactions',
        type: 'collapse',
        icon: '#custom-presentation-chart',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'alltransaction',
            title: 'Liste des transactions',
            type: 'item',
            url: '/transactions/alltransactions',
            // target: true,
            role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
            Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
            breadcrumbs: true
          },
          {
            id: 'alltransaction',
            title: 'Transaction Ca-Cam',
            type: 'item',
            url: '/transactions/ca-cam',
            // target: true,
            role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
            Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
            breadcrumbs: true
          },

        ]
      },
      {
        id: 'kyc',
        title: 'KYC request',
        type: 'collapse',
        icon: '#custom-document-filter',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'allkyc',
            title: 'KYC en attente',
            type: 'item',
            url: '/kyc/kyc-pending',
            // target: true,
            breadcrumbs: true,
            role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER],
          },
          {
            id: 'allkyc',
            title: 'Liste des KYC',
            type: 'item',
            url: '/kyc/kyc-all',
            // target: true,
            role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER,
            Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
            breadcrumbs: true
          },


        ]
      },
      {
        id: 'Requests',
        title: 'Requests',
        type: 'collapse',
        icon: '#custom-bill',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'allkyc',
            title: 'Liste des demandes',
            type: 'item',
            url: '/requests/allrequests',
            // target: true,
            breadcrumbs: true
          },


        ]
      },
      {
        id: 'shared',
        title: 'Depenses Partagées',
        type: 'collapse',
        icon: '#custom-level',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'allshared',
            title: 'Liste des depenses partagées',
            type: 'item',
            url: '/shared-expenses/all',
            // target: true,
            breadcrumbs: true
          },


        ]
      },
      {
        id: 'shared',
        title: 'Demandes de fonds',
        type: 'collapse',
        icon: '#custom-shield',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'allshared',
            title: 'Liste des demandes de fonds',
            type: 'item',
            url: '/fund-requests/all',
            // target: true,
            breadcrumbs: true
          },


        ]
      },
      {
        id: 'tontine',
        title: 'Tontines',
        type: 'collapse',
        icon: '#custom-bill',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'alltontine',
            title: 'Liste des tontines',
            type: 'item',
            url: '/tontines/all',
            // target: true,
            breadcrumbs: true
          },


        ]
      },
      {
        id: 'demande de carte',
        title: 'Demande de carte',
        type: 'collapse',
        icon: '#custom-bill',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER, Role1.CUSTOMER_ADVISER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'allrequest',
            title: 'Liste des demandes',
            type: 'item',
            url: '/onboarding/card',
            // target: true,
            breadcrumbs: true
          },


        ]
      },
      {
        id: 'gestion carte',
        title: 'Gestion de carte',
        type: 'collapse',
        icon: '#custom-bill',
         role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN, Role1.CARD_MANAGER, Role1.COMPLIANCE_OFFICER,
        Role1.MANAGEMENT_CONTROLLER, Role1.TECHNICAL_DIRECTOR],
        children: [
          {
            id: 'allrequest',
            title: 'Liste des cartes',
            type: 'item',
            url: '/card/all',
            // target: true,
            breadcrumbs: true
          },


        ]
      },
    ]
  },
  {
    id: 'Section Publicite',
    title: 'Publicité',
    type: 'group',
    icon: 'icon-navigation',
     role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN,],
    children: [
      {
        id: 'publicite',
        title: 'Publicité',
        type: 'collapse',
        icon: '#custom-row-vertical',
        role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN,],
        children: [
          {
            id: 'allpublicite',
            title: 'Liste des publicités',
            type: 'item',
            url: '/publicites/all',
            role: [Role1.SUPER_ADMIN, Role1.SYSTEM_ADMIN,],
            // target: true,
            breadcrumbs: true
          },
          {
            id: 'addpublicite',
            title: 'Ajouter une publicité',
            type: 'item',
            url: '/publicites/create',
            // target: true,
            role: [Role1.SUPER_ADMIN,],
            breadcrumbs: true
          },

        ]
      },
    ]
  },
  {
    id: 'Paramettres',
    title: 'Paramettres',
    type: 'group',
    icon: 'icon-navigation',
    role: [Role1.SUPER_ADMIN, Role1.CUSTOMER_ADVISER,],
    children: [
      {
        id: 'configuration',
        title: 'Configuration',
        type: 'collapse',
        icon: '#custom-row-vertical',
        role: [Role1.SUPER_ADMIN, Role1.CUSTOMER_ADVISER],
        children: [
          {
            id: 'allconfiguration',
            title: 'Liste des configs',
            type: 'item',
            url: '/configuration/allconfiguration',
            // target: true,
            breadcrumbs: true,
            role: [Role1.SUPER_ADMIN, Role1.TECHNICAL_DIRECTOR, Role1.MANAGEMENT_CONTROLLER]
          },

        ]
      },
      {
        id: 'cht',
        title: 'Support Client',
        type: 'item',
        classes: 'nav-item',
        url: '/chat',
        icon: '#custom-message-2',
        role: [Role1.SUPER_ADMIN, Role1.CUSTOMER_ADVISER,]
      },
    ]
  },
];
