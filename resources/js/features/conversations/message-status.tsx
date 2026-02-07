import { type MessageStatus } from "@/types/conversation"
import { Check, CheckCheck } from "lucide-react"

interface MessageStatusProps {
  status: MessageStatus
}

export function MessageStatus({ status }: MessageStatusProps) {
  if (status === "sent") {
    return <Check className="h-3 w-3 text-muted-foreground" />
  }

  if (status === "delivered") {
    return <CheckCheck className="h-3 w-3 text-muted-foreground" />
  }

  return <CheckCheck className="h-3 w-3 text-brand-green" />
}
