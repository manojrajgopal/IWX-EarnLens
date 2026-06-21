/**
 * Terms of Service content sections.
 * Each section has a heading and body paragraphs.
 * Centralized here so the page template stays clean.
 */

export interface LegalSection {
  id: string;
  title: string;
  body: string[];
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using EarnLens ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not use the Service.',
      'We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the revised terms.',
    ],
  },
  {
    id: 'description',
    title: '2. Description of Service',
    body: [
      'EarnLens is a personal income tracking and analytics platform that allows users to record, categorize, and analyze their income streams.',
      'We provide tools for income entry, recurring payment automation, category and source management, reporting, and analytical insights.',
    ],
  },
  {
    id: 'accounts',
    title: '3. User Accounts',
    body: [
      'You must provide accurate, complete, and current information during registration. You are responsible for maintaining the confidentiality of your account credentials.',
      'You are solely responsible for all activity that occurs under your account. Notify us immediately if you suspect unauthorized access.',
      'One person may not maintain more than one account. Accounts are non-transferable.',
    ],
  },
  {
    id: 'data',
    title: '4. Your Data',
    body: [
      'You retain all ownership rights to the financial data you enter into EarnLens. We do not claim ownership over your content.',
      'You grant us a limited license to process, store, and display your data solely for the purpose of providing the Service to you.',
      'You may export or delete your data at any time through the platform settings.',
    ],
  },
  {
    id: 'prohibited',
    title: '5. Prohibited Activities',
    body: [
      'You agree not to: attempt to gain unauthorized access to other accounts or systems; use the Service for any unlawful purpose; reverse engineer, decompile, or disassemble any part of the Service; introduce malicious code or interfere with the Service infrastructure.',
      'Violation of these terms may result in immediate account termination without notice.',
    ],
  },
  {
    id: 'availability',
    title: '6. Service Availability',
    body: [
      'We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or circumstances beyond our control.',
      'We are not liable for any loss or damage resulting from service interruptions.',
    ],
  },
  {
    id: 'limitation',
    title: '7. Limitation of Liability',
    body: [
      'EarnLens is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will meet your specific requirements.',
      'In no event shall IWX or its affiliates be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.',
      'Our total liability shall not exceed the amount paid by you, if any, in the twelve months preceding the claim.',
    ],
  },
  {
    id: 'termination',
    title: '8. Termination',
    body: [
      'Either party may terminate this agreement at any time. You may delete your account through settings. We may suspend or terminate accounts that violate these terms.',
      'Upon termination, your right to use the Service ceases immediately. We may retain anonymized, aggregated data for analytical purposes.',
    ],
  },
  {
    id: 'governing',
    title: '9. Governing Law',
    body: [
      'These terms shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms shall be resolved through binding arbitration.',
    ],
  },
  {
    id: 'contact',
    title: '10. Contact',
    body: [
      'For questions about these Terms of Service, please contact us through the Contact page or email us at legal@earnlens.io.',
    ],
  },
];
