"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Location } from "@/types/conversation"
import { AnimatePresence, motion } from "framer-motion"
import { File, ImageIcon, MapPin, Mic, Paperclip, Send, StopCircle, X } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { EmojiPicker } from "./emoji-picker"

interface MessageInputProps {
  value: string
  attachments: File[]
  location: Location | null
  onValueChange: (value: string) => void
  onAttachmentsChange: (files: File[]) => void
  onLocationChange: (location: Location | null) => void
  onSend: () => void
  placeholder?: string
  disabled?: boolean
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function MessageInput({
  value,
  attachments,
  location,
  onValueChange,
  onAttachmentsChange,
  onLocationChange,
  onSend,
  placeholder = "Escribe tu mensaje...",
  disabled = false,
}: MessageInputProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recordingInterval = useRef<NodeJS.Timeout | null>(null)

  const handleSend = () => {
    if (!value.trim() && attachments.length === 0 && !location) return
    onSend()
    textareaRef.current?.focus()
  }

  const handleShareLocation = () => {
    if ("geolocation" in navigator) {
      toast.info("Obteniendo ubicación...")
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: "Ubicación actual",
          }
          onLocationChange(newLocation)
          toast.success("Ubicación obtenida")
        },
        (error) => {
          console.error("[v0] Error getting location:", error)
          toast.error("No se pudo obtener la ubicación")
        }
      )
    } else {
      toast.error("Tu navegador no soporta geolocalización")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + attachments.length > 5) {
      toast.error("Máximo 5 archivos por mensaje")
      return
    }
    onAttachmentsChange([...attachments, ...files])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index))
  }

  const handleEmojiSelect = (emoji: string) => {
    onValueChange(value + emoji)
    textareaRef.current?.focus()
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)
    toast.info("Grabando audio...")
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current)
    }
    toast.success("Audio grabado")
    // TODO: Implement actual audio recording
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="border-t border-border p-4 bg-background">
      {/* Location Preview */}
      <AnimatePresence>
        {location && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 bg-brand-teal/10 rounded-lg px-3 py-2 text-sm">
              <MapPin className="h-4 w-4 text-brand-teal shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-brand-teal">Ubicación a compartir</div>
                <div className="text-xs text-muted-foreground truncate">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
              </div>
              <button onClick={() => onLocationChange(null)} className="hover:text-destructive transition-colors">
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached Files Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex flex-wrap gap-2"
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm max-w-[200px]"
              >
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <File className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                </div>
                <button onClick={() => removeFile(index)} className="hover:text-destructive transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center gap-3 bg-destructive/10 text-destructive rounded-lg px-4 py-3"
          >
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}>
              <div className="h-3 w-3 rounded-full bg-destructive" />
            </motion.div>
            <div className="flex-1">
              <div className="text-sm font-medium">Grabando audio</div>
              <div className="text-xs">{formatRecordingTime(recordingTime)}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={stopRecording} className="text-destructive hover:text-destructive">
              <StopCircle className="h-4 w-4 mr-2" />
              Detener
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Attachment button */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isRecording}
          className="shrink-0"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Emoji picker */}
        <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={disabled || isRecording} />

        {/* Location button */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={handleShareLocation}
          disabled={disabled || isRecording || !!location}
          className="shrink-0"
          title="Compartir ubicación"
        >
          <MapPin className={`h-4 w-4 ${location ? "text-brand-teal" : ""}`} />
        </Button>

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          disabled={disabled || isRecording}
          className="min-h-[60px] max-h-32 resize-none flex-1"
        />

        {/* Audio recording button */}
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          className="shrink-0"
        >
          <Mic className={`h-4 w-4 ${isRecording ? "text-destructive" : ""}`} />
        </Button>

        {/* Send button */}
        <Button onClick={handleSend} disabled={disabled || isRecording || (!value.trim() && attachments.length === 0 && !location)} size="icon" className="shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
