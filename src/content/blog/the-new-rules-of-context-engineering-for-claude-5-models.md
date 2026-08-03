---
type: Article
title: "The New Rules of Context Engineering for Claude 5 Models"
description: "Anthropic 团队分享针对 Claude 5 系列模型的上下文工程新法则，涵盖系统提示词简化、渐进式披露与接口设计等核心实践。"
pubDate: 2026-08-03
updatedDate: 2026-08-03
author: "Anthropic"
contentType: "Bilingual Translation"
language: [en, zh-CN]
translationMethod: "AI-Assisted"
originalPubDate: 2026-08-03
resource: "https://x.com/trq212/status/2080710971228918066?s=20"
sources:
  - id: anthropic-original
    resource: "https://x.com/trq212/status/2080710971228918066?s=20"
    title: "The new rules of context engineering for Claude 5 models"
    author: "Anthropic"
heroImage: ../../assets/blog/the-new-rules-of-context-engineering-for-claude-5-models/hero.png
tags: [Claude, Context Engineering, Prompt Engineering, AI]
draft: false
---

I’ve written previously about how to best prompt the newest generation of Claude 5 models and work with them iteratively to discover what you want to build.

But when you send a message to Claude, the prompt is only a small part of the context it gets. Much of your context is assembled from your system prompt, Skills, CLAUDE.md files, memory, and other sources. We call this context engineering, and it makes a big impact on the results you generate when using Claude Code or in building your own agents.

Unlike a prompt, context is used generally across many requests, so it cannot be as specific.  How do you build these general prompts and guidance for Claude, especially when you don’t know what a user’s prompt might be?

This can be surprisingly difficult as Claude’s own capabilities evolve. Most recently, we noticed a large jump in the way we prompt the newest generation of Claude models. We removed over 80% of Claude Code’s system prompt for models like Claude Opus 5 and Claude Fable 5 with no measurable loss on our coding evaluations.

Here’s what we’ve learned about prompting this new class of models, and how you can utilize it to update your context engineering. We’ve put these best practices in `claude doctor`, use the command /doctor in Claude Code to rightsize your skills, and CLAUDE.md files.

我之前写过关于如何向最新一代 Claude 5 模型发送提示词，以及如何与它们进行迭代协作以发现您想要构建的内容。

但是，当您向 Claude 发送消息时，提示词只是其接收到的上下文的一小部分。您的大部分上下文是由系统提示词、技能、CLAUDE.md 文件、记忆和其他来源组合而成的。我们称之为上下文工程，它对您在使用 Claude Code 或构建自己的代理时生成的结果有很大影响。

与提示词不同，上下文在多个请求中通用，因此不能太具体。如何为 Claude 构建这些通用提示和指导，尤其是当您不知道用户的提示词可能是什么时？

随着 Claude 自身能力的不断发展，这可能出奇地困难。最近，我们注意到在提示最新一代 Claude 模型时方式有了很大变化。对于 Claude Opus 5 和 Claude Fable 5 等模型，我们删除了 Claude Code 超过 80% 的系统提示词，但在代码评估上没有明显的性能损失。

以下是我们在提示这一类新型模型时学到的知识，以及如何利用这些知识来更新您的上下文工程。我们已将这些最佳实践放入 `claude doctor` 中，请在 Claude Code 中使用 /doctor 命令来优化您的技能和 CLAUDE.md 文件。

## Unhobbling Claude｜为 Claude 松绑

Overall, we found that we were over-constraining Claude Code, both through our system prompt and in our CLAUDE.md files and skills.

For example, when we read transcripts of our own internal usage of Claude Code, we see several conflicting messages in a single request like “leave documentation as appropriate,” or “DO NOT add comments” as our system prompt, skills, and user requests clash with each other.

Generally, Claude can interpret the user’s intent to get to the right answer, but Claude must think more carefully about these overlapping and conflicting messages before deciding what to do.

And while these constraints were once needed to avoid worst case scenarios, we have since found we can delete many of them and let the model use surrounding context and judgement instead.

Additionally, Claude Code now has many more tools. Claude used to rely on CLAUDE.md as a source of memory, information, and guidance. Now we have memory, artifacts, and skills, which Claude can use to create new ways of loading and sharing context across sessions.

