import { Metadata } from 'next';
import Header from '@/components/Header';
import Link from 'next/link';
import { CheckCircle, Clock, Eye, Database, Cloud, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Connector Certification | Pulsyn',
  description: 'Pulsyn connector certification methodology and status. See which connectors are certified, verified, or in preview.',
};

// Real certification data — aligned with actual connector implementations
const certificationStats = {
  certified: 4,      // PostgreSQL, MySQL, MongoDB, Redis — integration tested
  verified: 8,       // SQL Server, DynamoDB, Kafka, CosmosDB, S3, Supabase, Snowflake, BigQuery
  preview: 40,       // SaaS connectors with real API endpoints
  total: 52,
  lastUpdated: '2026-08-09',
};

const certifiedConnectors = [
  { name: 'PostgreSQL', type: 'Source + Target', driver: 'pg', cdc: 'wal2json + pgoutput', lines: 751, status: 'certified' },
  { name: 'MySQL', type: 'Source', driver: 'mysql2/promise', cdc: 'Poll-based watermark', lines: 235, status: 'certified' },
  { name: 'MongoDB', type: 'Source', driver: 'mongodb', cdc: 'Change Streams', lines: 203, status: 'certified' },
  { name: 'Redis', type: 'Source', driver: 'ioredis', cdc: 'Keyspace notifications', lines: 199, status: 'certified' },
];

const verifiedConnectors = [
  { name: 'SQL Server', type: 'Source', driver: 'mssql', cdc: 'Change Tracking', lines: 135 },
  { name: 'DynamoDB', type: 'Source', driver: '@aws-sdk/client-dynamodb', cdc: 'DynamoDB Streams', lines: 195 },
  { name: 'Kafka', type: 'Source', driver: 'kafkajs', cdc: 'Consumer groups', lines: 197 },
  { name: 'CosmosDB', type: 'Source', driver: '@azure/cosmos', cdc: 'Change Feed', lines: 182 },
  { name: 'S3', type: 'Source', driver: '@aws-sdk/client-s3', cdc: 'Polling', lines: 122 },
  { name: 'Supabase', type: 'Source', driver: 'REST (fetch)', cdc: 'Polling', lines: 150 },
  { name: 'Snowflake', type: 'Target', driver: 'snowflake-sdk', cdc: 'N/A (write-only)', lines: 180 },
  { name: 'BigQuery', type: 'Target', driver: '@google-cloud/bigquery', cdc: 'N/A (write-only)', lines: 160 },
];

