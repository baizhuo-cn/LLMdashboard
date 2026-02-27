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
    tieredFilter: '阶梯计费筛选',
    tieredAll: '全部计费类型',
    tieredOnly: '仅阶梯计费',
    nonTieredOnly: '仅非阶梯计费',
    tierConditionPlaceholder: '筛选阶梯条件，例如 0<Token≤128K',
    export: '导出',
    showFavorites: '显示收藏',
    showPopular: '显示常用',
    allModels: '所有模型',
    
    // Table Headers
    modelName: '模型名称',
    tieredPricing: '是否阶梯计费',
    tierCondition: '阶梯计费条件',
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
    addComparisonSlot: '添加对比项',
    comparisonSlotLabel: '对比模型 {{index}}',
    searchModels: '搜索模型...',
    noModelsFound: '暂无匹配模型',
    removeSlot: '移除此项',
    inputPriceComparison: '输入价格对比',
    outputPriceComparison: '输出价格对比',

    // Calculator
    singleRequestCalculator: 'Token 计算器',
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
    saveCalculation: '保存当前结果',
    savedCalculations: '已保存的计算',
    savedCalculationsDesc: '保存不同模型的成本估算，方便统一查看',
    noSavedCalculations: '暂未保存任何结果',
    clearAll: '清空全部',
    savedTotals: '汇总',
    savedTotalsDesc: '所有保存结果的合计',
    totalPerCallCost: '单次成本总和',
    totalMonthlyCost: '月度总和',

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
    tieredFilter: 'Tiered Filter',
    tieredAll: 'All Billing Types',
    tieredOnly: 'Tiered Only',
    nonTieredOnly: 'Non-tiered Only',
    tierConditionPlaceholder: 'Filter tier condition, e.g. 0<Token≤128K',
    export: 'Export',
    showFavorites: 'Show Favorites',
    showPopular: 'Show Popular',
    allModels: 'All Models',
    
    // Table Headers
    modelName: 'Model Name',
    tieredPricing: 'Tiered Billing',
    tierCondition: 'Tier Condition',
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
    addComparisonSlot: 'Add slot',
    comparisonSlotLabel: 'Model {{index}}',
    searchModels: 'Search models...',
    noModelsFound: 'No models found',
    removeSlot: 'Remove slot',
    inputPriceComparison: 'Input Price Comparison',
    outputPriceComparison: 'Output Price Comparison',
    
    // Calculator
    singleRequestCalculator: 'Token Calculator',
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
    saveCalculation: 'Save result',
    savedCalculations: 'Saved calculations',
    savedCalculationsDesc: 'Keep multiple estimates together for quick reference',
    noSavedCalculations: 'No saved results yet',
    clearAll: 'Clear all',
    savedTotals: 'Totals',
    savedTotalsDesc: 'Combined cost of all saved rows',
    totalPerCallCost: 'Per-call total',
    totalMonthlyCost: 'Monthly total',
    
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

export function formatCurrency(
  amount: number,
  currency: string,
  lang: Language,
  fractionDigits = 2
): string {
  const digits = Number.isFinite(fractionDigits) ? fractionDigits : 2;
  const formatted = amount.toFixed(digits);

  if (currency === 'CNY') {
    return `￥${formatted}`;
  } else if (currency === 'USD') {
    return `$${formatted}`;
  } else if (currency === 'EUR') {
    return `€${formatted}`;
  }
  return `${currency} ${formatted}`;
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
