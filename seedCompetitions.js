const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// 🔐 Your config here
const firebaseConfig = {
  apiKey: "AIzaSyBMQgju0ekwv1R15NglrRnBHafMDsaiz7o",
  authDomain: "aluminus-4e20c.firebaseapp.com",
  projectId: "aluminus-4e20c",
  storageBucket: "aluminus-4e20c.appspot.com",
  messagingSenderId: "1035502666701",
  appId: "1:1035502666701:web:deb04f1441c090a64aba84",
  measurementId: "G-Q6RY788KY0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const competitions = [
  {
    title: 'Youth Tech Sprint',
    description: 'A rapid prototyping competition focused on solving urban youth issues using tech.',
    fromDate: new Date('2025-06-20'),
    toDate: new Date('2025-06-22'),
    links: [
      { title: 'Register', url: 'https://example.com/register-techsprint' },
      { title: 'Rules', url: 'https://example.com/rules' }
    ]
  },
  {
    title: 'Eco Fest 2025',
    description: 'Inter-school sustainability showcase and contest.',
    fromDate: new Date('2025-06-15'),
    toDate: new Date('2025-06-18'),
    links: [
      { title: 'Event Brochure', url: 'https://example.com/brochure-eco' }
    ]
  },
  {
    title: 'Artathon',
    description: '48-hour art marathon for digital and traditional artists.',
    fromDate: new Date('2025-06-10'),
    toDate: new Date('2025-06-11'),
    links: [
      { title: 'Signup', url: 'https://example.com/artathon-signup' },
      { title: 'FAQ', url: 'https://example.com/faq-artathon' }
    ]
  },
  {
    title: 'Leadership Conclave',
    description: 'Interactive leadership workshop and public speaking challenge.',
    fromDate: new Date('2025-06-17'),
    toDate: new Date('2025-06-19'),
    links: [
      { title: 'Details', url: 'https://example.com/leadership' }
    ]
  }
];

(async () => {
  for (const comp of competitions) {
    await addDoc(collection(db, 'competitions'), comp);
    console.log(`✅ Added: ${comp.title}`);
  }
})();
