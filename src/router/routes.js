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
