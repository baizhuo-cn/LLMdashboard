type KPIChipProps = {
  label: string;
  value: string | number;
  subtitle?: string;
};

export function KPIChip({ label, value, subtitle }: KPIChipProps) {
  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: 14,
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 10, letterSpacing: '0.04em', fontWeight: 500 }}>
        {label}
      </div>
      <div className="font-mono-jet" style={{ fontSize: 24, fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: '#C4C4C4', marginTop: 6 }}>{subtitle}</div>
      )}
    </div>
  );
}

type KPIGroupProps = {
  children: React.ReactNode;
};

export function KPIGroup({ children }: KPIGroupProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ marginBottom: 20 }}>
      {children}
    </div>
  );
}
