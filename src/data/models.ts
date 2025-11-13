import type { Model } from './types';

export const models: Model[] = [
  {
    "id": "gpt-4o",
    "name": "GPT-4o",
    "provider": "OpenAI",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 30,
        "output": 60,
        "currency": "USD"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.03,
        "output": 0.06,
        "currency": "USD"
      }
    },
    "tags": [
      "旗舰",
      "多模态"
    ],
    "searchableText": "gpt-4o gpt-4o openai 旗舰 多模态",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "gpt-4o-mini",
    "name": "GPT-4o Mini",
    "provider": "OpenAI",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 10,
        "output": 30,
        "currency": "USD"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.01,
        "output": 0.03,
        "currency": "USD"
      }
    },
    "tags": [
      "性价比",
      "工具调用"
    ],
    "searchableText": "gpt-4o-mini gpt-4o mini openai 性价比 工具调用",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "deepseek-r1",
    "name": "DeepSeek R1",
    "provider": "DeepSeek",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 2.5,
        "output": 9.8,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.0025,
        "output": 0.0098,
        "currency": "CNY"
      }
    },
    "tags": [
      "推理",
      "中文"
    ],
    "searchableText": "deepseek-r1 deepseek r1 deepseek 推理 中文",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "qwen-72b",
    "name": "Qwen2.5-72B",
    "provider": "Qwen",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 3.2,
        "output": 12.5,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.0032,
        "output": 0.0125,
        "currency": "CNY"
      }
    },
    "tags": [
      "企业",
      "多语言"
    ],
    "searchableText": "qwen-72b qwen2.5-72b qwen 企业 多语言",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "kimi-k2-0905",
    "name": "Kimi K2 0905",
    "provider": "Kimi",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 4,
        "output": 16,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.004,
        "output": 0.016,
        "currency": "CNY"
      }
    },
    "tags": [
      "思考",
      "长上下文"
    ],
    "searchableText": "kimi-k2-0905 kimi k2 0905 kimi 思考 长上下文",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "kimi-k2-thinking",
    "name": "Kimi K2 Thinking",
    "provider": "Kimi",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 4,
        "output": 16,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.004,
        "output": 0.016,
        "currency": "CNY"
      }
    },
    "tags": [
      "思考",
      "旗舰"
    ],
    "searchableText": "kimi-k2-thinking kimi k2 thinking kimi 思考 旗舰",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "kimi-k2-thinking-turbo",
    "name": "Kimi K2 Thinking Turbo",
    "provider": "Kimi",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 8,
        "output": 58,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.008,
        "output": 0.058,
        "currency": "CNY"
      }
    },
    "tags": [
      "推理",
      "极速"
    ],
    "searchableText": "kimi-k2-thinking-turbo kimi k2 thinking turbo kimi 推理 极速",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "kimi-k2-turbo",
    "name": "Kimi K2 Turbo",
    "provider": "Kimi",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 8,
        "output": 58,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.008,
        "output": 0.058,
        "currency": "CNY"
      }
    },
    "tags": [
      "推理",
      "企业"
    ],
    "searchableText": "kimi-k2-turbo kimi k2 turbo kimi 推理 企业",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "moonshot-v1",
    "name": "moonshot-v1-32k",
    "provider": "Moonshot",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 1.5,
        "output": 5.6,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.0015,
        "output": 0.0056,
        "currency": "CNY"
      }
    },
    "tags": [
      "长上下文",
      "国产"
    ],
    "searchableText": "moonshot-v1 moonshot-v1-32k moonshot 长上下文 国产",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "spark-pro",
    "name": "Spark Pro",
    "provider": "iFlytek",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 1.2,
        "output": 4.8,
        "currency": "CNY"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.0012,
        "output": 0.0048,
        "currency": "CNY"
      }
    },
    "tags": [
      "教育",
      "语音"
    ],
    "searchableText": "spark-pro spark pro iflytek 教育 语音",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "claude-3-5",
    "name": "Claude 3.5 Sonnet",
    "provider": "Anthropic",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 24,
        "output": 72,
        "currency": "USD"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.024,
        "output": 0.072,
        "currency": "USD"
      }
    },
    "tags": [
      "英文",
      "写作"
    ],
    "searchableText": "claude-3-5 claude 3.5 sonnet anthropic 英文 写作",
    "updatedAt": "2025-11-13"
  },
  {
    "id": "gemini-2-0",
    "name": "Gemini 2.0 Pro",
    "provider": "Google",
    "prices": {
      "mtok": {
        "unit": "mtok",
        "input": 22,
        "output": 68,
        "currency": "USD"
      },
      "ktok": {
        "unit": "ktok",
        "input": 0.022,
        "output": 0.068,
        "currency": "USD"
      }
    },
    "tags": [
      "多模态",
      "研发"
    ],
    "searchableText": "gemini-2-0 gemini 2.0 pro google 多模态 研发",
    "updatedAt": "2025-11-13"
  }
];
