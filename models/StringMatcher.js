class StringMatcher {
  static compare(input1, input2, caseSensitive) {
    const raw1 = String(input1 ?? "");
    const raw2 = String(input2 ?? "");

    const source = caseSensitive ? raw1 : raw1.toLowerCase();
    const target = caseSensitive ? raw2 : raw2.toLowerCase();

    const distinctChars = [];
    for (let i = 0; i < source.length; i++) {
      const ch = source[i];
      // nested if here
      if (!distinctChars.includes(ch)) {
        distinctChars.push(ch);
      }
    }

    const matched = [];
    const unmatched = [];

    for (let i = 0; i < distinctChars.length; i++) {
      const ch = distinctChars[i];
      let found = false;

      //nested loop here
      for (let j = 0; j < target.length; j++) {
        if (target[j] === ch) {
          found = true;
          break;
        }
      }

      if (found) {
        matched.push(ch);
      } else {
        unmatched.push(ch);
      }
    }

    const totalLength = raw1.length;
    // math
    const percentage =
      distinctChars.length === 0
        ? 0
        : (matched.length / distinctChars.length) * 100;

    return {
      input1: raw1,
      input2: raw2,
      caseSensitive,
      totalLength,
      distinctChars,
      matched,
      unmatched,
      matchedCount: matched.length,
      percentage: Math.round(percentage * 100) / 100,
    };
  }
}

module.exports = StringMatcher;
