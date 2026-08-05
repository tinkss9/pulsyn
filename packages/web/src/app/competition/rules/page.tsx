import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Shield, AlertTriangle, Scale, FileText, 
  ChevronRight, Globe, Users, Lock, Ban
} from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <Link href="/competition" className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-4">
              ← Back to Competition
            </Link>
            <h1 className="text-4xl font-bold mb-4">Competition Rules</h1>
            <p className="text-gray-400">
              The Pulsyn Replication Race — Season 1 Official Rules
            </p>
            <div className="text-sm text-gray-500 mt-2">Last updated: August 4, 2026</div>
          </div>
          
          {/* Important Legal Notice */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-300 mb-2">Important Legal Notice</h3>
                <p className="text-sm text-amber-200/80">
                  This is a <strong>skill-based competition</strong>, not a lottery, raffle, or gambling activity. 
                  Winners are determined entirely by objective, measurable performance metrics (rows replicated per second, 
                  data integrity, checkpoint recovery speed). No element of chance determines outcomes. 
                  Entry fees cover infrastructure costs and are not wagers.
                </p>
              </div>
            </div>
          </div>
          
          {/* Table of Contents */}
          <nav className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 mb-12">
            <h2 className="font-semibold mb-4">Contents</h2>
            <ul className="space-y-2 text-sm">
              {[
                '#eligibility', '#entry', '#phases', '#scoring', '#prizes',
                '#anti-cheat', '#legal', '#gambling', '#privacy', '#disputes'
              ].map((href, i) => (
                <li key={href}>
                  <a href={href} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    {[
                      'Eligibility', 'Entry & Fees', 'Competition Phases', 'Scoring System',
                      'Prizes & Distribution', 'Anti-Cheat & Fair Play', 'Legal Classification',
                      'Gambling Compliance', 'Privacy & Data', 'Disputes & Appeals'
                    ][i]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Rules Content */}
          <div className="space-y-12">
            {/* Eligibility */}
            <section id="eligibility">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-cyan-400" />
                1. Eligibility
              </h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <ul className="space-y-2">
                  <li>• Open to individuals aged 18+ worldwide</li>
                  <li>• Employees of Pulsyn, Inc. and their immediate families are ineligible</li>
                  <li>• Residents of countries under US trade sanctions are excluded (Cuba, Iran, North Korea, Syria, Crimea region)</li>
                  <li>• void where prohibited by local law</li>
                  <li>• One account per person. Duplicate accounts result in disqualification</li>
                  <li>• Teams may compete, but only one person may register per account</li>
                </ul>
              </div>
            </section>
            
            {/* Entry */}
            <section id="entry">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-cyan-400" />
                2. Entry & Fees
              </h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] rounded-lg p-4">
                    <div className="font-semibold mb-2">Qualifier Rounds</div>
                    <div className="text-2xl font-bold text-green-400">FREE</div>
                    <div className="text-sm text-gray-400">No entry fee. Open to all eligible participants.</div>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-4">
                    <div className="font-semibold mb-2">Semifinals</div>
                    <div className="text-2xl font-bold text-amber-400">$5</div>
                    <div className="text-sm text-gray-400">Covers infrastructure costs. Non-refundable.</div>
                  </div>
                </div>
                <p>
                  Entry fees are used exclusively to cover cloud infrastructure costs (compute, storage, bandwidth) 
                  required to run the competition environment. Fees are not wagers and do not constitute gambling.
                </p>
                <p>
                  Payment is processed securely via Stripe. All major credit cards and debit cards accepted.
                </p>
              </div>
            </section>
            
            {/* Phases */}
            <section id="phases">
              <h2 className="text-2xl font-bold mb-4">3. Competition Phases</h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-6 text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">Phase 1: Qualifiers (Weeks 1-4)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Weekly leaderboard resets every Monday 00:00 UTC</li>
                    <li>• Top 100 competitors each week advance to Semifinals (400 total)</li>
                    <li>• Unlimited attempts per week — best score counts</li>
                    <li>• Challenge: Single-table PostgreSQL → PostgreSQL replication</li>
                    <li>• Dataset: 1M rows, randomized per competitor</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Phase 2: Semifinals (Weeks 5-6)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Top 100 from each qualifier week (400 total) compete</li>
                    <li>• $5 entry fee covers infrastructure</li>
                    <li>• Challenges: Multi-table replication, checkpoint recovery, masking under load</li>
                    <li>• Top 100 overall advance to Finals</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Phase 3: Finals (Week 7)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 100 finalists compete head-to-head</li>
                    <li>• Live challenge: Replicate a mystery dataset revealed at start</li>
                    <li>• Top 50 win $500 each ($25,000 total)</li>
                    <li>• Top 10 advance to Grand Finale</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">Phase 4: Grand Finale (Week 8)</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• 10 finalists compete in a live-streamed event</li>
                    <li>• Final challenge revealed at event start</li>
                    <li>• 1 winner receives $10,000 grand prize</li>
                    <li>• Event streamed on YouTube, Twitch, and X</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Scoring */}
            <section id="scoring">
              <h2 className="text-2xl font-bold mb-4">4. Scoring System</h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <p>Scores are calculated automatically by the Pulsyn benchmark engine using this formula:</p>
                <div className="bg-black/30 rounded-xl p-4 font-mono text-sm">
                  <div>Score = (rows_per_sec × 0.40)</div>
                  <div>        + (data_integrity × 0.30)</div>
                  <div>        + (checkpoint_recovery × 0.20)</div>
                  <div>        + (masking_efficiency × 0.10)</div>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="font-semibold text-white mb-1">Rows/sec (40%)</div>
                    <div className="text-sm">Total rows replicated per second during the benchmark window.</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">Data Integrity (30%)</div>
                    <div className="text-sm">Percentage of rows that match source checksums exactly.</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">Checkpoint Recovery (20%)</div>
                    <div className="text-sm">Speed of resuming replication from a checkpoint after interruption.</div>
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">Masking Efficiency (10%)</div>
                    <div className="text-sm">Performance overhead when data masking rules are applied.</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Tiebreaker: In case of identical scores, the competitor who achieved the score first (by UTC timestamp) ranks higher.
                </p>
              </div>
            </section>
            
            {/* Prizes */}
            <section id="prizes">
              <h2 className="text-2xl font-bold mb-4">5. Prizes & Distribution</h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2">Place</th>
                        <th className="text-right py-2">Prize</th>
                        <th className="text-right py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2">Grand Champion (1st)</td>
                        <td className="text-right text-amber-400">$10,000</td>
                        <td className="text-right">$10,000</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2">Finalists (2nd-50th)</td>
                        <td className="text-right">$500 each</td>
                        <td className="text-right">$24,500</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2">Semifinal Pool</td>
                        <td className="text-right">Distributed</td>
                        <td className="text-right">$5,000</td>
                      </tr>
                      <tr className="font-bold">
                        <td className="py-2">Total Prize Pool</td>
                        <td></td>
                        <td className="text-right text-amber-400">$39,500</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm">
                  Prizes are paid via bank transfer or PayPal within 30 days of competition end. 
                  Winners are responsible for any applicable taxes in their jurisdiction. 
                  US winners receiving $600+ will receive a 1099-MISC form.
                </p>
              </div>
            </section>
            
            {/* Anti-Cheat */}
            <section id="anti-cheat">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" />
                6. Anti-Cheat & Fair Play
              </h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <p>The following are strictly prohibited:</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Pre-loading data into the target database before benchmark start</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Modifying the Pulsyn benchmark container or environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Using external tools to intercept or modify network traffic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Sharing credentials or allowing others to compete on your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Exploiting bugs in the Pulsyn engine for unfair advantage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Ban className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>DDoS or otherwise interfering with other competitors' runs</span>
                  </li>
                </ul>
                <p className="text-sm text-gray-400 mt-4">
                  Violations result in immediate disqualification and permanent ban. 
                  Pulsyn reserves the right to audit any run and request replays. 
                  Top 100 finalists' runs are automatically archived for verification.
                </p>
              </div>
            </section>
            
            {/* Legal Classification */}
            <section id="legal">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-cyan-400" />
                7. Legal Classification
              </h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <p>
                  The Pulsyn Replication Race is classified as a <strong>skill-based competition</strong> under 
                  applicable law. It is NOT:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>✗ A lottery — winners are not selected by random draw</li>
                  <li>✗ A raffle — no tickets are sold with random winner selection</li>
                  <li>✗ A sweepstakes — outcomes are not based on chance</li>
                  <li>✗ Gambling — no wagering on uncertain outcomes</li>
                </ul>
                <p className="mt-4">
                  This competition is a <strong>contest of skill</strong> where:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>✓ Winners are determined by measurable performance metrics</li>
                  <li>✓ All scoring is objective and automated</li>
                  <li>✓ No element of chance affects outcomes</li>
                  <li>✓ Skill and strategy determine rankings</li>
                  <li>✓ Entry fees cover infrastructure costs, not prize pools</li>
                </ul>
                <p className="text-sm text-gray-400 mt-4">
                  Under US law (and most international jurisdictions), skill-based competitions with entry fees 
                  are legal when: (1) skill is the dominant factor in winning, (2) entry fees are reasonable 
                  and cover operational costs, and (3) the competition is open to all eligible participants. 
                  This competition meets all three criteria.
                </p>
              </div>
            </section>
            
            {/* Gambling Compliance */}
            <section id="gambling">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-amber-400" />
                8. Gambling Compliance
              </h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <p>
                  While this competition is not gambling, we proactively comply with relevant regulations:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/[0.02] rounded-lg p-4">
                    <div className="font-semibold text-white mb-2">United States</div>
                    <ul className="text-sm space-y-1">
                      <li>• Skill-based competitions are legal in all 50 states</li>
                      <li>• No gambling license required</li>
                      <li>• Compliant with UIGEA skill-game exemption</li>
                    </ul>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-4">
                    <div className="font-semibold text-white mb-2">European Union</div>
                    <ul className="text-sm space-y-1">
                      <li>• Classified as promotional contest under EU law</li>
                      <li>• No gambling license required in most jurisdictions</li>
                      <li>• Country-specific exclusions may apply</li>
                    </ul>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-4">
                    <div className="font-semibold text-white mb-2">United Kingdom</div>
                    <ul className="text-sm space-y-1">
                      <li>• Skill competitions exempt from Gambling Act 2005</li>
                      <li>• Entry fees must reflect genuine cost of participation</li>
                      <li>• No gambling license required</li>
                    </ul>
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-4">
                    <div className="font-semibold text-white mb-2">Australia</div>
                    <ul className="text-sm space-y-1">
                      <li>• Skill-based competitions legal under state laws</li>
                      <li>• Trade promotion lottery exemptions may apply</li>
                      <li>• Some states require permits for prizes over $A3,000</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Pulsyn has consulted with legal counsel and structured this competition to comply with 
                  applicable laws in major jurisdictions. Participants are responsible for ensuring their 
                  participation is legal in their jurisdiction.
                </p>
              </div>
            </section>
            
            {/* Privacy */}
            <section id="privacy">
              <h2 className="text-2xl font-bold mb-4">9. Privacy & Data</h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <ul className="space-y-2">
                  <li>• We collect email, display name, and country for competition purposes only</li>
                  <li>• Competition performance data is public (visible on leaderboard)</li>
                  <li>• Payment information is processed by Stripe — we never see your card details</li>
                  <li>• Winner names may be used in marketing materials with consent</li>
                  <li>• All data handled per our <Link href="/legal/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link></li>
                  <li>• GDPR-compliant. Data deletion requests honored within 30 days</li>
                </ul>
              </div>
            </section>
            
            {/* Disputes */}
            <section id="disputes">
              <h2 className="text-2xl font-bold mb-4">10. Disputes & Appeals</h2>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 space-y-4 text-gray-300">
                <ul className="space-y-2">
                  <li>• All scoring decisions by the benchmark engine are final</li>
                  <li>• Anti-cheat violations may be appealed within 48 hours via email</li>
                  <li>• Appeals reviewed by a panel of 3 Pulsyn engineers</li>
                  <li>• Disputes governed by the laws of New Zealand</li>
                  <li>• Any legal proceedings must be brought in Auckland, New Zealand</li>
                </ul>
              </div>
            </section>
          </div>
          
          {/* Footer CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">Ready to compete?</p>
            <Link 
              href="/competition#register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
