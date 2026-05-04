"use client";

import { statusLabel, type SavedDocument } from "@/lib/isoData";

type HeadingBlock = {
  type: "heading";
  level: number;
  text: string;
};

type ParagraphBlock = {
  type: "paragraph";
  text: string;
};

type ListBlock = {
  type: "list";
  items: string[];
} | {
  type: "ordered-list";
  items: string[];
};

type TableBlock = {
  type: "table";
  rows: string[][];
};

type PdfBlock = HeadingBlock | ParagraphBlock | ListBlock | TableBlock;

type PdfImage = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

const displayPageWidth = 794;
const displayPageHeight = 1123;
const pdfPageWidth = 595.28;
const pdfPageHeight = 841.89;
const renderScale = 2;
const pageMargin = 54;
const fontFamily = '"Malgun Gothic", "Apple SD Gothic Neo", Arial, sans-serif';

export async function createDocumentPdfBlob(document: SavedDocument) {
  const canvases = renderDocumentToCanvases(document);
  const images = canvases.map((canvas) => ({
    bytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92)),
    width: canvas.width,
    height: canvas.height
  }));

  return buildPdfFromJpegs(images);
}

function renderDocumentToCanvases(document: SavedDocument) {
  const canvases: HTMLCanvasElement[] = [];
  let page = createPageCanvas();
  let context = page.context;

  let y = pageMargin;

  function startPage() {
    page = createPageCanvas();
    context = page.context;
    drawPageBackground(context);
    canvases.push(page.canvas);
    y = pageMargin;
  }

  function ensureSpace(requiredHeight: number) {
    if (y + requiredHeight <= displayPageHeight - pageMargin) {
      return;
    }

    drawFooter(context, canvases.length);
    startPage();
  }

  drawPageBackground(context);
  canvases.push(page.canvas);

  drawDocumentHeader(context, document, y);
  y += 118;

  parseMarkdown(document.content).forEach((block) => {
    if (block.type === "heading") {
      const fontSize = block.level === 1 ? 25 : block.level === 2 ? 18 : 15;
      const lineHeight = block.level === 1 ? 33 : block.level === 2 ? 27 : 23;
      const topGap = block.level === 1 ? 8 : 18;
      const lines = wrapText(context, block.text, displayPageWidth - pageMargin * 2, {
        size: fontSize,
        weight: 800
      });
      const requiredHeight = topGap + lines.length * lineHeight + 12;

      ensureSpace(requiredHeight);
      y += topGap;
      context.fillStyle = "#17212b";
      context.font = font(fontSize, 800);
      drawLines(context, lines, pageMargin, y, lineHeight);
      y += lines.length * lineHeight;

      if (block.level === 1) {
        context.strokeStyle = "#26384a";
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(pageMargin, y + 6);
        context.lineTo(displayPageWidth - pageMargin, y + 6);
        context.stroke();
        y += 16;
      } else {
        y += 7;
      }
      return;
    }

    if (block.type === "paragraph") {
      const lineHeight = 22;
      const lines = wrapText(context, block.text, displayPageWidth - pageMargin * 2, {
        size: 12.5,
        weight: 400
      });

      ensureSpace(lines.length * lineHeight + 14);
      context.fillStyle = "#2f3d4b";
      context.font = font(12.5, 400);
      drawLines(context, lines, pageMargin, y, lineHeight);
      y += lines.length * lineHeight + 13;
      return;
    }

    if (block.type === "list" || block.type === "ordered-list") {
      context.fillStyle = "#2f3d4b";
      context.font = font(12.5, 400);

      block.items.forEach((item, index) => {
        const marker = block.type === "ordered-list" ? `${index + 1}.` : "-";
        const lines = wrapText(context, item, displayPageWidth - pageMargin * 2 - 28, {
          size: 12.5,
          weight: 400
        });
        const lineHeight = 22;

        ensureSpace(lines.length * lineHeight + 8);
        context.fillText(marker, pageMargin, y);
        drawLines(context, lines, pageMargin + 28, y, lineHeight);
        y += lines.length * lineHeight + 7;
      });
      y += 5;
      return;
    }

    if (block.type === "table") {
      drawTable(block.rows, {
        context,
        getY: () => y,
        setY: (nextY) => {
          y = nextY;
        },
        ensureSpace
      });
    }
  });

  drawFooter(context, canvases.length);

  return canvases;
}

