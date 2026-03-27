/**
 * AI 引擎基础使用示例
 */

import { aiManager, tokenManager } from '../index';

// ============ 示例 1: 初始化 OpenClaw 引擎 ============

export function initializeOpenClaw() {
  console.log('正在初始化 OpenClaw 引擎...');

  // 注册 OpenClaw 引擎
  const engine = aiManager.registerEngine({
    provider: 'openclaw',
    apiKey: 'your-token-here',  // 替换为你的 OpenClaw Gateway Token
    baseUrl: 'http://localhost:8181',
    model: 'gpt-4',  // 或你在 OpenClaw 中配置的其他模型
    enabled: true,
    timeout: 60000,  // 60 秒超时
  });

  // 设为默认引擎
  aiManager.setDefaultEngine('openclaw');

  console.log('OpenClaw 引擎初始化完成:', engine.name);
  return engine;
}

// ============ 示例 2: 简单问答（非流式） ============

export async function simpleQuestion(question: string) {
  console.log('\n=== 简单问答示例 ===');
  console.log('问题:', question);

  try {
    const response = await aiManager.executeTask(question, {
      temperature: 0.7,
      maxTokens: 500,
    });

    console.log('回答:', response.content);
    console.log('使用模型:', response.model);
    console.log('Token 消耗:', response.usage);

    // 记录 Token 使用
    tokenManager.addRecord('openclaw', 'simple-qa', response.usage, {
      prompt: question,
      response: response.content,
    });

    return response;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// ============ 示例 3: 流式响应 ============

export async function streamQuestion(question: string) {
  console.log('\n=== 流式响应示例 ===');
  console.log('问题:', question);

  let fullResponse = '';
  const startTime = Date.now();

  try {
    await aiManager.executeStreamTask(
      question,
      {
        onStart: () => {
          console.log('开始接收响应...');
        },
        onContent: (delta) => {
          fullResponse += delta;
          process.stdout.write(delta);  // 实时输出
        },
        onComplete: (response) => {
          const duration = Date.now() - startTime;
          console.log('\n\n完成!');
          console.log('耗时:', duration, 'ms');
          console.log('Token 消耗:', response.usage);

          // 记录 Token 使用
          tokenManager.addRecord('openclaw', 'stream-qa', response.usage, {
            prompt: question,
            response: fullResponse,
          });
        },
        onError: (error) => {
          console.error('流式响应错误:', error);
        },
      },
      {
        temperature: 0.8,
        maxTokens: 1000,
      }
    );
  } catch (error) {
    console.error('请求失败:', error);
    throw error;
  }
}

// ============ 示例 4: 检查引擎可用性 ============

export async function checkEngineStatus() {
  console.log('\n=== 检查引擎状态 ===');

  const availability = await aiManager.checkAllEnginesAvailability();

  for (const [provider, available] of availability.entries()) {
    const status = available ? '✅ 可用' : '❌ 不可用';
    console.log(`${provider}: ${status}`);
  }

  return availability;
}

// ============ 示例 5: 查看 Token 统计 ============

export function viewTokenStatistics() {
  console.log('\n=== Token 使用统计 ===');

  // 今日统计
  const todayStats = tokenManager.getTodayStatistics();
  console.log('\n📊 今日统计:');
  todayStats.forEach((stats) => {
    console.log(`  ${stats.provider}:`);
    console.log(`    任务数: ${stats.taskCount}`);
    console.log(`    总 Token: ${stats.totalTokens}`);
    console.log(`    平均每任务: ${stats.averageTokensPerTask.toFixed(2)}`);
    if (stats.totalCost > 0) {
      console.log(`    预估成本: $${stats.totalCost.toFixed(4)}`);
    }
  });

  // OpenClaw 详细统计
  const openclawStats = tokenManager.getStatisticsByProvider('openclaw');
  if (openclawStats) {
    console.log('\n🦞 OpenClaw 详细统计:');
    console.log(`  输入 Token: ${openclawStats.totalInputTokens}`);
    console.log(`  输出 Token: ${openclawStats.totalOutputTokens}`);
    console.log(`  总 Token: ${openclawStats.totalTokens}`);
    console.log(`  任务数: ${openclawStats.taskCount}`);
  }

  // 最近 5 条记录
  const recentRecords = tokenManager.getAllRecords().slice(-5);
  console.log('\n📝 最近 5 条记录:');
  recentRecords.forEach((record, index) => {
    const time = new Date(record.timestamp).toLocaleTimeString();
    console.log(`  ${index + 1}. [${time}] ${record.taskType} - ${record.usage.totalTokens} tokens`);
  });
}

// ============ 示例 6: 实用功能 - 邮件整理 ============

export async function organizeEmail(emailContent: string) {
  console.log('\n=== 邮件整理功能 ===');

  const prompt = `请帮我整理以下邮件内容，提取关键信息：

邮件内容：
${emailContent}

请提取：
1. 发件人
2. 主要内容摘要
3. 需要采取的行动
4. 优先级（高/中/低）
5. 建议回复时间`;

  try {
    const response = await aiManager.executeTask(prompt, {
      temperature: 0.3,  // 较低温度，更精确
      maxTokens: 800,
    });

    console.log('\n整理结果:');
    console.log(response.content);

    // 记录为邮件整理任务
    tokenManager.addRecord('openclaw', 'email-organize', response.usage, {
      prompt: emailContent,
      response: response.content,
    });

    return response;
  } catch (error) {
    console.error('邮件整理失败:', error);
    throw error;
  }
}

// ============ 示例 7: 实用功能 - 代码审查 ============

export async function reviewCode(code: string, language: string = 'typescript') {
  console.log('\n=== 代码审查功能 ===');

  const prompt = `请审查以下 ${language} 代码，指出潜在问题和改进建议：

\`\`\`${language}
${code}
\`\`\`

请从以下角度分析：
1. 代码质量和可读性
2. 潜在的 bug
3. 性能优化建议
4. 安全性问题
5. 最佳实践`;

  try {
    let fullReview = '';

    await aiManager.executeStreamTask(
      prompt,
      {
        onStart: () => {
          console.log('\n正在审查代码...\n');
        },
        onContent: (delta) => {
          fullReview += delta;
          process.stdout.write(delta);
        },
        onComplete: (response) => {
          console.log('\n\n代码审查完成!');

          // 记录为代码审查任务
          tokenManager.addRecord('openclaw', 'code-review', response.usage, {
            prompt: code,
            response: fullReview,
          });
        },
      },
      {
        temperature: 0.4,
        maxTokens: 2000,
      }
    );
  } catch (error) {
    console.error('代码审查失败:', error);
    throw error;
  }
}

// ============ 示例 8: 完整工作流 ============

export async function completeWorkflow() {
  console.log('\n========================================');
  console.log('   OpenClaw AI 引擎完整工作流演示');
  console.log('========================================');

  try {
    // 1. 初始化
    initializeOpenClaw();

    // 2. 检查状态
    await checkEngineStatus();

    // 3. 简单问答
    await simpleQuestion('请用一句话介绍 TypeScript');

    // 等待 1 秒
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 4. 流式问答
    await streamQuestion('解释一下什么是闭包，并给出一个 JavaScript 示例');

    // 5. 查看统计
    viewTokenStatistics();

    console.log('\n✅ 所有示例执行完成!');
  } catch (error) {
    console.error('\n❌ 工作流执行失败:', error);
  }
}

// ============ 导出便捷函数 ============

export const examples = {
  init: initializeOpenClaw,
  simpleQuestion,
  streamQuestion,
  checkStatus: checkEngineStatus,
  viewStats: viewTokenStatistics,
  organizeEmail,
  reviewCode,
  fullWorkflow: completeWorkflow,
};
