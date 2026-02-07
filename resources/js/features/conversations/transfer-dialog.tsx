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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { TransferTarget } from "@/types/conversation"
import { Bot, Building2, User } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface TransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransfer: (target: TransferTarget, targetId: string) => void
  conversationId?: string
}

const mockAgents = [
  { id: "a1", name: "Ana García", status: "available" },
  { id: "a2", name: "Carlos López", status: "busy" },
  { id: "a3", name: "María Rodríguez", status: "available" },
]

const mockAIAgents = [
  { id: "ai1", name: "Asistente de Ventas", speciality: "Ventas y producto" },
  { id: "ai2", name: "Soporte Técnico IA", speciality: "Soporte técnico" },
  { id: "ai3", name: "Asistente General", speciality: "Consultas generales" },
]

const mockDepartments = [
  { id: "d1", name: "Ventas", agents: 5 },
  { id: "d2", name: "Soporte Técnico", agents: 8 },
  { id: "d3", name: "Facturación", agents: 3 },
]

export function TransferDialog({ open, onOpenChange, onTransfer }: TransferDialogProps) {
  const [transferType, setTransferType] = useState<TransferTarget>("agent")
  const [selectedTarget, setSelectedTarget] = useState("")
  const [isTransferring, setIsTransferring] = useState(false)

  const handleTransfer = async () => {
    if (!selectedTarget) {
      toast.error("Por favor selecciona un destino")
      return
    }

    setIsTransferring(true)

    try {
      await onTransfer(transferType, selectedTarget)
      setSelectedTarget("")
      onOpenChange(false)
      toast.success("Conversación transferida correctamente")
    } catch {
      toast.error("Error al transferir conversación")
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Transferir Conversación</DialogTitle>
          <DialogDescription>
            Transfiere esta conversación a otro agente, IA o departamento. El historial se mantendrá intacto.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={transferType} onValueChange={(v) => setTransferType(v as TransferTarget)} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agent">
              <User className="mr-2 h-4 w-4" />
              Agente
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Bot className="mr-2 h-4 w-4" />
              IA
            </TabsTrigger>
            <TabsTrigger value="department">
              <Building2 className="mr-2 h-4 w-4" />
              Departamento
            </TabsTrigger>
          </TabsList>

          {/* Agent Transfer */}
          <TabsContent value="agent" className="space-y-3 mt-4">
            <Label>Selecciona un agente</Label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un agente" />
              </SelectTrigger>
              <SelectContent>
                {mockAgents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <span>{agent.name}</span>
                      <span
                        className={`text-xs ${agent.status === "available" ? "text-green-600" : "text-orange-600"}`}
                      >
                        ({agent.status === "available" ? "Disponible" : "Ocupado"})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>

          {/* AI Transfer */}
          <TabsContent value="ai" className="space-y-3 mt-4">
            <Label>Selecciona un agente IA</Label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un agente IA" />
              </SelectTrigger>
              <SelectContent>
                {mockAIAgents.map((ai) => (
                  <SelectItem key={ai.id} value={ai.id}>
                    <div className="flex flex-col items-start">
                      <span>{ai.name}</span>
                      <span className="text-xs text-muted-foreground">{ai.speciality}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>

          {/* Department Transfer */}
          <TabsContent value="department" className="space-y-3 mt-4">
            <Label>Selecciona un departamento</Label>
            <Select value={selectedTarget} onValueChange={setSelectedTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un departamento" />
              </SelectTrigger>
              <SelectContent>
                {mockDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    <div className="flex items-center gap-2">
                      <span>{dept.name}</span>
                      <span className="text-xs text-muted-foreground">({dept.agents} agentes)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isTransferring}>
            Cancelar
          </Button>
          <Button onClick={handleTransfer} disabled={isTransferring}>
            {isTransferring ? "Transfiriendo..." : "Transferir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
