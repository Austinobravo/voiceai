"use client"

import { AuthGuard, useAuth } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Sparkles,
  Mic,
  MicOff,
  Play,
  Pause,
  MessageSquare,
  Volume2,
  User,
  LogOut,
  Settings,
  Square,
  AlertCircle,
  FileText,
  FileAudio,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

function DashboardContent() {
  const { user, logout } = useAuth()
  const [textInput, setTextInput] = useState("")
  const [questionInput, setQuestionInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcribedText, setTranscribedText] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [voices, setVoices] = useState<any[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [speechRate, setSpeechRate] = useState([1])
  const [speechPitch, setSpeechPitch] = useState([1])
  const [speechVolume, setSpeechVolume] = useState([1])
  const [recognitionLanguage, setRecognitionLanguage] = useState("en-US")
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [generatedAudioBlob, setGeneratedAudioBlob] = useState<Blob | null>(null)
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null)
  const [aiAudioBlob, setAiAudioBlob] = useState<Blob | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const utteranceRef = useRef<any | null>(null)
  const recognitionRef = useRef<any | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name)
      }
    }

    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [selectedVoice])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = recognitionLanguage

        recognition.onstart = () => {
          console.log("[v0] Speech recognition started")
          setIsListening(true)
          setSpeechError("")
        }

        recognition.onresult = (event) => {
          let finalTranscript = ""
          let interimTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setTranscribedText((prev) => prev + finalTranscript)
            console.log("[v0] Final transcript:", finalTranscript)
          }
          setInterimTranscript(interimTranscript)
        }

        recognition.onerror = (event) => {
          console.error("[v0] Speech recognition error:", event.error)
          setSpeechError(`Recognition error: ${event.error}`)
          setIsRecording(false)
          setIsListening(false)
        }

        recognition.onend = () => {
          console.log("[v0] Speech recognition ended")
          setIsListening(false)
          if (isRecording) {
            // Restart recognition if still recording
            recognition.start()
          }
        }

        recognitionRef.current = recognition
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [recognitionLanguage, isRecording])

  const handleTextToSpeech = async () => {
    if (!textInput.trim()) return

    // Stop any current speech
    speechSynthesis.cancel()

    setIsProcessing(true)
    setIsSpeaking(true)

    try {
      // Create audio context for recording the generated speech
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const destination = audioContext.createMediaStreamDestination()
      const mediaRecorder = new MediaRecorder(destination.stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        setGeneratedAudioBlob(audioBlob)
        console.log("[v0] Audio blob created for download")
      }

      const utterance = new window.SpeechSynthesisUtterance(textInput)
      utteranceRef.current = utterance

      // Configure voice settings
      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) utterance.voice = voice

      utterance.rate = speechRate[0]
      utterance.pitch = speechPitch[0]
      utterance.volume = speechVolume[0]

      utterance.onstart = () => {
        console.log("[v0] Speech started")
        setIsProcessing(false)
        mediaRecorder.start()
      }

      utterance.onend = () => {
        console.log("[v0] Speech ended")
        setIsSpeaking(false)
        mediaRecorder.stop()
        audioContext.close()
      }

      utterance.onerror = (event) => {
        console.error("[v0] Speech error:", event.error)
        setIsSpeaking(false)
        setIsProcessing(false)
        mediaRecorder.stop()
        audioContext.close()
      }

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("[v0] TTS Error:", error)
      setIsProcessing(false)
      setIsSpeaking(false)
      // Fallback to simple TTS without recording
      const utterance = new window.SpeechSynthesisUtterance(textInput)
      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) utterance.voice = voice
      utterance.rate = speechRate[0]
      utterance.pitch = speechPitch[0]
      utterance.volume = speechVolume[0]
      utterance.onstart = () => setIsProcessing(false)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeech = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsProcessing(false)
  }

  const speakAiResponse = () => {
    if (!aiResponse.trim()) return

    window.speechSynthesis.cancel()
    setIsSpeaking(true)

    try {
      // Create audio context for recording AI response speech
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const destination = audioContext.createMediaStreamDestination()
      const mediaRecorder = new MediaRecorder(destination.stream)
      const audioChunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        setAiAudioBlob(audioBlob)
        console.log("[v0] AI audio blob created for download")
      }

      const utterance = new window.SpeechSynthesisUtterance(aiResponse)
      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) utterance.voice = voice

      utterance.rate = speechRate[0]
      utterance.pitch = speechPitch[0]
      utterance.volume = speechVolume[0]

      utterance.onstart = () => {
        mediaRecorder.start()
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        mediaRecorder.stop()
        audioContext.close()
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        mediaRecorder.stop()
        audioContext.close()
      }

      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("[v0] AI Speech Error:", error)
      // Fallback to simple speech
      const utterance = new window.SpeechSynthesisUtterance(aiResponse)
      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) utterance.voice = voice
      utterance.rate = speechRate[0]
      utterance.pitch = speechPitch[0]
      utterance.volume = speechVolume[0]
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition not supported in this browser")
      return
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current.stop()
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      setIsListening(false)
      setInterimTranscript("")
      console.log("[v0] Stopped recording")
    } else {
      // Start recording
      setTranscribedText("")
      setInterimTranscript("")
      setSpeechError("")
      setIsRecording(true)
      audioChunksRef.current = []

      try {
        // Start audio recording
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
          setRecordedAudioBlob(audioBlob)
          console.log("[v0] Recorded audio blob created")
          // Stop all tracks to release microphone
          stream.getTracks().forEach((track) => track.stop())
        }

        mediaRecorder.start()
        recognitionRef.current.start()
        console.log("[v0] Started recording")
      } catch (error) {
        console.error("[v0] Failed to start recording:", error)
        setSpeechError("Failed to access microphone")
        setIsRecording(false)
      }
    }
  }

  const clearTranscript = () => {
    setTranscribedText("")
    setInterimTranscript("")
    setRecordedAudioBlob(null)
  }

  const handleDownload = (type: "audio" | "text", source?: "tts" | "recording" | "ai") => {
    console.log("[v0] Download initiated for:", type, source)

    if (type === "text") {
      let content = ""
      let filename = ""

      if (source === "ai" && aiResponse) {
        content = `AI Response:\n\nQuestion: ${questionInput}\n\nAnswer: ${aiResponse}`
        filename = `ai-response-${new Date().toISOString().slice(0, 10)}.txt`
      } else if (transcribedText) {
        content = `Voice Transcription:\n\n${transcribedText}`
        filename = `voice-transcript-${new Date().toISOString().slice(0, 10)}.txt`
      } else if (textInput) {
        content = `Text for Speech:\n\n${textInput}`
        filename = `text-content-${new Date().toISOString().slice(0, 10)}.txt`
      } else {
        console.log("[v0] No text content to download")
        return
      }

      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      console.log("[v0] Text file downloaded:", filename)
    } else if (type === "audio") {
      let audioBlob: Blob | null = null
      let filename = ""

      if (source === "tts" && generatedAudioBlob) {
        audioBlob = generatedAudioBlob
        filename = `generated-speech-${new Date().toISOString().slice(0, 10)}.wav`
      } else if (source === "recording" && recordedAudioBlob) {
        audioBlob = recordedAudioBlob
        filename = `voice-recording-${new Date().toISOString().slice(0, 10)}.wav`
      } else if (source === "ai" && aiAudioBlob) {
        audioBlob = aiAudioBlob
        filename = `ai-response-audio-${new Date().toISOString().slice(0, 10)}.wav`
      } else {
        // Fallback: create a simple audio file with text-to-speech
        const text = source === "ai" ? aiResponse : textInput
        if (!text) {
          console.log("[v0] No audio content to download")
          return
        }

        // Create a simple TTS audio for download
        const utterance = new window.SpeechSynthesisUtterance(text)
        const voice = voices.find((v) => v.name === selectedVoice)
        if (voice) utterance.voice = voice
        utterance.rate = speechRate[0]
        utterance.pitch = speechPitch[0]
        utterance.volume = speechVolume[0]

        // Note: This is a simplified approach. In a real app, you'd use Web Audio API
        console.log("[v0] Audio download requested but no recorded audio available")
        alert("Audio download will be available after generating or recording audio.")
        return
      }

      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        console.log("[v0] Audio file downloaded:", filename)
      }
    }
  }

  const handleAskAI = async () => {
    if (!questionInput.trim()) return

    setIsAiProcessing(true)
    setAiResponse("")

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: questionInput }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      setAiResponse(data.response)
      console.log("[v0] AI response received:", data.response)
    } catch (error) {
      console.error("[v0] AI Error:", error)
      setAiResponse("Sorry, I couldn't process your question at the moment. Please try again.")
    } finally {
      setIsAiProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              VoiceAI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {user?.name || user?.email}
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice AI Dashboard</h1>
          <p className="text-muted-foreground">Transform your voice with AI-powered tools</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Text to Speech Section */}
          <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-blue-600" />
                Text to Speech
              </CardTitle>
              <CardDescription>Convert your text into natural-sounding speech</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to convert to speech..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-32 resize-none"
              />

              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800">Voice Settings</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-blue-700">Voice</Label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.name} value={voice.name} className="text-xs">
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-blue-700">Speed: {speechRate[0]}</Label>
                    <Slider
                      value={speechRate}
                      onValueChange={setSpeechRate}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-blue-700">Pitch: {speechPitch[0]}</Label>
                    <Slider
                      value={speechPitch}
                      onValueChange={setSpeechPitch}
                      max={2}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-blue-700">Volume: {speechVolume[0]}</Label>
                    <Slider
                      value={speechVolume}
                      onValueChange={setSpeechVolume}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleTextToSpeech}
                  disabled={!textInput.trim() || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? "Processing..." : "Generate Speech"}
                </Button>

                {isSpeaking && (
                  <Button variant="destructive" onClick={stopSpeech}>
                    <Square className="w-4 h-4" />
                    Stop
                  </Button>
                )}

                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("audio", "tts")}
                    disabled={!generatedAudioBlob}
                    title="Download generated speech audio"
                  >
                    <FileAudio className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload("text")}
                    disabled={!textInput.trim()}
                    title="Download text content"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Speech to Text Section */}
          <Card className="shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-purple-600" />
                Speech to Text
              </CardTitle>
              <CardDescription>Record your voice and convert it to text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-purple-700">Recognition Language</Label>
                <Select value={recognitionLanguage} onValueChange={setRecognitionLanguage}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es-ES">Spanish</SelectItem>
                    <SelectItem value="fr-FR">French</SelectItem>
                    <SelectItem value="de-DE">German</SelectItem>
                    <SelectItem value="it-IT">Italian</SelectItem>
                    <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                    <SelectItem value="ja-JP">Japanese</SelectItem>
                    <SelectItem value="ko-KR">Korean</SelectItem>
                    <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <div className="text-center space-y-4">
                  <Button
                    onClick={toggleRecording}
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className={isRecording ? "" : "bg-purple-600 hover:bg-purple-700"}
                    disabled={!recognitionRef.current}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-5 h-5 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5 mr-2" />
                        Start Recording
                      </>
                    )}
                  </Button>

                  {isListening && (
                    <div className="flex items-center justify-center gap-2 text-purple-600">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                      <span className="text-sm">Listening...</span>
                    </div>
                  )}
                </div>
              </div>

              {speechError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{speechError}</AlertDescription>
                </Alert>
              )}

              {(transcribedText || interimTranscript) && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Transcribed Text:</p>
                    <Button variant="ghost" size="sm" onClick={clearTranscript}>
                      Clear
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    {transcribedText && <p className="text-foreground">{transcribedText}</p>}
                    {interimTranscript && <p className="text-muted-foreground italic">{interimTranscript}</p>}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("audio", "recording")}
                      disabled={!recordedAudioBlob}
                      title="Download recorded audio"
                    >
                      <FileAudio className="w-4 h-4 mr-2" />
                      Audio
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload("text")}
                      disabled={!transcribedText}
                      title="Download transcript"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuestionInput(transcribedText)}
                      disabled={!transcribedText}
                    >
                      Ask AI
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Question Answering Section */}
          <Card className="lg:col-span-2 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                AI Question Answering
              </CardTitle>
              <CardDescription>Ask questions and get AI-powered answers in text and voice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Ask your question here..."
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    className="min-h-32 resize-none"
                  />
                  <Button
                    onClick={handleAskAI}
                    disabled={!questionInput.trim() || isAiProcessing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isAiProcessing ? "AI Thinking..." : "Ask AI"}
                  </Button>
                </div>

                <div className="space-y-4">
                  {aiResponse ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg max-h-80 overflow-y-auto">
                      <p className="text-sm font-medium mb-2 text-green-800">AI Response:</p>
                      <p className="text-sm text-green-700 whitespace-pre-wrap">{aiResponse}</p>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button variant="outline" size="sm" onClick={speakAiResponse} disabled={isSpeaking}>
                          {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          {isSpeaking ? "Speaking..." : "Play Audio"}
                        </Button>
                        {isSpeaking && (
                          <Button variant="destructive" size="sm" onClick={stopSpeech}>
                            <Square className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload("audio", "ai")}
                          disabled={!aiAudioBlob}
                          title="Download AI response audio"
                        >
                          <FileAudio className="w-4 h-4" />
                          Audio
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload("text", "ai")}
                          title="Download AI response text"
                        >
                          <FileText className="w-4 h-4" />
                          Text
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-muted-foreground/20 rounded-lg text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {isAiProcessing ? "AI is thinking..." : "AI response will appear here"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Volume2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-blue-600">Texts Converted</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Mic className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-sm text-purple-600">Voice Recordings</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-green-600">AI Questions Asked</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
