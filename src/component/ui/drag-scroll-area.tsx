'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { motion } from 'motion/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface DragScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  dragClassName?: string;
  enableDrag?: boolean;
  dragConstraints?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

function DragScrollArea({
  className,
  children,
  dragClassName,
  enableDrag = true,
  dragConstraints = { left: 0, right: 0, top: 0, bottom: 0 },
  onDragStart,
  onDragEnd,
  ...props
}: DragScrollAreaProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrag = React.useCallback((event: any, info: any) => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;

      if (viewport) {
        viewport.scrollLeft -= info.delta.x;
        viewport.scrollTop -= info.delta.y;
      }
    }
  }, []);

  const handleDragStart = React.useCallback(() => {
    setIsDragging(true);
    onDragStart?.();
  }, [onDragStart]);

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

  return (
    <ScrollAreaPrimitive.Root
      ref={scrollRef}
      data-slot='drag-scroll-area'
      className={cn('relative', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot='drag-scroll-area-viewport'
        className='focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1'
      >
        {enableDrag ? (
          <motion.div
            className={cn('size-full', isDragging && 'select-none', dragClassName)}
            drag
            dragConstraints={dragConstraints}
            dragElastic={0}
            dragMomentum={false}
            onDrag={handleDrag}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            data-slot='drag-container'
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </ScrollAreaPrimitive.Viewport>
      <DragScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function DragScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot='drag-scroll-area-scrollbar'
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot='drag-scroll-area-thumb'
        className='bg-border relative flex-1 rounded-full'
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { DragScrollArea, DragScrollBar };
