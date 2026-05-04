const unsupportedBullet = /^[\s]*[•▪◦‣◆◇■□●○]\s+/;
const unsupportedCheckbox = /^[\s]*[-*+]\s+\[[ xX]\]\s+/;

export function normalizeGeneratedMarkdown(content: string) {
  const withoutCodeFence = content
    .replace(/\r\n/g, "\n")
    .replace(/^\s*```(?:markdown|md)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(strong|b|em|i|u)>/gi, "");

  const lines = withoutCodeFence
    .split("\n")
    .map((line) => normalizeMarkdownLine(line))
    .filter((line, index, lines) => {
      if (line.trim()) {
        return true;
      }
      return index === 0 || lines[index - 1].trim();
    });

  return lines.join("\n").trim();
}

function normalizeMarkdownLine(line: string) {
  let next = line.trimEnd();

  next = next
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[✅☑✔✖❌⚠️⭐★☆]/g, "");

  if (unsupportedCheckbox.test(next)) {
    next = next.replace(unsupportedCheckbox, "- ");
  }

  if (unsupportedBullet.test(next)) {
    next = next.replace(unsupportedBullet, "- ");
  }

  if (/^\s*[*>]\s+/.test(next)) {
    next = next.replace(/^\s*[*>]\s+/, "");
  }

  return normalizeTableSeparator(next);
}

function normalizeTableSeparator(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return line;
  }

  const cells = trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  const isSeparator = cells.every((cell) => /^:?-{2,}:?$/.test(cell));
  if (!isSeparator) {
    return line;
  }

  return `| ${cells.map(() => "---").join(" | ")} |`;
}
