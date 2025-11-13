# LLM Pricing Dashboard

A Vite + React dashboard that tracks large language model pricing data. The interface mirrors the production UI of the LLMpricing design system while adding a few productivity enhancements for day-to-day analysis.

## Features
- 📊 **Dashboard：** 浏览所有模型的官方输入/输出价格，支持按厂商过滤、模糊搜索、收藏筛选与 CSV 导出。
- ⚖️ **对比：** 通过可搜索的下拉框挑选 2~5 个模型进行输入/输出价格对比。
- 🧮 **计算：** 根据输入/输出 Token 与调用频率估算单次请求和月度成本，可保存多组计算并实时求和。
- ⭐ **社区：** 展示示例社区评分列表，便于对热门模型的主观体验进行补充。

## Getting Started
1. 安装依赖：`npm install`
2. 本地开发：`npm run dev`
3. 生产构建：`npm run build`

## 技术栈
- React + TypeScript
- Vite 构建工具
- Tailwind CSS + shadcn/ui 组件
- Recharts 数据可视化
