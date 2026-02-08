"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { ChannelLine } from "@/types/conversation"
import { useForm } from "@inertiajs/react"
import { FileText, MessageSquare } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface NewConversationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  channelLines: ChannelLine[]
  createUrl: string
}

const mockTemplates = [
  { id: "t1", name: "Saludo inicial", content: "Hola {{name}}, ¿en qué podemos ayudarte hoy?" },
  { id: "t2", name: "Seguimiento de pedido", content: "Hola, te contactamos para el seguimiento de tu pedido {{order_id}}" },
  { id: "t3", name: "Recordatorio de pago", content: "Hola {{name}}, te recordamos que tienes un pago pendiente de {{amount}}" },
]

export function NewConversationModal({ open, onOpenChange, channelLines, createUrl }: NewConversationModalProps) {
  const form = useForm({
    clientPhone: "",
    channelLineId: "",
    message: "",
    templateId: "",
  })
  const [messageType, setMessageType] = useState<"manual" | "template">("manual")

  const handleSubmit = () => {
    if (!form.data.clientPhone || !form.data.channelLineId) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    if (messageType === "manual" && !form.data.message) {
      toast.error("Por favor escribe un mensaje")
      return
    }

    if (messageType === "template" && !form.data.templateId) {
      toast.error("Por favor selecciona un template")
      return
    }

    form.transform((data) => ({
      client_phone: data.clientPhone,
      channel_id: data.channelLineId,
      message: messageType === "manual" ? data.message : undefined,
      template_id: messageType === "template" ? data.templateId : undefined,
    }))

    form.post(createUrl, {
      preserveScroll: true,
      onSuccess: () => {
        form.reset()
        setMessageType("manual")
        onOpenChange(false)
        toast.success("Conversacion iniciada correctamente")
      },
      onError: () => {
        toast.error("Error al iniciar conversacion")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Nueva Conversación</DialogTitle>
          <DialogDescription>Inicia una nueva conversación con un cliente</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono del cliente *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={form.data.clientPhone}
              onChange={(e) => form.setData("clientPhone", e.target.value)}
            />
          </div>

          {/* Channel Line Selection */}
          <div className="space-y-2">
            <Label htmlFor="line">Línea / Canal *</Label>
            <Select value={form.data.channelLineId} onValueChange={(value) => form.setData("channelLineId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una línea" />
              </SelectTrigger>
              <SelectContent>
                {channelLines.map((line) => (
                  <SelectItem key={line.id} value={line.id}>
                    {line.name} ({line.channelType}) {line.phoneNumber && `- ${line.phoneNumber}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message Type Tabs */}
          <Tabs value={messageType} onValueChange={(v) => setMessageType(v as "manual" | "template")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                <MessageSquare className="mr-2 h-4 w-4" />
                Mensaje Manual
              </TabsTrigger>
              <TabsTrigger value="template">
                <FileText className="mr-2 h-4 w-4" />
                Template
              </TabsTrigger>
            </TabsList>

            {/* Manual Message */}
            <TabsContent value="manual" className="space-y-2">
              <Label htmlFor="message">Mensaje inicial</Label>
              <Textarea
                id="message"
                placeholder="Escribe el primer mensaje..."
                value={form.data.message}
                onChange={(e) => form.setData("message", e.target.value)}
                rows={4}
              />
            </TabsContent>

            {/* Template Selection */}
            <TabsContent value="template" className="space-y-2">
              <Label htmlFor="template">Selecciona un template</Label>
              <Select value={form.data.templateId} onValueChange={(value) => form.setData("templateId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un template" />
                </SelectTrigger>
                <SelectContent>
                  {mockTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.data.templateId && (
                <div className="p-3 bg-muted rounded-md text-sm">
                  <p className="text-muted-foreground mb-1">Vista previa:</p>
                  <p>{mockTemplates.find((t) => t.id === form.data.templateId)?.content}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={form.processing}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={form.processing}>
            {form.processing ? "Iniciando..." : "Iniciar Conversacion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
