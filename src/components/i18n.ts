export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Navbar
    dashboard: '仪表板',
    compare: '对比',
    calculator: '计算器',
    ratings: '评分',
    alpha: '测试版',
    
    // Dashboard KPIs
    totalModels: '模型总数',
    lastUpdate: '最后更新',
    
    // Filters
    allProviders: '所有供应商',
    searchPlaceholder: '搜索模型、供应商或标签...',
    export: '导出',
    showFavorites: '显示收藏',
    showPopular: '显示常用',
    allModels: '所有模型',
    
    // Table Headers
    modelName: '模型名称',
    officialInputPrice: '官方输入价格',
    officialOutputPrice: '官方输出价格',
    description: '模型说明',
    temperatureRange: '温度范围',
    defaultTemperature: '默认温度',
    isPopular: '常用模型',
    isFavorite: '收藏',
    
    // Price unit
    perMillionTokens: '每百万 Token',
    perThousandTokens: '每千 Token',
    
    // Compare
    selectModelsToCompare: '选择要对比的模型',
    inputPriceComparison: '输入价格对比',
    outputPriceComparison: '输出价格对比',
    
    // Calculator
    singleRequestCalculator: '单次请求计算器',
    budgetEstimator: '预算估算器',
    model: '模型',
    selectModel: '选择模型',
    pasteContent: '粘贴内容（自动检测 Token）',
    pasteContentPlaceholder: '在此粘贴您的提示词或内容以自动估算 Token 数量...',
    tokensDetected: '检测到约 {{count}} 个 Token（1 Token ≈ 4 字符）',
    inputTokens: '输入 Token',
    outputTokens: '输出 Token',
    callsPerMonth: '每月调用次数',
    perCallCost: '单次调用成本',
    monthlyEstimate: '每月估算',
    basedOnTokens: '{{input}} 输入 + {{output}} 输出 Token',
    basedOnCalls: '基于 {{calls}} 次调用/月',
    monthlyBudget: '每月预算',
    requestsPerDay: '每日请求数',
    avgInputTokens: '平均输入 Token',
    avgOutputTokens: '平均输出 Token',
    calculateBudget: '计算预算',
    budgetBreakdown: '预算明细',
    model_other: '模型',
    estimatedMonthlyCost: '预估月度成本',
    costPerRequest: '单次请求成本',
    totalRequests: '总请求数',
    
    // Ratings
    communityRatings: '社区评分',
    communityRatingsDesc: '查看社区基于实际使用情况对不同 LLM 模型的评分',
    votes: '票',
    inDevelopment: '开发中',
    
    // Common
    yes: '是',
    no: '否',
  },
  en: {
    // Navbar
    dashboard: 'Dashboard',
    compare: 'Compare',
    calculator: 'Calculator',
    ratings: 'Ratings',
    alpha: 'alpha',
    
    // Dashboard KPIs
    totalModels: 'Total Models',
    lastUpdate: 'Last Update',
    
    // Filters
    allProviders: 'All Providers',
    searchPlaceholder: 'Search models, providers, or tags...',
    export: 'Export',
    showFavorites: 'Show Favorites',
    showPopular: 'Show Popular',
    allModels: 'All Models',
    
    // Table Headers
    modelName: 'Model Name',
    officialInputPrice: 'Official Input Price',
    officialOutputPrice: 'Official Output Price',
    description: 'Description',
    temperatureRange: 'Temperature Range',
    defaultTemperature: 'Default Temperature',
    isPopular: 'Popular Model',
    isFavorite: 'Favorite',
    
    // Price unit
    perMillionTokens: 'per M Token',
    perThousandTokens: 'per K Token',
    
    // Compare
    selectModelsToCompare: 'Select Models to Compare',
    inputPriceComparison: 'Input Price Comparison',
    outputPriceComparison: 'Output Price Comparison',
    
    // Calculator
    singleRequestCalculator: 'Single Request Calculator',
    budgetEstimator: 'Budget Estimator',
    model: 'Model',
    selectModel: 'Select a model',
    pasteContent: 'Paste Content (auto-detects tokens)',
    pasteContentPlaceholder: 'Paste your prompt or content here to automatically estimate token count...',
    tokensDetected: '~{{count}} tokens detected (1 token ≈ 4 chars)',
    inputTokens: 'Input Tokens',
    outputTokens: 'Output Tokens',
    callsPerMonth: 'Calls per Month',
    perCallCost: 'Per-Call Cost',
    monthlyEstimate: 'Monthly Estimate',
    basedOnTokens: '{{input}} input + {{output}} output tokens',
    basedOnCalls: 'Based on {{calls}} calls/month',
    monthlyBudget: 'Monthly Budget',
    requestsPerDay: 'Requests per Day',
    avgInputTokens: 'Avg Input Tokens',
    avgOutputTokens: 'Avg Output Tokens',
    calculateBudget: 'Calculate Budget',
    budgetBreakdown: 'Budget Breakdown',
    model_other: 'Model',
    estimatedMonthlyCost: 'Estimated Monthly Cost',
    costPerRequest: 'Cost per Request',
    totalRequests: 'Total Requests',
    
    // Ratings
    communityRatings: 'Community Ratings',
    communityRatingsDesc: 'See how the community rates different LLM models based on real-world usage',
    votes: 'votes',
    inDevelopment: 'In development',
    
    // Common
    yes: 'Yes',
    no: 'No',
  },
};

export function t(key: string, lang: Language, params?: Record<string, string | number>): string {
  let text = translations[lang][key as keyof typeof translations['zh']] || key;
  
  if (params) {
    Object.keys(params).forEach((param) => {
      text = text.replace(`{{${param}}}`, String(params[param]));
    });
  }
  
  return text;
}

export function formatCurrency(amount: number, currency: string, lang: Language): string {
  if (currency === 'CNY') {
    return `￥${amount.toFixed(2)}`;
  } else if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  } else if (currency === 'EUR') {
    return `€${amount.toFixed(2)}`;
  }
  return `${currency} ${amount.toFixed(2)}`;
}

export function formatNumber(num: number, lang: Language): string {
  return num.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');
}

export function formatDate(date: Date, lang: Language): string {
  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
