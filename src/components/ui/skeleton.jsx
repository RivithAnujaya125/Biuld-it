import * as React from 'react'
import { cn } from '../../lib/utils'

function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse rounded-md bg-surfaceMuted border border-border/50', className)} {...props} />
}

export { Skeleton }
