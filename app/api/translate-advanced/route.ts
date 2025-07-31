import { type NextRequest, NextResponse } from "next/server"


const modelMap: Record<string, string> = {
  "en-fr": "Helsinki-NLP/opus-mt-en-fr",
  "fr-en": "Helsinki-NLP/opus-mt-fr-en",
}


export async function POST(req: NextRequest) {
  try {
    const { text, sourceLang, targetLang } = await req.json()

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API Hugging Face manquante" }, { status: 500 })
    }

    const key = `${sourceLang}-${targetLang}`.toLowerCase()
    const model = modelMap[key]

    if (!model) {
      return NextResponse.json(
        { error: `Aucun modèle disponible pour ${sourceLang} → ${targetLang}` },
        { status: 400 },
      )
    }

    console.log(`Modèle utilisé : ${model}`)

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: text }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erreur API: ${response.status} - ${errorText}`)
      return NextResponse.json({
        translatedText: `[${sourceLang}→${targetLang}] ${text}`,
        sourceLang,
        targetLang,
        originalText: text,
        model: "fallback",
        fallback: true,
      })
    }

    const result = await response.json()

    let translatedText = "Traduction non disponible"

    if (Array.isArray(result) && result.length > 0) {
      translatedText = result[0]?.translation_text || translatedText
    } else if (result.translation_text) {
      translatedText = result.translation_text
    }

    return NextResponse.json({
      translatedText,
      sourceLang,
      targetLang,
      originalText: text,
      model,
    })
  } catch (error) {
    console.error("Erreur générale:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la traduction",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    )
  }
}