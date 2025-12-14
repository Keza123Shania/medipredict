import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, icon, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {icon && <div className="text-emerald-600">{icon}</div>}
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
          </div>
          {description && <p className="text-lg text-slate-600 max-w-3xl">{description}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  )
}
