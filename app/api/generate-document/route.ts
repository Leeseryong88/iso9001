import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import {
  buildDocumentPrompt,
  ensureFormalDocument,
  type CompanyProfile
} from "@/lib/documentGenerator";
import { documentDefinitions } from "@/lib/isoData";

type GenerateRequest = {
  documentId: string;
  answers: Record<string, string>;
  company: CompanyProfile;
};

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateRequest;
  const document = documentDefinitions.find((item) => item.id === body.documentId);

  if (!document) {
    return NextResponse.json(
      { error: "지원하지 않는 문서 유형입니다." },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const modelName = process.env.GEMINI_MODEL ?? "gemini-3.0-flash";
  const maxOutputTokens = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS ?? 8192);

  if (!apiKey) {
    return NextResponse.json(
      { error: "문서 생성 서비스 설정을 확인해야 합니다." },
      { status: 500 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens,
        temperature: 0.35,
        topP: 0.9
      }
    });
    const result = await model.generateContent(
      buildDocumentPrompt({
        document,
        answers: body.answers ?? {},
        company: body.company
      })
    );
    const rawContent = result.response.text().trim();
    if (!rawContent) {
      throw new Error("문서 생성 결과가 비어 있습니다.");
    }

    const content = ensureFormalDocument(
      {
        document,
        answers: body.answers ?? {},
        company: body.company
      },
      rawContent
    );

    return NextResponse.json({
      title: document.title,
      content,
      reviewRequired: document.reviewNotes,
      relatedActions: document.relatedActions,
      source: "gemini"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `문서 생성에 실패했습니다: ${message}` },
      { status: 502 }
    );
  }
}