function createPageCanvas() {
  const canvas = window.document.createElement("canvas");
  canvas.width = displayPageWidth * renderScale;
  canvas.height = displayPageHeight * renderScale;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("PDF 변환을 위한 캔버스를 생성할 수 없습니다.");
  }
  context.scale(renderScale, renderScale);

  return { canvas, context };
}

function drawPageBackground(context: CanvasRenderingContext2D) {
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, displayPageWidth, displayPageHeight);
}

function drawDocumentHeader(
  context: CanvasRenderingContext2D,
  document: SavedDocument,
  startY: number
) {
  context.fillStyle = "#176b57";
  context.font = font(12, 800);
  context.fillText("ISO 9001 품질경영시스템 문서", pageMargin, startY);

  context.fillStyle = "#17212b";
  context.font = font(24, 800);
  const titleLines = wrapText(context, document.title, displayPageWidth - pageMargin * 2, {
    size: 24,
    weight: 800
  }).slice(0, 2);
  drawLines(context, titleLines, pageMargin, startY + 22, 31);

  context.fillStyle = "#647282";
  context.font = font(10.5, 700);
  context.fillText(
    `상태: ${statusLabel(document.status)}  버전: v${document.version}  저장일: ${document.updatedAt}`,
    pageMargin,
    startY + 92
  );

  context.strokeStyle = "#dfe6ee";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(pageMargin, startY + 110);
  context.lineTo(displayPageWidth - pageMargin, startY + 110);
  context.stroke();
}

function drawFooter(context: CanvasRenderingContext2D, pageNumber: number) {
  context.strokeStyle = "#e2e8ef";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(pageMargin, displayPageHeight - 38);
  context.lineTo(displayPageWidth - pageMargin, displayPageHeight - 38);
  context.stroke();

  context.fillStyle = "#8a96a3";
  context.font = font(9.5, 600);
  context.fillText(`Page ${pageNumber}`, displayPageWidth - pageMargin - 44, displayPageHeight - 24);
}

function drawTable(
  rows: string[][],
  helpers: {
    context: CanvasRenderingContext2D;
    getY: () => number;
    setY: (nextY: number) => void;
    ensureSpace: (requiredHeight: number) => void;
  }
) {
  const cleanRows = rows.filter((row) => !isSeparatorRow(row));
  const header = cleanRows[0];
  const bodyRows = cleanRows.slice(1);

  if (!header?.length) {
    return;
  }

  const context = helpers.context;
  const columnCount = Math.max(...cleanRows.map((row) => row.length));
  const tableWidth = displayPageWidth - pageMargin * 2;
  const columnWidth = tableWidth / columnCount;

  function drawRow(row: string[], rowIndex: number, forceHeader = false) {
    const isHeader = forceHeader || rowIndex === 0;
    context.font = font(10.5, isHeader ? 800 : 500);
    const wrapped = Array.from({ length: columnCount }, (_, columnIndex) =>
      wrapText(context, row[columnIndex] ?? "", columnWidth - 14, {
        size: 10.5,
        weight: isHeader ? 800 : 500
      })
    );
    const rowHeight = Math.max(
      isHeader ? 34 : 30,
      Math.max(...wrapped.map((lines) => lines.length)) * 16 + 16
    );

    helpers.ensureSpace(rowHeight + 6);
    const y = helpers.getY();

    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const x = pageMargin + columnIndex * columnWidth;
      context.fillStyle = isHeader ? "#edf2f6" : "#ffffff";
      context.fillRect(x, y, columnWidth, rowHeight);
      context.strokeStyle = "#b7c1cc";
      context.lineWidth = 1;
      context.strokeRect(x, y, columnWidth, rowHeight);
      context.fillStyle = isHeader ? "#1d2833" : "#263442";
      drawLines(context, wrapped[columnIndex], x + 7, y + 8, 16);
    }

    helpers.setY(y + rowHeight);
  }

  helpers.ensureSpace(50);
  drawRow(header, 0, true);

  bodyRows.forEach((row, rowIndex) => drawRow(row, rowIndex + 1));

  helpers.setY(helpers.getY() + 16);
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  style: { size: number; weight: number }
) {
  context.font = font(style.size, style.weight);
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [""];
  }

  const tokens = normalized.split(/(\s+)/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  tokens.forEach((token) => {
    const nextLine = line ? `${line}${token}` : token;

    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine;
      return;
    }

    if (line.trim()) {
      lines.push(line.trim());
    }

    if (context.measureText(token).width <= maxWidth) {
      line = token.trimStart();
      return;
    }

    const split = splitLongToken(context, token, maxWidth);
    lines.push(...split.slice(0, -1));
    line = split.at(-1) ?? "";
  });

  if (line.trim()) {
    lines.push(line.trim());
  }

  return lines.length ? lines : [normalized];
}

