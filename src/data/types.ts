export type PricingCsvRow = {
  厂商: string;
  模型名称: string;
  是否阶梯计费: string;
  阶梯计费条件: string;
  输入: string;
  输出: string;
  收藏: string;
};

export type PricingModel = {
  id: string;
  provider: string;
  name: string;
  isTieredPricing: boolean;
  tierCondition: string;
  tiers: Array<{
    condition: string;
    inputPrice: number;
    outputPrice: number;
  }>;
  inputPrice: number;
  outputPrice: number;
  isFavorite: boolean;
};
