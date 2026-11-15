import * as React from 'react'
import { cn } from '../../lib/utils'
import { Separator } from './separator'

function ItemGroup({ className, ...props }) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn('group/item-group flex flex-col', className)}
      {...props}
    />
  )
}

function ItemSeparator({ className, ...props }) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn('my-0', className)}
      {...props}
    />
  )
}

function Item({ className, variant = 'default', size = 'default', ...props }) {
  const variantClass =
    variant === 'outline'
      ? 'border-border'
      : variant === 'muted'
        ? 'bg-muted/50'
        : 'bg-transparent'
  const sizeClass = size === 'sm' ? 'py-3 px-4 gap-2.5' : 'p-4 gap-4'
  return (
    <div
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(
        'group/item flex items-center border border-transparent text-sm rounded-md transition-colors flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        variantClass,
        sizeClass,
        className
      )}
      {...props}
    />
  )
}

function ItemMedia({ className, variant = 'default', ...props }) {
  const variantClass =
    variant === 'icon'
      ? "size-8 border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4"
      : variant === 'image'
        ? 'size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover'
        : 'bg-transparent'
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(
        'flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5',
        variantClass,
        className
      )}
      {...props}
    />
  )
}

function ItemContent({ className, ...props }) {
  return (
    <div
      data-slot="item-content"
      className={cn('flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none', className)}
      {...props}
    />
  )
}

function ItemTitle({ className, ...props }) {
  return (
    <div
      data-slot="item-title"
      className={cn('flex w-fit items-center gap-2 text-sm leading-snug font-medium', className)}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        'text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance',
        className
      )}
      {...props}
    />
  )
}

function ItemActions({ className, ...props }) {
  return (
    <div data-slot="item-actions" className={cn('flex items-center gap-2', className)} {...props} />
  )
}

function ItemHeader({ className, ...props }) {
  return (
    <div
      data-slot="item-header"
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }) {
  return (
    <div
      data-slot="item-footer"
      className={cn('flex basis-full items-center justify-between gap-2', className)}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}
