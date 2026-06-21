import { LegalSection } from '../../terms/content/terms-sections';

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: 'overview',
    title: '1. Overview',
    body: [
      'This Privacy Policy explains how IWX EarnLens ("we", "us", "our") collects, uses, and protects your personal information when you use our income tracking platform.',
      'We are committed to safeguarding your data. By using EarnLens, you consent to the practices described in this policy.',
    ],
  },
  {
    id: 'collection',
    title: '2. Information We Collect',
    body: [
      'Account Information: When you register, we collect your full name, email address, username, and phone number.',
      'Financial Data: Income entries, categories, sources, tags, and all metadata you provide (amounts, dates, notes).',
      'Usage Data: We may collect anonymized usage metrics such as feature usage frequency, session duration, and device type to improve the Service.',
      'We do NOT collect bank credentials, credit card numbers, or connect to financial institutions.',
    ],
  },
  {
    id: 'use',
    title: '3. How We Use Your Information',
    body: [
      'To provide, maintain, and improve the EarnLens platform and its features.',
      'To authenticate your identity and secure your account.',
      'To generate analytics, reports, and insights based on YOUR data, shown only to YOU.',
      'To send transactional communications (password resets, email verification).',
      'We do NOT sell, rent, or share your personal financial data with third parties for advertising.',
    ],
  },
  {
    id: 'storage',
    title: '4. Data Storage & Security',
    body: [
      'Your data is stored on secure, encrypted servers. We use industry-standard security measures including TLS encryption in transit and encryption at rest.',
      'Access to production data is restricted to essential personnel only, under strict access control policies.',
      'While we implement robust security practices, no system is 100% secure. You acknowledge this inherent risk.',
    ],
  },
  {
    id: 'retention',
    title: '5. Data Retention',
    body: [
      'We retain your data for as long as your account is active or as needed to provide the Service.',
      'Upon account deletion, your personal data will be permanently removed within 30 days. Anonymized, aggregated analytics data may be retained indefinitely.',
      'You may request data export at any time through your account settings.',
    ],
  },
  {
    id: 'sharing',
    title: '6. Data Sharing',
    body: [
      'We do not share your personally identifiable financial data with any third party except as required by law.',
      'We may share anonymized, aggregate statistics (e.g., "X% of users track salary income") that cannot identify individual users.',
      'If we engage service providers (hosting, email delivery), they are bound by confidentiality agreements and process data only on our behalf.',
    ],
  },
  {
    id: 'rights',
    title: '7. Your Rights',
    body: [
      'Access: You may request a copy of all personal data we hold about you.',
      'Correction: You may update or correct your account information at any time.',
      'Deletion: You may delete your account and all associated data.',
      'Portability: You may export your data in standard formats.',
      'Objection: You may opt out of non-essential data processing.',
    ],
  },
  {
    id: 'cookies',
    title: '8. Cookies & Local Storage',
    body: [
      'We use essential cookies and localStorage to maintain your authentication session and user preferences (theme, currency).',
      'We do not use third-party tracking cookies or advertising pixels.',
    ],
  },
  {
    id: 'children',
    title: '9. Children\'s Privacy',
    body: [
      'EarnLens is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children.',
    ],
  },
  {
    id: 'changes',
    title: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy periodically. Significant changes will be communicated via email or in-app notification.',
      'Continued use of the Service after changes constitutes acceptance of the revised policy.',
    ],
  },
  {
    id: 'contact',
    title: '11. Contact Us',
    body: [
      'For privacy-related inquiries or to exercise your data rights, contact us at privacy@earnlens.io or through the Contact page.',
    ],
  },
];
