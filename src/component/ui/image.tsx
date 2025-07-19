import NextImage from 'next/image';
import React from 'react';

export const Image = React.forwardRef<React.ComponentRef<typeof NextImage>, React.ComponentProps<typeof NextImage>>(
  ({ src, ...props }, ref) => {
    return (
      <NextImage
        ref={ref}
        src={`${process.env.NEXT_PUBLIC_APP_URL}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${src}`}
        {...props}
      />
    );
  },
);
