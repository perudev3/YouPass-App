const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/IndexPage.vue')
      },
      {
        path: 'event/:id',
        component: () => import('pages/EventDetailPage.vue')
      },
      {
        path: '/login-phone',
        component: () => import('pages/LoginPhonePage.vue'),
        meta: { hideHeader: true }
      },
      {
        path: '/register-profile',
        component: () => import('pages/RegisterProfile.vue')
      },
      {
        path: '/my-tickets',
        name: 'my-tickets',
        component: () => import('pages/MyTickets.vue')
      },
      {
        path: '/ticket',
        name: 'ticket-detail',
        component: () => import('pages/TicketDetail.vue')
      },
      {
        path: '/scan-ticket',
        component: () => import('pages/ScanTicket.vue'),
        meta: { requiresAuth: true }
      }

    ]
  },
  {
    path: '/verify-otp',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'verify-otp',
        component: () => import('pages/VerifyOtp.vue'),
        meta: { hideHeader: true }
      }
    ]
  },
  
]

export default routes