总体而言，我们发现我们对 Claude Code 施加了过多的限制，这既体现在系统提示词中，也体现在 CLAUDE.md 文件和技能中。

例如，在查阅我们内部使用 Claude Code 的交互记录时，我们发现单次请求中会出现多条相互矛盾的信息，比如“视情况保留文档”或“禁止添加注释”，这正是由于系统提示词、技能指令与用户请求之间产生了冲突。

通常情况下，Claude 能够领会用户的意图并给出正确答案，但在决定具体行动之前，它必须更谨慎地权衡这些重叠且冲突的信息。

尽管这些限制曾是为了避免最坏情况而设，但我们后来发现，完全可以删去其中的大部分，转而让模型结合上下文语境并运用自身的判断力来处理。

此外，Claude Code 现在配备了更多工具。过去，Claude 依赖 CLAUDE.md 作为记忆、信息和指导的来源；如今，我们引入了记忆、构件和技能机制，Claude 可以利用它们创造出跨会话加载和共享上下文的全新方式。
 
## Then and now｜过去与现在

There were a number of previous context engineering best practices that had become myths. Including:

**Then: Give Claude rules**
**Now: Let Claude use judgement**
When we first rolled out Claude Code, we needed to be sure that Claude avoided worst case scenarios, such as deleting files. This meant we would give particularly strong guidance that might not always be true, For example, in the system prompt we used to say:

*In code: default to writing no comments. Never write multi-paragraph docstrings or multi-line comment blocks — one short line max. Don't create planning, decision, or analysis documents unless the user asks for them — work from conversation context, not intermediate files.*

But for a certain subset of prompts, this guidance would be wrong. In the case of documentation, the user may have their own preferences, or specific parts of very complex code might need multi-line comment blocks.

Still, without these guardrails for older models, the comments Claude wrote would be incorrect in many cases and we had to accept this tradeoff. But newer models have better judgement and can handle these decisions well without explicit rules.

In the new system prompt we say: *Write code that reads like the surrounding code: match its comment density, naming, and idiom.*

**Then: Give Claude examples**
**Now: Design interfaces**

The number one rule for tool usage was to give Claude examples on how to use them. With our newest models, we’ve found that giving examples actually constrains them to a certain exploration space.

Instead of using examples, think more about the design of your tools, scripts and files- what parameters does Claude have and how can they be more expressive?

For example, in the Todo tool example, just listing status as an enumeration between pending, in_progress, and completed, hints to Claude about how to use it. The instruction on keeping one item in_progress helps define our requested behavior.

**Then: Put it all upfront**
**Now: Use progressive disclosure**

Because Claude Code was focused on coding, our system prompt included detailed information on how to do code review and verification. These were not always needed, but when they were, it was crucial information.

Since then, Claude Code has gotten very competent at using progressive disclosure- loading the right context at the right times. For example, we moved verification and code review into their own skills that Claude Code could selectively call.

But progressive disclosure is not just for skills, we also use it for tools. Some of our tools are ‘deferred loading,’ which means the agent must search for their full definitions using ToolSearch before using them. This allows us to have more tools (such as our Task tools) that don’t take up context until they’re needed.

The same can be applied to your own CLAUDE.md and Skill.md files. A common myth is that you want to make these a central repository for every known practice that you might run into, because Claude would not find it otherwise. Instead, consider having a tree of files that can be loaded at the right time.

**Then: Repeat yourself**
**Now: Simple tool descriptions**

Earlier Claude models could sometimes need repeated instructions or be more likely to listen to instructions at the end of their context window than at the start. This meant our system prompt would sometimes have references to tools in the main system prompt as well as instructions in the tool description.

We found we could delete these repeat examples and put instructions on how to use tools in the tool descriptions rather than the system prompt.

**Then: Memory in CLAUDE.md files**
**Now: Auto-memory**

We used to encourage users to save things to Claude’s memory, by using the # hotkey to write to their CLAUDE.md automatically. Instead, Claude now automatically saves memories that are relevant to the work and to you.

**Then: Simple specs**
**Now: Rich references**

In plan mode, Claude Code has heavily relied on markdown files with plans. Storing these files as plans helped Claude refer to them when needed. Another similar best practice was to store specs in the codebase for Claude to refer to while working across longer projects.