const previewConnectors = [
  { name: 'Stripe', category: 'Payments', endpoint: '/v1/customers' },
  { name: 'Salesforce', category: 'CRM', endpoint: '/query?q=SELECT...' },
  { name: 'HubSpot', category: 'CRM', endpoint: '/crm/v3/objects/contacts' },
  { name: 'GitHub', category: 'DevOps', endpoint: '/repos/{owner}/{repo}' },
  { name: 'Slack', category: 'Communication', endpoint: '/conversations.list' },
  { name: 'Jira', category: 'Project Management', endpoint: '/rest/api/3/search' },
  { name: 'Notion', category: 'Productivity', endpoint: '/v1/databases' },
  { name: 'Twilio', category: 'Communication', endpoint: '/2010-04-01/Messages' },
  { name: 'SendGrid', category: 'Email', endpoint: '/v3/mail/send' },
  { name: 'Intercom', category: 'Support', endpoint: '/contacts' },
  { name: 'Linear', category: 'Project Management', endpoint: '/graphql' },
  { name: 'Figma', category: 'Design', endpoint: '/v1/files' },
  { name: 'Calendly', category: 'Scheduling', endpoint: '/scheduled_events' },
  { name: 'Zoom', category: 'Communication', endpoint: '/v2/users/me/meetings' },
  { name: 'Dropbox', category: 'Storage', endpoint: '/2/files/list_folder' },
  { name: 'Google Drive', category: 'Storage', endpoint: '/drive/v3/files' },
  { name: 'Google Sheets', category: 'Productivity', endpoint: '/v4/spreadsheets' },
  { name: 'OneDrive', category: 'Storage', endpoint: '/v1.0/me/drive' },
  { name: 'Mailchimp', category: 'Email', endpoint: '/3.0/lists' },
  { name: 'Klaviyo', category: 'Marketing', endpoint: '/api/profiles' },
  { name: 'Chargebee', category: 'Billing', endpoint: '/v2/subscriptions' },
  { name: 'PagerDuty', category: 'Incident Management', endpoint: '/incidents' },
  { name: 'Datadog', category: 'Monitoring', endpoint: '/api/v1/monitor' },
  { name: 'NewRelic', category: 'Monitoring', endpoint: '/v2/applications' },
  { name: 'Grafana', category: 'Monitoring', endpoint: '/api/dashboards' },
  { name: 'Cloudflare', category: 'Infrastructure', endpoint: '/zones' },
  { name: 'Vercel', category: 'Deployment', endpoint: '/v9/projects' },
  { name: 'Netlify', category: 'Deployment', endpoint: '/api/v1/sites' },
  { name: 'WordPress', category: 'CMS', endpoint: '/wp-json/wp/v2/posts' },
  { name: 'Microsoft Teams', category: 'Communication', endpoint: '/v1.0/chats' },
  { name: 'ActiveCampaign', category: 'Marketing', endpoint: '/api/3/contacts' },
  { name: 'Amplitude', category: 'Analytics', endpoint: '/2/export' },
  { name: 'Mixpanel', category: 'Analytics', endpoint: '/api/2.0/engage' },
  { name: 'PostHog', category: 'Analytics', endpoint: '/api/projects' },
  { name: 'Google Analytics', category: 'Analytics', endpoint: '/v4/reports:batchGet' },
  { name: 'Webflow', category: 'CMS', endpoint: '/v2/sites' },
  { name: 'Loom', category: 'Video', endpoint: '/v2/videos' },
  { name: 'Retool', category: 'Internal Tools', endpoint: '/v1/workflows' },
  { name: 'Metabase', category: 'Analytics', endpoint: '/api/card' },
  { name: 'Squarespace', category: 'CMS', endpoint: '/v1/commerce/products' },
];

