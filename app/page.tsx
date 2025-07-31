"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowRightLeft, Languages, Loader2, Wand2, Sparkles } from "lucide-react"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
]


export default function AIWritingAssistant() {
  // Translation state
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [sourceLang, setSourceLang] = useState("en")
  const [targetLang, setTargetLang] = useState("fr")
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    if (!sourceText.trim()) return

    setIsTranslating(true)
    setTranslatedText("")

    try {
      const response = await fetch("/api/translate-advanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang,
          targetLang,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          setTranslatedText("❌ Erreur d'authentification : Vérifiez votre clé API Hugging Face")
        } else if (response.status === 503) {
          setTranslatedText("⏳ Service temporairement indisponible. Réessayez dans quelques instants.")
        } else {
          setTranslatedText(`❌ Erreur: ${data.error || "Erreur inconnue"}`)
        }
        return
      }

      setTranslatedText(data.translatedText)
    } catch (error) {
      console.error("Translation error:", error)
      setTranslatedText("❌ Erreur de connexion. Vérifiez votre connexion internet.")
    } finally {
      setIsTranslating(false)
    }
  }

  const swapLanguages = () => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setSourceText(translatedText)
    setTranslatedText(sourceText)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center my-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wand2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assistant IA d'Écriture</h1>
            <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Traduction de texte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="source-lang">Langue source</Label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger id="source-lang">
                    <SelectValue placeholder="Sélectionner la langue source" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="icon" onClick={swapLanguages} className="mt-6 bg-transparent">
                <ArrowRightLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <Label htmlFor="target-lang">Langue cible</Label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger id="target-lang">
                    <SelectValue placeholder="Sélectionner la langue cible" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source-text">Texte à traduire</Label>
                <Textarea
                  id="source-text"
                  placeholder="Saisissez votre texte ici..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>

              <div>
                <Label htmlFor="translated-text">Traduction</Label>
                <Textarea
                  id="translated-text"
                  placeholder="La traduction apparaîtra ici..."
                  value={translatedText}
                  readOnly
                  className="min-h-[200px] resize-none bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating} size="lg">
                {isTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traduction...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    Traduire
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
