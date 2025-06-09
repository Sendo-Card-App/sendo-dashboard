import { Navigation } from 'src/app/@theme/types/navigation';
import { Role } from 'src/app/@theme/types/role';

export const menus: Navigation[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    role: [Role.Admin, Role.User],
    children: [
      {
        id: 'sample-page',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: '#custom-status-up'
      }
    ]
  },

  {
    id: 'pages',
    title: 'Pages',
    type: 'group',
    icon: 'icon-navigation',
    role: [Role.Admin, Role.User],
    children: [
      {
        id: 'Utilisateur',
        title: 'Utilisateurs',
        type: 'collapse',
        icon: '#custom-user',
        role: [Role.Admin, Role.User],
        children: [
          {
            id: 'alluser',
            title: 'Liste des utilisateurs',
            type: 'item',
            url: '/users/alluser',
            // target: true,
            breadcrumbs: true
          },
          {
            id: 'adduser',
            title: 'Creer un utilisateur',
            type: 'item',
            url: '/users/adduser',
            // target: true,
            breadcrumbs: true
          },

        ]
      },
      {
        id: 'Transaction',
        title: 'Transactions',
        type: 'collapse',
        icon: '#custom-presentation-chart',
        role: [Role.Admin, Role.User],
        children: [
          {
            id: 'alltransaction',
            title: 'Liste des transactions',
            type: 'item',
            url: '/transactions/alltransactions',
            // target: true,
            breadcrumbs: true
          },
          {
            id: 'alltransaction',
            title: 'Transaction Ca-Cam',
            type: 'item',
            url: '/transactions/ca-cam',
            // target: true,
            breadcrumbs: true
          },
          {
            id: 'addtransaction',
            title: 'Creer une transaction',
            type: 'item',
            url: '/transactions/addtransaction',
            // target: true,
            breadcrumbs: true
          },

        ]
      },
      {
        id: 'kyc',
        title: 'KYC request',
        type: 'collapse',
        icon: '#custom-document-filter',
        role: [Role.Admin, Role.User],
        children: [
          {
            id: 'allkyc',
            title: 'KYC en attente',
            type: 'item',
            url: '/kyc/kyc-pending',
            // target: true,
            breadcrumbs: true
          },
          {
            id: 'allkyc',
            title: 'Liste des KYC',
            type: 'item',
            url: '/kyc/kyc-all',
            // target: true,
            breadcrumbs: true
          },


        ]
      },
      {
        id: 'Request',
        title: 'Requests',
        type: 'collapse',
        icon: '#custom-bill',
        role: [Role.Admin, Role.User],
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
        role: [Role.Admin, Role.User],
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
        role: [Role.Admin, Role.User],
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
        role: [Role.Admin, Role.User],
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
    ]
  },
   {
    id: 'Paramettres',
    title: 'Paramettres',
    type: 'group',
    icon: 'icon-navigation',
    role: [Role.Admin, Role.User],
    children: [
      {
        id: 'configuration',
        title: 'Configuration',
        type: 'collapse',
        icon: '#custom-row-vertical',
        role: [Role.Admin, Role.User],
        children: [
          {
            id: 'allconfiguration',
            title: 'Liste des configs',
            type: 'item',
            url: '/configuration/allconfiguration',
            // target: true,
            breadcrumbs: true
          },

        ]
      },
    ]
  },
  // {
  //   id: 'other',
  //   title: 'Other',
  //   type: 'group',
  //   icon: 'icon-navigation',
  //   role: [Role.Admin, Role.User],
  //   children: [
  //     {
  //       id: 'menu-levels',
  //       title: 'Menu levels',
  //       type: 'collapse',
  //       icon: '#custom-level',
  //       role: [Role.Admin, Role.User],
  //       children: [
  //         {
  //           id: 'level-2-1',
  //           title: 'Level 2.1',
  //           type: 'item',
  //           url: 'javascript:',
  //           external: true
  //         },
  //         {
  //           id: 'menu-level-2.2',
  //           title: 'Menu Level 2.2',
  //           type: 'collapse',
  //           classes: 'edge',
  //           role: [Role.Admin, Role.User],
  //           children: [
  //             {
  //               id: 'menu-level-3.1',
  //               title: 'Menu Level 3.1',
  //               type: 'item',
  //               url: 'javascript:',
  //               external: true
  //             },
  //             {
  //               id: 'menu-level-3.2',
  //               title: 'Menu Level 3.2',
  //               type: 'item',
  //               url: 'javascript:',
  //               external: true
  //             },
  //             {
  //               id: 'menu-level-3.3',
  //               title: 'Menu Level 3.3',
  //               type: 'collapse',
  //               classes: 'edge',
  //               role: [Role.Admin, Role.User],
  //               children: [
  //                 {
  //                   id: 'menu-level-4.1',
  //                   title: 'Menu Level 4.1',
  //                   type: 'item',
  //                   url: 'javascript:',
  //                   external: true
  //                 },
  //                 {
  //                   id: 'menu-level-4.2',
  //                   title: 'Menu Level 4.2',
  //                   type: 'item',
  //                   url: 'javascript:',
  //                   external: true
  //                 }
  //               ]
  //             }
  //           ]
  //         },
  //         {
  //           id: 'menu-level-2.3',
  //           title: 'Menu Level 2.3',
  //           type: 'collapse',
  //           classes: 'edge',
  //           role: [Role.Admin, Role.User],
  //           children: [
  //             {
  //               id: 'menu-level-3.1',
  //               title: 'Menu Level 3.1',
  //               type: 'item',
  //               url: 'javascript:',
  //               external: true
  //             },
  //             {
  //               id: 'menu-level-3.2',
  //               title: 'Menu Level 3.2',
  //               type: 'item',
  //               url: 'javascript:',
  //               external: true
  //             },
  //             {
  //               id: 'menu-level-3.3',
  //               title: 'Menu Level 3.3',
  //               type: 'collapse',
  //               classes: 'edge',
  //               role: [Role.Admin, Role.User],
  //               children: [
  //                 {
  //                   id: 'menu-level-4.1',
  //                   title: 'Menu Level 4.1',
  //                   type: 'item',
  //                   url: 'javascript:',
  //                   external: true
  //                 },
  //                 {
  //                   id: 'menu-level-4.2',
  //                   title: 'Menu Level 4.2',
  //                   type: 'item',
  //                   url: 'javascript:',
  //                   external: true
  //                 }
  //               ]
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       id: 'document',
  //       title: 'Document',
  //       type: 'item',
  //       classes: 'nav-item',
  //       url: 'https://phoenixcoded.gitbook.io/able-pro',
  //       icon: '#custom-gitBook',
  //       target: true,
  //       external: true
  //     }
  //   ]
  // }
];