export default function CertificationPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Connector Certification
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            We're building connectors the right way — real drivers, real APIs, real testing.
            Here's exactly what's ready and what's coming.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
              <div className="text-3xl font-bold text-green-400">{certificationStats.certified}</div>
              <div className="text-sm text-gray-400">Certified</div>
            </div>
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="text-3xl font-bold text-blue-400">{certificationStats.verified}</div>
              <div className="text-sm text-gray-400">Verified</div>
            </div>
            <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="text-3xl font-bold text-purple-400">{certificationStats.preview}</div>
              <div className="text-sm text-gray-400">Preview</div>
            </div>
            <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
              <div className="text-3xl font-bold text-cyan-400">{certificationStats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Tiers */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Certification Tiers</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Certified */}
            <div className="p-6 rounded-xl border border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-semibold text-green-400">Certified</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Full production readiness. Native database drivers, CDC support, integration tested.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Native driver (not REST API)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Real CDC implementation
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Integration tested with Docker
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  Benchmark data published
                </li>
              </ul>
            </div>
            
            {/* Verified */}
            <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-blue-400">Verified</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Real drivers, real code. Connects and extracts data. CDC may be incomplete.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  Native driver installed
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  Connection + extraction works
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">~</span>
                  CDC may use polling (not native)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">~</span>
                  Pending integration tests
                </li>
              </ul>
            </div>
            
            {/* Preview */}
            <div className="p-6 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-purple-400">Preview</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Real API endpoints, real schemas. Works with valid credentials. Community tested.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  Real API endpoint
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  Schema defined
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">✓</span>
                  Auth + pagination handled
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">~</span>
                  Not yet integration tested
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Certified Connectors */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold">Certified Connectors</h2>
          </div>
          <p className="text-gray-400 mb-8">
            These connectors have native database drivers, real CDC implementations, and have been tested against live database instances.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {certifiedConnectors.map((conn) => (
              <div key={conn.name} className="bg-white/[0.02] border border-green-500/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{conn.name}</h3>
                  <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded">Certified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>{' '}
                    <span className="text-gray-300">{conn.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Driver:</span>{' '}
                    <span className="text-gray-300">{conn.driver}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">CDC:</span>{' '}
                    <span className="text-gray-300">{conn.cdc}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Lines:</span>{' '}
                    <span className="text-gray-300">{conn.lines}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Connectors */}
      <section className="py-16 px-6 border-t border-white/10 bg-white/[0.01]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Verified Connectors</h2>
          </div>
          <p className="text-gray-400 mb-8">
            These connectors use real database drivers and can connect, discover schemas, and extract data. 
            CDC implementations vary — some use native features, others use polling. Integration testing is in progress.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {verifiedConnectors.map((conn) => (
              <div key={conn.name} className="bg-white/[0.02] border border-blue-500/10 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">{conn.name}</h3>
                  <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">Verified</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>{' '}
                    <span className="text-gray-300">{conn.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Driver:</span>{' '}
                    <span className="text-gray-300">{conn.driver}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">CDC:</span>{' '}
                    <span className="text-gray-300">{conn.cdc}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Connectors */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-bold">Preview Connectors</h2>
              </div>
              <p className="text-gray-400">
                These SaaS connectors have real API endpoints and schemas. They work with valid credentials 
                and use the SaaSConnector base class for auth, pagination, rate limiting, and CDC polling.
              </p>
            </div>
            <span className="text-sm text-gray-500">{previewConnectors.length} connectors</span>
          </div>
          
          <div className="bg-white/[0.02] border border-purple-500/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_1fr] gap-4 px-5 py-3 border-b border-white/5 text-xs text-gray-500 uppercase">
              <div>Connector</div>
              <div>Category</div>
              <div>API Endpoint</div>
            </div>
            {previewConnectors.map((conn) => (
              <div key={conn.name} className="grid grid-cols-[1fr_120px_1fr] gap-4 px-5 py-3 border-b border-white/5 hover:bg-white/[0.02]">
                <div className="font-medium">{conn.name}</div>
                <div className="text-sm text-gray-400">{conn.category}</div>
                <div className="text-sm text-gray-500 font-mono truncate">{conn.endpoint}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl border border-purple-500/10 bg-purple-500/5">
            <p className="text-sm text-purple-300">
              <strong>Work in Progress:</strong> We're actively certifying these connectors. 
              Preview connectors work with valid API credentials but haven't been integration tested yet. 
              Want to help? <Link href="/contact" className="underline hover:text-purple-200">Get in touch</Link> or 
              try them yourself — report issues on GitHub.
            </p>
          </div>
        </div>
      </section>

      {/* Certification Roadmap */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Certification Roadmap</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 w-px bg-green-400/20" />
              </div>
              <div className="pb-6">
                <div className="text-sm text-green-400 font-medium mb-1">Complete</div>
                <h3 className="font-semibold mb-2">Core Database Connectors</h3>
                <p className="text-sm text-gray-400">
                  PostgreSQL, MySQL, MongoDB, Redis — certified with real CDC, Docker integration tests, and benchmark data.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <div className="flex-1 w-px bg-blue-400/20" />
              </div>
              <div className="pb-6">
                <div className="text-sm text-blue-400 font-medium mb-1">In Progress</div>
                <h3 className="font-semibold mb-2">Database Targets + Additional Sources</h3>
                <p className="text-sm text-gray-400">
                  Snowflake, BigQuery, SQL Server, DynamoDB, Kafka, CosmosDB — real drivers installed, integration tests pending.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <div className="flex-1 w-px bg-purple-400/20" />
              </div>
              <div className="pb-6">
                <div className="text-sm text-purple-400 font-medium mb-1">Planned</div>
                <h3 className="font-semibold mb-2">Tier 1 SaaS Connectors</h3>
                <p className="text-sm text-gray-400">
                  Stripe, Salesforce, HubSpot, GitHub — integration testing against sandbox environments. Target: Q4 2026.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium mb-1">Future</div>
                <h3 className="font-semibold mb-2">Remaining SaaS Connectors</h3>
                <p className="text-sm text-gray-400">
                  Community-driven certification. Submit test results, get certified. We provide the framework.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Help Us Certify Connectors</h2>
          <p className="text-gray-400 mb-8">
            We're looking for beta testers with real API credentials to help certify Preview connectors.
            Early contributors get free Pro access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              Join Beta Program <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="https://github.com/tinkss9/pulsyn"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
