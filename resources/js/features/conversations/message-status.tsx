import { type MessageStatus } from "@/types/conversation"
import { Check, CheckCheck, Clock, X } from "lucide-react"

interface MessageStatusProps {
  status: MessageStatus
}

export function MessageStatus({ status }: MessageStatusProps) {

  if (status === "pending") {
    return <Clock className="h-3 w-3 text-muted-foreground" />
  }

  if (status === "sent") {
    return <Check className="h-3 w-3 text-muted-foreground" />
  }

  if (status === "delivered") {
    return <CheckCheck className="h-3 w-3 text-muted-foreground" />
  }

  if (status === "read") {
    return <CheckCheck className="h-3 w-3 text-brand-green" />
  }

  if (status === "failed") {
    return <X className="h-3 w-3 text-red-500" />
  }

  return <Check className="h-3 w-3 text-brand-green" />
}
