export function evaluateCache(current, stored) {
    const documentMatches = current.documentVersion === stored.documentVersion;
    const modelMatches = current.modelVersion === stored.modelVersion;
    const reuse = stored.exists && documentMatches && modelMatches;
    let reason;
    if (!stored.exists) reason = '缓存不存在。没有旧结果可以复用，需要重新计算。';
    else if (documentMatches && modelMatches) reason = '两项版本都匹配。这个请求可以直接使用已有结果。';
    else if (!documentMatches && !modelMatches) reason = '两项版本都变化了。已有结果不满足本例的复用规则，需要重新计算。';
    else if (!documentMatches) reason = '文档版本从 ' + stored.documentVersion + ' 变为 ' + current.documentVersion + '。模型版本虽然匹配，仍然需要重新计算。';
    else reason = '模型版本从 ' + stored.modelVersion + ' 变为 ' + current.modelVersion + '。文档版本虽然匹配，仍然需要重新计算。';
    return Object.freeze({ documentMatches, modelMatches, reuse, reason });
  }
