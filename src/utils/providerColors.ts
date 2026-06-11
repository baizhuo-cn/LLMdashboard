const providerColors: Record<string, string> = {
  '字节跳动': '#3B82F6',
  '阿里巴巴': '#F97316',
  'Qwen': '#F97316',
  '月之暗面': '#A855F7',
  'Deepseek': '#06B6D4',
  'Open AI': '#22C55E',
  'Google': '#EAB308',
  'Anthropic': '#EC4899',
  '智谱': '#6366F1',
  'MiniMax': '#F43F5E',
  'xAI': '#64748B',
  '百川智能': '#8B5CF6',
  '零一万物': '#14B8A6',
  '腾讯': '#2563EB',
};

export function getProviderColor(provider: string): string {
  return providerColors[provider] || '#94A3B8';
}
