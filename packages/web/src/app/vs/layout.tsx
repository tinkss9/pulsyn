import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pulsyn vs Competitors — CDC Platform Comparison',
  description: 'Compare Pulsyn against Fivetran, Airbyte, Confluent, Debezium and other CDC platforms. See why teams choose Pulsyn for real-time data replication.',
};

export default function VsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
