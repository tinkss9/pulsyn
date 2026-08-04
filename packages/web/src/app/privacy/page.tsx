import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="fixed top-0 w-full bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cyan-400">Pulsyn</Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white">Pricing</Link>
            <Link href="/docs" className="text-sm text-gray-400 hover:text-white">Docs</Link>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto prose prose-invert prose-cyan">
          <h1>Privacy Policy</h1>
          <p className="text-gray-400">Last updated: August 4, 2026</p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly:</p>
          <ul>
            <li><strong>Account information:</strong> Name, email address, organization name</li>
            <li><strong>Payment information:</strong> Billing details (processed by Stripe, not stored by us)</li>
            <li><strong>API keys:</strong> Generated keys for Service access (stored as hashes)</li>
            <li><strong>Usage data:</strong> Pipeline configurations, connector settings, query patterns</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process transactions and send billing communications</li>
            <li>Send Service-related announcements and security alerts</li>
            <li>Monitor and analyze usage patterns for Service improvement</li>
            <li>Detect and prevent fraud, abuse, and security incidents</li>
          </ul>

          <h2>3. Data Processing</h2>
          <p>
            Your data flows through our CDC pipelines only to provide the Service. We do not sell your data to
            third parties. Data is processed in the region closest to your selected deployment.
          </p>

          <h2>4. Data Storage and Security</h2>
          <p>
            We use industry-standard encryption in transit (TLS 1.3) and at rest (AES-256). Database credentials
            and API keys are stored as cryptographic hashes. We regularly audit our security practices.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. Upon account deletion, we remove your
            data within 30 days, except where required by law.
          </p>

          <h2>6. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Supabase:</strong> Database hosting and authentication</li>
            <li><strong>Vercel:</strong> Application hosting and deployment</li>
            <li><strong>Stripe:</strong> Payment processing</li>
            <li><strong>DeepSeek / Anthropic:</strong> AI language model services</li>
          </ul>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in standard formats</li>
            <li>Opt out of non-essential communications</li>
          </ul>

          <h2>8. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use tracking cookies
            or third-party advertising cookies.
          </p>

          <h2>9. Children&apos;s Privacy</h2>
          <p>
            The Service is not intended for users under 16. We do not knowingly collect information from children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes via
            email or Service announcement.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about this Privacy Policy? Contact us at{' '}
            <a href="mailto:privacy@pulsyn.io" className="text-cyan-400 hover:text-cyan-300">privacy@pulsyn.io</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
