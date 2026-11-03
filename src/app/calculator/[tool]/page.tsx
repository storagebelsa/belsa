import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ tool: string }>;
}

const TOOL_ALIAS_MAP: Record<string, string> = {
  // Pressure & Load
  'pressure': 'pressure',
  'pressure-load': 'pressure',
  'tekanan': 'pressure',
  'beban': 'pressure',
  'tekanan-beban': 'pressure',
  'tekanan-beban-silinder': 'pressure',

  // Tube Thickness & Honing
  'thickness': 'thickness',
  'tube': 'thickness',
  'honing': 'thickness',
  'tube-thickness': 'thickness',
  'tebal-tube': 'thickness',
  'ketebalan-pipa-honing': 'thickness',

  // Bolt Force Safety
  'bolt': 'bolt',
  'tie-rod': 'bolt',
  'baut': 'bolt',
  'bolt-force': 'bolt',
  'kekuatan-baut': 'bolt',
  'kekuatan-baut-tie-rod': 'bolt',

  // Material Weight
  'weight': 'weight',
  'mass': 'weight',
  'berat': 'weight',
  'massa': 'weight',
  'material-weight': 'weight',
  'berat-material': 'weight',

  // Bolt Tightening Torque
  'torque': 'torque',
  'torsi': 'torque',
  'bolt-torque': 'torque',
  'torsi-baut': 'torque',
  'torsi-pengencangan-baut': 'torque',
};

export default async function CalculatorToolRedirect({ params }: Props) {
  const { tool } = await params;
  const normalizedKey = tool.toLowerCase().trim();
  const targetTool = TOOL_ALIAS_MAP[normalizedKey] || 'pressure';

  redirect(`/calculator?tool=${targetTool}`);
}
