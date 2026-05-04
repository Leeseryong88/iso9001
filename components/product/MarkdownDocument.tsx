import type { SavedDocument } from "@/lib/isoData";
import { normalizeGeneratedMarkdown } from "@/lib/markdownSanitizer";

type MarkdownDocumentProps = {
  title: string;
  content: string;
  status?: string;
  document?: SavedDocument;
};

type TableBlock = {
  type: "table";
  rows: string[][];
};

type TextBlock = {
  type: "heading" | "paragraph" | "list" | "ordered-list";
  level?: number;
  text?: string;
  items?: string[];
};

type Block = TableBlock | TextBlock;

export function MarkdownDocument({
  title,
  content,
  status,
  document
}: MarkdownDocumentProps) {
  const blocks = parseMarkdown(normalizeGeneratedMarkdown(content));

  return (
    <article className="paper-preview" aria-label={`${title} 미리보기`}>
      <header className="paper-cover">
        <div>
          <p>ISO 9001 품질경영시스템 문서</p>
          <h2>{title}</h2>
        </div>
        <dl>
          <div>
            <dt>문서상태</dt>
            <dd>{status ?? "작성 중"}</dd>
          </div>
          {document && (
            <>
              <div>
                <dt>버전</dt>
                <dd>v{document.version}</dd>
              </div>
              <div>
                <dt>최종수정</dt>
                <dd>{document.updatedAt}</dd>
              </div>
            </>
          )}
        </dl>
      </header>

      <div className="paper-body">
        {blocks.map((block, index) => (
          <MarkdownBlock block={block} key={`${block.type}-${index}`} />
        ))}
      </div>
    </article>
  );
}

function MarkdownBlock({ block }: { block: Block }) {
  if (block.type === "heading") {
    if (block.level === 1) {
      return <h1>{block.text}</h1>;
    }
    if (block.level === 2) {
      return <h2>{block.text}</h2>;
    }
    return <h3>{block.text}</h3>;
  }

  if (block.type === "list" || block.type === "ordered-list") {
    const ListTag = block.type === "ordered-list" ? "ol" : "ul";

    return (
      <ListTag>
        {block.items?.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ListTag>
    );
  }

  if (block.type === "table") {
    const [header, separator, ...body] = block.rows;
    const bodyRows = isSeparatorRow(separator) ? body : block.rows.slice(1);

    return (
      <div className="paper-table-wrap">
        <table className="paper-table">
          {header && (
            <thead>
              <tr>
                {header.map((cell, cellIndex) => (
                  <th key={`${cell}-${cellIndex}`}>{cell}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {bodyRows.map((row, rowIndex) => (
              <tr key={`${row.join("-")}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <p>{block.text}</p>;
}

function parseMarkdown(content: string) {
  const lines = content.split(/\r?\n/);
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    if (line.startsWith("#")) {
      const match = line.match(/^(#{1,3})\s+(.*)$/);
      if (match) {
        blocks.push({
          type: "heading",
          level: match[1].length,
          text: match[2].trim()
        });
        index += 1;
        continue;
      }
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      const rows: string[][] = [];
      while (
        index < lines.length &&
        lines[index].trim().startsWith("|") &&
        lines[index].trim().endsWith("|")
      ) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }
      blocks.push({ type: "table", rows });
      continue;
    }

    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("#") &&
      !lines[index].trim().startsWith("|") &&
      !lines[index].trim().startsWith("- ") &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

function parseTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(row?: string[]) {
  if (!row) {
    return false;
  }

  return row.every((cell) => /^:?-{3,}:?$/.test(cell));
}