But we’ve found that Claude can handle increasingly more complicated references. Instead of simple markdown files, Claude can reference HTML artifacts created by our new artifacts feature.

You may also give Claude references in the form of code. A spec may also be a detailed test suite, or a function in a different codebase that Claude might port.

Rubrics are another form of references. Rubrics allow Claude to try and verify your taste in a particular field (e.g. what does a good API design look like) by using dynamic workflows and spinning up verifier agents with those rubrics.


过去有许多上下文工程的最佳实践如今已沦为迷思。其中包括：

**过去：给 Claude 制定规则**
**现在：让 Claude 自主判断**
在刚推出 Claude Code 时，我们需要确保 Claude 避免最坏的情况，比如删除文件。这意味着我们会给出特别强烈的指导，而这些指导并非总是适用。例如，我们过去在系统提示词中会这样写：

*代码中：默认不写注释。绝不编写多段落的文档字符串或多行注释块——最多只写一行简短注释。除非用户要求，否则不要创建规划、决策或分析文档——基于对话上下文工作，而不是依赖中间文件。*

但对于某些特定的提示词子集，这种指导却是错误的。在文档方面，用户可能有自己的偏好，或者非常复杂的代码的特定部分可能需要多行注释块。

尽管如此，如果没有这些针对旧版模型的防护栏，Claude 写的注释在很多情况下都会出错，我们不得不接受这种权衡。但新版模型具备更好的判断力，无需明确的规则也能很好地处理这些决策。

在新的系统提示词中，我们这样表述：*编写与周围代码风格一致的代码：匹配其注释密度、命名和惯用法。*

**过去：给 Claude 提供示例**
**现在：设计接口**

工具使用的首要规则是给 Claude 提供使用示例。但对于最新一代模型，我们发现提供示例实际上将它们限制在了特定的探索空间内。

与其使用示例，不如多思考工具、脚本和文件的设计——Claude 拥有哪些参数，如何让这些参数更具表现力？

例如，在 Todo 工具的示例中，仅将状态列为 pending、in_progress 和 completed 的枚举，就能暗示 Claude 如何使用它。而关于保持一个项目处于 in_progress 状态的指令，则有助于界定我们所期望的行为。

**过去：将所有内容前置**
**现在：采用渐进式披露**

由于 Claude Code 专注于编程，我们的系统提示词包含了有关如何进行代码审查和验证的详细信息。这些信息并非总是需要，但一旦需要，就是至关重要的。

从那以后，Claude Code 在使用渐进式披露方面变得非常熟练——在合适的时间加载合适的上下文。例如，我们将验证和代码审查移入其专属的技能中，供 Claude Code 按需调用。

但渐进式披露不仅适用于技能，我们也将其用于工具。我们的一些工具采用“延迟加载”，这意味着代理在使用它们之前必须通过 ToolSearch 搜索其完整定义。这使我们能够拥有更多工具（如 Task 工具），且这些工具在需要之前不会占用上下文。

同样的方法也适用于您自己的 CLAUDE.md 和 Skill.md 文件。一个常见的迷思是，您需要将这些文件打造成涵盖所有可能遇到的已知实践的中心仓库，否则 Claude 就找不到它们。相反，您可以考虑构建一个文件树，以便在适当时机加载。

**过去：重复指令**
**现在：简明的工具描述**

早期的 Claude 模型有时需要重复的指令，或者更容易听从上下文窗口末尾而非开头的指令。这意味着我们的系统提示词有时会在主系统提示词中引用工具，同时在工具描述中也包含相关指令。

我们发现可以删除这些重复的示例，将工具使用指令放在工具描述中，而不是系统提示词里。

**过去：将记忆存入 CLAUDE.md 文件**
**现在：自动记忆**

过去，我们鼓励用户通过 # 快捷键将内容自动写入 CLAUDE.md，从而保存到 Claude 的记忆中。而现在，Claude 会自动保存与工作和您本人相关的记忆。

**过去：简单的规范**
**现在：丰富的参考资料**

在计划模式下，Claude Code 严重依赖包含计划的 markdown 文件。将这些文件作为计划存储，有助于 Claude 在需要时进行参考。另一个类似的最佳实践是将规范存储在代码库中，供 Claude 在处理较长项目时参考。

