importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyBlrOVyRiz_zFCBpDD9_ENlsqvsN6T9AKE',
  authDomain: 'health-app-330d6.firebaseapp.com',
  projectId: 'health-app-330d6',
  storageBucket: 'health-app-330d6.firebasestorage.app',
  messagingSenderId: '96567771742',
  appId: '1:96567771742:web:f42979f875fbd9782eaacf',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  const { title, body, icon } = payload.notification || {}
  self.registration.showNotification(title || 'HealthCheck', {
    body: body || '',
    icon: icon || '/icon.svg',
    badge: '/icon.svg',
    data: payload.data,
  })
})
