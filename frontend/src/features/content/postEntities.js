/** Extract unique hashtag names from post text (#react → react). */
export function extractHashtagNames(text = "") {
  const matches = String(text).match(/#([\w\u0400-\u04FF][\w\u0400-\u04FF-]{1,31})/gi) || [];
  return [...new Set(matches.map((token) => token.slice(1).toLowerCase()))];
}

/** Split post text into plain / hashtag / mention segments for rich rendering. */
export function splitPostTextSegments(text = "") {
  const value = String(text);
  if (!value) return [];

  const pattern = /(#([\w\u0400-\u04FF][\w\u0400-\u04FF-]{1,31}))|(@([0-9a-f-]{8,}))/gi;
  const segments = [];
  let lastIndex = 0;
  let match = pattern.exec(value);

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      segments.push({ type: "hashtag", value: match[1], name: match[2] });
    } else if (match[3]) {
      segments.push({ type: "mention", value: match[3], userId: match[4] });
    }
    lastIndex = match.index + match[0].length;
    match = pattern.exec(value);
  }

  if (lastIndex < value.length) {
    segments.push({ type: "text", value: value.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "text", value }];
}
