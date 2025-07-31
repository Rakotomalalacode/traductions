import { type NextRequest, NextResponse } from "next/server"

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

    // Utilise l'API REST directement avec fetch
    const response = await fetch("https://api-inference.huggingface.co/models/Helsinki-NLP/opus-mt-en-fr", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: text,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erreur API Hugging Face:", response.status, errorText)

      // Si le modèle n'est pas disponible, essayons un autre
      const fallbackResponse = await fetch("https://api-inference.huggingface.co/models/t5-base", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: `translate English to French: ${text}`,
          parameters: {
            max_length: 512,
          },
        }),
      })

      if (!fallbackResponse.ok) {
        return NextResponse.json({ error: "Service de traduction temporairement indisponible" }, { status: 503 })
      }

      const fallbackResult = await fallbackResponse.json()
      return NextResponse.json({
        translatedText: fallbackResult[0]?.generated_text || "Traduction non disponible",
        sourceLang,
        targetLang,
        originalText: text,
        fallback: true,
      })
    }

    const result = await response.json()
    const translatedText = result[0]?.translation_text || result[0]?.generated_text || "Traduction non disponible"

    return NextResponse.json({
      translatedText,
      sourceLang,
      targetLang,
      originalText: text,
    })
  } catch (error) {
    console.error("Erreur de traduction:", error)
    return NextResponse.json({ error: "Erreur lors de la traduction" }, { status: 500 })
  }
}
