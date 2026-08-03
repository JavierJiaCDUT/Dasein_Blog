# Dasein Blog Hero Image System

本文档是 Dasein Blog 文章头图的唯一视觉规范来源。项目级技能、渲染模板和人工设计都应以此为准。

## 设计目标

文章头图应让读者感受到理性、克制、清晰和编辑出版感。每张图需要回应文章内容，同时保持 Javier 个人博客的统一视觉身份。

一致性来自固定网格、字体层级、留白、颜色和安全区。差异来自文章的视觉命题、数字、人物、概念图形与单一强调色。

## 核心原则

1. 完整阅读文章后再设计，标题只能作为入口，不能代替内容理解。
2. 每张图只表达一个核心视觉命题。
3. 图片文字压缩为一至四个视觉词，不复制完整文章标题。
4. 关键事实必须来自文章，不得编造数字、作者、机构或结论。
5. 优先使用确定性模板渲染文字和几何图形。
6. 只有照片、复杂插画、真实材质或难以代码表达的视觉才使用图像生成模型。
7. 不模仿来源机构的官方视觉，不让个人博客图片看起来像官方发布物。
8. 图片脱离文章页面后仍应大致表达主题，所有关键信息同时保留在文章正文或元数据中。

## 技术规范

| 项目 | 规范 |
|---|---|
| 母版尺寸 | 3200 × 1600 px |
| 比例 | 2:1 |
| 核心安全区 | 中央 86% 宽度，左右至少各留 224 px |
| 文章页目标 | 1020 × 510 |
| 博客列表卡片目标 | 固定 2:1 区域，按原图比例居中缩放，不裁切 |
| 色彩空间 | RGB |
| 推荐格式 | PNG、WebP 或优化 JPEG |
| 存放位置 | `src/assets/blog/<article-slug>/` |
| Front Matter | `heroImage: ../../assets/blog/<article-slug>/hero.<ext>` |

首页、Blog 列表和标签页面的博客卡片必须完整显示封面。卡片使用固定 2:1 区域与 `contain` 适配，图片处理只指定目标宽度，不能在 Astro 生成缩略图时强制写入不同宽高比。少数非 2:1 旧图允许出现少量留白，不得以裁掉文字、人物或关键图形为代价填满容器。项目卡片不受此规则约束。

## 固定视觉语言

### 基础颜色

| 用途 | 默认值 |
|---|---|
| 背景 | `#050505` |
| 主文字 | `#F4F2ED` |
| 次要文字 | `#8A8A84` |
| 辅助线 | `#343434` |
| 默认强调色 | `#FF4D1A` |

每张图片只使用一种强调色。允许根据内容类别更换强调色，但基础黑白关系和明度层级保持稳定。

### 类别强调色

| 类别 | 建议强调色 |
|---|---|
| AI 与技术 | `#FF4D1A` 或 `#4F7CFF` |
| 市场与投资 | `#D5A62E` 或 `#B43A32` |
| 产品开发 | `#20A486` |
| 教育与研究 | `#315BCB` |
| 个人随笔 | `#8A7CA8` 或照片原色 |

### 排版

- 使用现代 Grotesk 无衬线字体。
- 主信息采用高对比大字号。
- 次级信息使用大写、小字号和较宽字距。
- 每张图最多三个文本层级。
- 避免超过两行的主标题。
- 保持强留白，不用装饰元素填满画面。

## 模板选择

| 模板 | 适用内容 | 第一视觉 | 图形语言 |
|---|---|---|---|
| `editorial-data` | 数据、版本、趋势、研究结果 | 数字或短结论 | 模块、刻度、对比结构 |
| `editorial-concept` | AI、研究、产品方法、思想文章 | 核心概念词 | 层级、框架、周期、网格 |
| `editorial-person` | 人物观点、访谈、外部作者文章 | 人名或姓氏 | 引文线、人物信息、主题标记 |

照片或复杂插画不单独成为模板。它们作为可变视觉层，放入相同的网格、颜色和文字层级中。

## 视觉命题提炼

阅读文章后回答四个问题：

1. 如果读者只记住一句话，应是什么？
2. 哪个数字、人物、对比或概念最能承载这句话？
3. 文章的变化关系是什么，例如过去与现在、复杂与简单、集中与按需？
4. 哪个图形隐喻可以表达这个关系，而不落入通用图库语言？

视觉命题使用一句话记录在 `hero-brief.yml` 的 `visualThesis` 字段中。

## Brief 规范

每篇文章的资源目录应包含 `hero-brief.yml`。示例：

```yaml
template: editorial-data
output: hero.png
visualThesis: "Removing most system-prompt rules can preserve performance and restore model judgement."

kicker: "CONTEXT ENGINEERING / 2026"
source: "ANTHROPIC"
primary: "80%"
secondary: "LESS"
descriptor: "SYSTEM PROMPT"
footer: "MORE JUDGEMENT"
accent: "#FF4D1A"

modules:
  - SYSTEM
  - SKILLS
  - MEMORY
  - TOOLS
  - REFERENCES
highlight: MEMORY
annotation: "LOAD WHEN NEEDED"
```

字段未使用时省略，不要填入无意义占位文字。图片内的所有事实和措辞必须能在文章中找到依据。

三个模板的可复制 Brief 位于 `scripts/hero-images/examples/`。数据型的真实项目示例位于 `src/assets/blog/the-new-rules-of-context-engineering-for-claude-5-models/hero-brief.yml`。

## 确定性渲染

使用项目脚本生成：

```bash
bun run hero:render -- src/assets/blog/<article-slug>/hero-brief.yml
```

渲染器默认拒绝覆盖现有文件。确认需要替换时才使用：

```bash
bun run hero:render -- src/assets/blog/<article-slug>/hero-brief.yml --force
```

测试新模板但不替换正式图片时：

```bash
bun run hero:render -- src/assets/blog/<article-slug>/hero-brief.yml --out /tmp/hero-preview.png
```

## 使用 imagegen

以下情况使用 `imagegen`：

- 真实人物或场景照片
- 复杂抽象插画
- 真实材质、光线或空间
- 确定性 SVG 无法合理表达的视觉隐喻

使用前阅读 `.agents/skills/dasein-blog-hero/references/prompt-template.md`。生成后仍需置入统一网格，并完成同一套验收。

## 禁止项

- 发光大脑、拟人机器人和无意义节点网络
- 与文章无关的代码雨或聊天窗口截图
- 未经确认的 Logo、肖像和机构品牌元素
- 把完整文章标题塞入图片
- 一张图使用多种强调色
- 依赖小字号才能理解的复杂信息图
- 图片生成模型自行添加的文字、数字或水印
- 仅凭文件名、标题或标签生成图片
- 在 `src/assets/` 和 `public/` 重复保存同一文件

## 验收

完整清单位于 `.agents/skills/dasein-blog-hero/references/acceptance-checklist.md`。至少确认尺寸、比例、文字准确性、安全区、缩略图可读性、文件路径、Front Matter 和构建结果。

## 参考作品

参考作品及其可复用原则记录在 `.agents/skills/dasein-blog-hero/references/examples.md`。参考作品用于理解系统，不得作为逐像素复制对象。