但我们发现，Claude 能够处理日益复杂的参考资料。除了简单的 markdown 文件，Claude 还可以引用由我们全新构件功能创建的 HTML 构件。

您还可以以代码的形式向 Claude 提供参考资料。规范也可以是一个详细的测试套件，或者是另一个代码库中 Claude 可能需要移植的函数。

评估标准是另一种形式的参考资料。评估标准允许 Claude 通过动态工作流并启动配备这些标准的验证代理，来尝试并验证您在特定领域的品味（例如，优秀的 API 设计是什么样的）。

## Applying this to your context 将这些方法应用到你的上下文中

Pulling this all together, what does this look like when you assemble your context?
把这些内容汇总起来看，当你组装自己的上下文时，它应该是什么样子的呢？

### System Prompt
A system prompt is heavily tied to the product context. It tells Claude what product it’s operating in and what it’s doing. For Claude Code, you will likely never modify this, but if you are building your own agent harness, this is where you should spend a lot of time.
系统提示词与产品上下文紧密相关。它告诉 Claude 自己运行在什么产品中，以及它正在做什么。对于 Claude Code 来说，你很可能永远不需要修改它；但如果你正在构建自己的 Agent 框架（agent harness），那么这里就是你应该投入大量时间的地方。

### CLAUDE.md

Keep your CLAUDE.md lightweight and briefly describe what your repo is for, but spend most of the tokens on gotchas inside of the codebase. For example, you may organize your code to keep types in one monolithic file and nowhere else. Avoid stating ‘the obvious’ things Claude should know by looking at your file system or your repo.
Use progressive disclosure for more details, for example if you have several unique instructions on how to verify your work, create a verification skill and reference it from your CLAUDE.md.
让你的 CLAUDE.md 保持轻量，简要描述你的代码仓库是做什么的，但要把大部分 token 花在代码库中容易踩坑的地方。例如，你的代码组织方式可能是把所有类型都放在一个单一文件中，并且只放在那里。避免写那些 Claude 通过查看你的文件系统或代码仓库就能明白的“显而易见”的内容。
对于更多细节，可以使用渐进式披露（progressive disclosure）。例如，如果你有一些关于如何验证工作结果的独特说明，可以创建一个验证技能（verification skill），然后在 CLAUDE.md 中引用它。

### Skills
Think of skills as lightweight guides to let Claude find information when needed. Avoid making them overconstrained, except in highly important areas.
For long skills, try and use progressive disclosure as much as possible- divide it into many files and split them out.
It’s best when skills encode particular opinions, knowledge, or best practices that are particular to you, your team, or product.
可以把 Skills 看作轻量级指南，让 Claude 在需要时找到相关信息。除非是在非常重要的领域，否则不要把它们限制得过于严格。
对于较长的 Skills，尽量使用渐进式披露——把它拆分成许多文件，并分别独立存放。
Skills 最适合用来编码那些专属于你、你的团队或你的产品的特定观点、知识或最佳实践。

### References
You can @ mention files to include them as references. References allow Claude to refer to in-depth information about the current plan.
This might be in specs files, mockups, or even entire codebases. Generally you should prefer files that are in code as it provides clear, high-fidelity instructions to Claude in a language it knows very well. For example, a HTML mockup of a design will generally produce better results than a description of the design or a screenshot.
你可以通过 @ 提及文件，将它们作为引用包含进来。引用可以让 Claude 查阅与当前计划相关的深入信息。
这些内容可以是规格说明文件、设计原型，甚至整个代码库。通常你应该优先选择代码形式的文件，因为它们能以 Claude 非常熟悉的一种语言，提供清晰、高保真的指令。例如，一个设计的 HTML 原型通常会比对设计的文字描述或截图产生更好的效果。

## Try simplifying
Across your system prompt, skills, and CLAUDE.md files, you may need to simplify just like we did. We rolled out a new command called `claude doctor,` which will help you do this automatically as well. For more details on prompting more advanced models specifically, check out our Fable field guide.
在你的系统提示词、Skills 和 CLAUDE.md 文件中，你可能需要像我们一样进行简化。我们还推出了一个新命令 claude doctor，它也可以帮助你自动完成这项工作。如需了解更多关于如何针对更高级模型进行提示词设计的信息，请查看我们的 Fable 实战指南。