function splitLongToken(
  context: CanvasRenderingContext2D,
  token: string,
  maxWidth: number
) {
  const lines: string[] = [];
  let line = "";

  Array.from(token).forEach((character) => {
    const nextLine = `${line}${character}`;
    if (context.measureText(nextLine).width <= maxWidth) {
      line = nextLine;
      return;
    }

    if (line) {
      lines.push(line);
    }
    line = character;
  });

  if (line) {
    lines.push(line);
  }

  return lines;
}

function drawLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number
) {
  context.textBaseline = "top";
  lines.forEach((line, index) => {
    context.fillText(line, x, y + index * lineHeight);
  });
}

function font(size: number, weight: number) {
  return `${weight} ${size}px ${fontFamily}`;
}

function parseMarkdown(content: string) {
  const lines = content.split(/\r?\n/);
  const blocks: PdfBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        text: heading[2].trim()
      });
      index += 1;
      continue;
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
      !/^(#{1,3})\s+/.test(lines[index].trim()) &&
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

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function buildPdfFromJpegs(images: PdfImage[]) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let offset = 0;
  const objectCount = 2 + images.length * 3;

  function push(chunk: string | Uint8Array) {
    const bytes = typeof chunk === "string" ? encoder.encode(chunk) : chunk;
    chunks.push(bytes);
    offset += bytes.length;
  }

  function addObject(objectNumber: number, parts: Array<string | Uint8Array>) {
    offsets[objectNumber] = offset;
    push(`${objectNumber} 0 obj\n`);
    parts.forEach(push);
    push("\nendobj\n");
  }

  push("%PDF-1.4\n");

  addObject(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  addObject(2, [
    `<< /Type /Pages /Kids [${images
      .map((_, index) => `${3 + index * 3} 0 R`)
      .join(" ")}] /Count ${images.length} >>`
  ]);

  images.forEach((image, index) => {
    const pageObject = 3 + index * 3;
    const contentObject = pageObject + 1;
    const imageObject = pageObject + 2;
    const imageName = `Im${index + 1}`;
    const content = `q\n${pdfPageWidth} 0 0 ${pdfPageHeight} 0 0 cm\n/${imageName} Do\nQ`;

    addObject(pageObject, [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfPageWidth} ${pdfPageHeight}] /Resources << /XObject << /${imageName} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`
    ]);
    addObject(contentObject, [
      `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`
    ]);
    addObject(imageObject, [
      `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`,
      image.bytes,
      "\nendstream"
    ]);
  });

  const xrefOffset = offset;
  push(`xref\n0 ${objectCount + 1}\n`);
  push("0000000000 65535 f \n");

  for (let objectNumber = 1; objectNumber <= objectCount; objectNumber += 1) {
    push(`${String(offsets[objectNumber]).padStart(10, "0")} 00000 n \n`);
  }

  push(
    `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  const output = new Uint8Array(offset);
  let position = 0;

  chunks.forEach((chunk) => {
    output.set(chunk, position);
    position += chunk.length;
  });

  return new Blob([output.buffer as ArrayBuffer], { type: "application/pdf" });
}
