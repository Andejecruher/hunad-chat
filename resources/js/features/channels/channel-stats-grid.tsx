"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Channel } from '@/types';
import { motion } from "framer-motion";
import { Activity, MessageCircle, TrendingUp, Users } from "lucide-react";

interface StatsGridProps {
    channels: Channel[]
}

export function ChannelStatsGrid({ channels }: StatsGridProps) {
    const stats = [
        {
            icon: MessageCircle,
            title: "Mensajes Totales",
            value: 0,
            trend: "+12%",
            color: "text-blue-500",
        },
        {
            icon: Activity,
            title: "Canales Activos",
            value: channels?.filter((c) => c.status === "active").length,
            trend: `de ${channels?.length}`,
            color: "text-green-500",
        },
        {
            icon: TrendingUp,
            title: "Satisfacción Promedio",
            value: "92%",
            trend: "+3%",
            color: "text-purple-500",
        },
        {
            icon: Users,
            title: "Clientes Únicos",
            value: (channels?.length * 156).toLocaleString(),
            trend: "+8%",
            color: "text-orange-500",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.trend}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}
