export function evaluateCache(current, stored) {
    const documentMatches = current.documentVersion === stored.documentVersion;
    const modelMatches = current.modelVersion === stored.modelVersion;
    const reuse = stored.exists && documentMatches && modelMatches;
    let reason;
    if (!stored.exists) reason = 'The cache entry does not exist. There is no stored result to reuse, so this request needs a new calculation.';
    else if (documentMatches && modelMatches) reason = 'Both versions match. This request can reuse the stored result.';
    else if (!documentMatches && !modelMatches) reason = 'Both versions differ. The stored result does not meet the reuse rule in this example, so this request needs a new calculation.';
    else if (!documentMatches) reason = 'The document version changed from ' + stored.documentVersion + ' to ' + current.documentVersion + '. The model version matches, but this request still needs a new calculation.';
    else reason = 'The model version changed from ' + stored.modelVersion + ' to ' + current.modelVersion + '. The document version matches, but this request still needs a new calculation.';
    return Object.freeze({ documentMatches, modelMatches, reuse, reason });
  }
