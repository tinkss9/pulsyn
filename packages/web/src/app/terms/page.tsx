import Link from 'next/link';

export default function TermsPage() {
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
          <h1>Terms of Service</h1>
          <p className="text-gray-400">Last updated: August 4, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Pulsyn (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Pulsyn is a change data capture (CDC) platform that enables real-time data replication between databases.
            The Service includes a web dashboard, REST API, CLI tools, MCP server integration, and AI-powered features.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            You must provide accurate information when creating an account. You are responsible for maintaining
            the security of your account credentials and API keys. Notify us immediately of any unauthorized use.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to other systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use the Service to transmit malicious code or data</li>
            <li>Exceed rate limits or spending caps without authorization</li>
            <li>Resell the Service without a valid reseller agreement</li>
          </ul>

          <h2>5. Data and Privacy</h2>
          <p>
            Your data remains yours. We process data only to provide the Service. See our{' '}
            <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link> for details.
          </p>

          <h2>6. Pricing and Payment</h2>
          <p>
            Paid plans are billed monthly or annually. All fees are non-refundable except as required by law.
            We reserve the right to change pricing with 30 days notice.
          </p>

          <h2>7. Service Level</h2>
          <p>
            We strive for 99.9% uptime for paid plans. The Service is provided &quot;as is&quot; without warranties
            of any kind. We are not liable for any downtime or data loss.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            In no event shall Pulsyn be liable for any indirect, incidental, special, consequential, or punitive
            damages arising from your use of the Service.
          </p>

          <h2>9. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violation of these Terms. You may cancel
            your account at any time through the dashboard.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes constitutes
            acceptance of the new Terms.
          </p>

          <h2>11. Contact</h2>
          <p>
            Questions about these Terms? Contact us at{' '}
            <a href="mailto:legal@pulsyn.io" className="text-cyan-400 hover:text-cyan-300">legal@pulsyn.io</a>.
          </p>
        </div>
      </main>
    </div>
  );
}
