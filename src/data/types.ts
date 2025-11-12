export type PricingCsvRow = {
  厂商: string;
  模型名称: string;
  官方输入价格: string;
  官方输出价格: string;
  模型说明: string;
  温度范围: string;
  默认温度: string;
  常用模型: string;
  收藏: string;
};

export type PricingModel = {
  id: string;
  provider: string;
  name: string;
  inputPrice: number;
  outputPrice: number;
  description: string;
  temperatureRange: string;
  defaultTemperature: number | null;
  isPopular: boolean;
  isFavorite: boolean;
};
