"use client";

import { useState } from "react";
import type { FocusEvent } from "react";
import { PenLine, Save, X } from "lucide-react";
import type { SavedDocument } from "@/lib/isoData";
import { normalizeGeneratedMarkdown } from "@/lib/markdownSanitizer";

type MarkdownDocumentProps = {
  title: string;
  content: string;
  status?: string;
  document?: SavedDocument;
  editable?: boolean;
  onChange?: (content: string) => void;
  onSave?: (content?: string) => void;
};

type TableBlock = {
  type: "table";
  rows: string[][];
};

type HeadingBlock = {
  type: "heading";
  level: number;
  text: string;
};

type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

type ListBlock =
  | {
      type: "list";
      items: string[];
    }
  | {
      type: "ordered-list";
      items: string[];
    };

type Block = TableBlock | HeadingBlock | ParagraphBlock | ListBlock;

export function MarkdownDocument({
  title,
  content,
  status,
  document,
  editable = false,
  onChange,
  onSave
}: MarkdownDocumentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableBlocks, setEditableBlocks] = useState<Block[]>([]);
  const normalizedContent = normalizeGeneratedMarkdown(content);
  const blocks = parseMarkdown(normalizedContent);

  function beginEditing() {
    setEditableBlocks(prepareEditableBlocks(parseMarkdown(normalizedContent)));
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditableBlocks([]);
    setIsEditing(false);
  }

  function saveCurrentContent() {
    if (isEditing) {
      const nextContent = normalizeGeneratedMarkdown(serializeBlocks(editableBlocks));
      onChange?.(nextContent);
      setIsEditing(false);
      onSave?.(nextContent);
      return;
    }

    onSave?.(normalizedContent);
  }

  function updateBlockText(blockIndex: number, value: string) {
    setEditableBlocks((current) =>
      current.map((block, index) => {
        if (
          index !== blockIndex ||
          (block.type !== "heading" && block.type !== "paragraph")
        ) {
          return block;
        }

        return { ...block, text: value };
      })
    );
  }

  function updateListItem(blockIndex: number, itemIndex: number, value: string) {
    setEditableBlocks((current) =>
      current.map((block, index) => {
        if (
          index !== blockIndex ||
          (block.type !== "list" && block.type !== "ordered-list")
        ) {
          return block;
        }

        return {
          ...block,
          items: block.items.map((item, currentIndex) =>
            currentIndex === itemIndex ? value : item
          )
        };
      })
    );
  }

  function addListItem(blockIndex: number) {
    setEditableBlocks((current) =>
      current.map((block, index) => {
        if (
          index !== blockIndex ||
          (block.type !== "list" && block.type !== "ordered-list")
        ) {
          return block;
        }

        return { ...block, items: [...block.items, "새 항목"] };
      })
    );
  }

  function updateTableCell(
    blockIndex: number,
    rowIndex: number,
    cellIndex: number,
    value: string
  ) {
    setEditableBlocks((current) =>
      current.map((block, index) => {
        if (index !== blockIndex || block.type !== "table") {
          return block;
        }

        return {
          ...block,
          rows: block.rows.map((row, currentRowIndex) =>
            currentRowIndex === rowIndex
              ? row.map((cell, currentCellIndex) =>
                  currentCellIndex === cellIndex ? value : cell
                )
              : row
          )
        };
      })
    );
  }

  function addTableRow(blockIndex: number) {
    setEditableBlocks((current) =>
      current.map((block, index) => {
        if (index !== blockIndex || block.type !== "table") {
          return block;
        }

        const columnCount = Math.max(block.rows[0]?.length ?? 2, 1);
        return {
          ...block,
          rows: [...block.rows, Array.from({ length: columnCount }, () => "")]
        };
      })
    );
  }

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
        {editable && (
          <div className="paper-actions">
            {isEditing ? (
              <>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cancelEditing}
                >
                  <X size={17} aria-hidden />
                  <span>취소</span>
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={saveCurrentContent}
                >
                  <Save size={17} aria-hidden />
                  <span>저장</span>
                </button>
              </>
            ) : (
              <>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={beginEditing}
                >
                  <PenLine size={17} aria-hidden />
                  <span>수정</span>
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={saveCurrentContent}
                >
                  <Save size={17} aria-hidden />
                  <span>저장</span>
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <div className={isEditing ? "paper-body paper-body-editing" : "paper-body"}>
        {(isEditing ? editableBlocks : blocks).map((block, index) =>
          isEditing ? (
            <EditableMarkdownBlock
              block={block}
              blockIndex={index}
              key={`${block.type}-${index}`}
              onAddListItem={addListItem}
              onAddTableRow={addTableRow}
              onBlockText={updateBlockText}
              onListItem={updateListItem}
              onTableCell={updateTableCell}
            />
          ) : (
            <MarkdownBlock block={block} key={`${block.type}-${index}`} />
          )
        )}
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
        {block.items.map((item, index) => (
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

  if (block.type === "paragraph") {
    return <p>{block.text}</p>;
  }

  return null;
}

function EditableMarkdownBlock({
  block,
  blockIndex,
  onAddListItem,
  onAddTableRow,
  onBlockText,
  onListItem,
  onTableCell
}: {
  block: Block;
  blockIndex: number;
  onAddListItem: (blockIndex: number) => void;
  onAddTableRow: (blockIndex: number) => void;
  onBlockText: (blockIndex: number, value: string) => void;
  onListItem: (blockIndex: number, itemIndex: number, value: string) => void;
  onTableCell: (
    blockIndex: number,
    rowIndex: number,
    cellIndex: number,
    value: string
  ) => void;
}) {
  if (block.type === "heading") {
    const commonProps = {
      className: "editable-paper-text",
      contentEditable: true,
      suppressContentEditableWarning: true,
      onBlur: (event: FocusEvent<HTMLHeadingElement>) =>
        onBlockText(blockIndex, event.currentTarget.textContent ?? "")
    };

    if (block.level === 1) {
      return <h1 {...commonProps}>{block.text}</h1>;
    }
    if (block.level === 2) {
      return <h2 {...commonProps}>{block.text}</h2>;
    }
    return <h3 {...commonProps}>{block.text}</h3>;
  }

  if (block.type === "paragraph") {
    return (
      <p
        className="editable-paper-text"
        contentEditable
        suppressContentEditableWarning
        onBlur={(event) =>
          onBlockText(blockIndex, event.currentTarget.textContent ?? "")
        }
      >
        {block.text}
      </p>
    );
  }

  if (block.type === "list" || block.type === "ordered-list") {
    const ListTag = block.type === "ordered-list" ? "ol" : "ul";

    return (
      <div className="editable-paper-list">
        <ListTag>
          {block.items.map((item, itemIndex) => (
            <li
              contentEditable
              key={`${item}-${itemIndex}`}
              suppressContentEditableWarning
              onBlur={(event) =>
                onListItem(
                  blockIndex,
                  itemIndex,
                  event.currentTarget.textContent ?? ""
                )
              }
            >
              {item}
            </li>
          ))}
        </ListTag>
        <button
          className="editable-add-button"
          type="button"
          onClick={() => onAddListItem(blockIndex)}
        >
          항목 추가
        </button>
      </div>
    );
  }

  if (block.type !== "table") {
    return null;
  }

  const [header, ...bodyRows] = block.rows;

  return (
    <div className="paper-table-wrap editable-paper-table">
      <table className="paper-table">
        {header && (
          <thead>
            <tr>
              {header.map((cell, cellIndex) => (
                <th
                  contentEditable
                  key={`${cell}-${cellIndex}`}
                  suppressContentEditableWarning
                  onBlur={(event) =>
                    onTableCell(
                      blockIndex,
                      0,
                      cellIndex,
                      event.currentTarget.textContent ?? ""
                    )
                  }
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`}>
              {row.map((cell, cellIndex) => (
                <td
                  contentEditable
                  key={`${cell}-${cellIndex}`}
                  suppressContentEditableWarning
                  onBlur={(event) =>
                    onTableCell(
                      blockIndex,
                      rowIndex + 1,
                      cellIndex,
                      event.currentTarget.textContent ?? ""
                    )
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="editable-add-button"
        type="button"
        onClick={() => onAddTableRow(blockIndex)}
      >
        행 추가
      </button>
    </div>
  );
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

function prepareEditableBlocks(blocks: Block[]) {
  return blocks.map((block) => {
    if (block.type === "table") {
      return {
        ...block,
        rows: block.rows.filter((row) => !isSeparatorRow(row))
      };
    }

    if (block.type === "list" || block.type === "ordered-list") {
      return { ...block, items: [...block.items] };
    }

    return { ...block };
  });
}

function serializeBlocks(blocks: Block[]) {
  return blocks
    .map((block) => {
      if (block.type === "heading") {
        return `${"#".repeat(Math.min(Math.max(block.level, 1), 3))} ${block.text.trim()}`;
      }

      if (block.type === "paragraph") {
        return block.text.trim();
      }

      if (block.type === "list") {
        return block.items
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item) => `- ${item}`)
          .join("\n");
      }

      if (block.type === "ordered-list") {
        return block.items
          .map((item) => item.trim())
          .filter(Boolean)
          .map((item, index) => `${index + 1}. ${item}`)
          .join("\n");
      }

      if (block.type === "table") {
        return serializeTable(block.rows);
      }

      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function serializeTable(rows: string[][]) {
  const [rawHeader, ...rawBody] = rows;
  if (!rawHeader?.length) {
    return "";
  }

  const header = rawHeader.map(cleanTableCell);
  const bodyRows = rawBody.map((row) =>
    Array.from({ length: header.length }, (_, index) =>
      cleanTableCell(row[index] ?? "")
    )
  );

  return [
    formatTableRow(header),
    formatTableRow(header.map(() => "---")),
    ...bodyRows.map(formatTableRow)
  ].join("\n");
}

function formatTableRow(row: string[]) {
  return `| ${row.join(" | ")} |`;
}

function cleanTableCell(value: string) {
  return value.replace(/\|/g, "/").replace(/\s+/g, " ").trim();
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
