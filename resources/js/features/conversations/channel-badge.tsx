import { Badge } from "@/components/ui/badge"
import { Facebook, Instagram, MessageCircle, Send } from "lucide-react"

interface ChannelBadgeProps {
  channel: "whatsapp" | "instagram" | "facebook" | "telegram"
  size?: "sm" | "md"
}

export function ChannelBadge({ channel, size = "md" }: ChannelBadgeProps) {
  const config = {
    whatsapp: {
      icon: MessageCircle,
      label: "WhatsApp",
      className: "bg-green-500 hover:bg-green-600 text-white",
    },
    instagram: {
      icon: Instagram,
      label: "Instagram",
      className: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white",
    },
    facebook: {
      icon: Facebook,
      label: "Facebook",
      className: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    telegram: {
      icon: Send,
      label: "Telegram",
      className: "bg-sky-500 hover:bg-sky-600 text-white",
    },
  }

  const { icon: Icon, label, className } = config[channel]
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  return (
    <Badge className={className}>
      <Icon className={`${iconSize} mr-1`} />
      {label}
    </Badge>
  )
}
