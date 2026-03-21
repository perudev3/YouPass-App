const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [

      // WELCOME (pantalla inicial)
      {
        path: '',
        name: 'welcome',
        component: () => import('pages/WelcomePage.vue'),
        meta: { hideHeader: true }
      },

      // LOGIN TELÉFONO
      {
        path: 'login-phone',
        name: 'login-phone',
        component: () => import('pages/LoginPhonePage.vue'),
        meta: { hideHeader: true }
      },

      {
        path: 'register-profile',
        name: 'register-profile',
        component: () => import('pages/RegisterProfile.vue'),
        meta: { hideHeader: true }
      },

      // OTP
      {
        path: 'verify-otp',
        name: 'verify-otp',
        component: () => import('pages/VerifyOtp.vue'),
        meta: { hideHeader: true }
      },

      // INDEX (app interna)
      {
        path: 'home',
        name: 'home',
        component: () => import('pages/IndexPage.vue'),
        meta: { requiresAuth: true }
      },

      // demás que ya tienes
      {
        path: 'event/:id',
        component: () => import('pages/EventDetailPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'my-tickets',
        name: 'my-tickets',
        component: () => import('pages/MyTickets.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: '/my-tickets/:ticketId/invitations',
        component: () => import('pages/InvitationsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'my-invitations',
        name: 'my-invitations',
        component: () => import('pages/MyInvitationsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'ticket',
        name: 'ticket-detail',
        component: () => import('pages/TicketDetail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'configurations',
        name: 'configurations',
        component: () => import('pages/Configurations.vue'),
        meta: { requiresAuth: true }
      },
    ]
  }
]

export default routes
