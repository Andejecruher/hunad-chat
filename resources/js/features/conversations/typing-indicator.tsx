"use client"

import { motion } from "framer-motion"

export function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{name} está escribiendo</span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
            animate={{
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    </div>
  )
}
