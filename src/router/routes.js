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
        component: () => import('pages/IndexPage.vue')
      },

      // demás que ya tienes
      {
        path: 'event/:id',
        component: () => import('pages/EventDetailPage.vue')
      },
      {
        path: 'my-tickets',
        name: 'my-tickets',
        component: () => import('pages/MyTickets.vue')
      },
      {
        path: 'ticket',
        name: 'ticket-detail',
        component: () => import('pages/TicketDetail.vue')
      }
    ]
  }
]

export default routes
