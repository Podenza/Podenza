'use client';

import * as React from 'react';

import * as LabelPrimitive from '@radix-ui/react-label';
// Temporary type definition for VariantProps
type VariantProps<T> = {};

// Temporary cva implementation
const cva = (base: string, config?: any) => {
  return () => base;
};

import { cn } from '../lib/utils';

const labelVariants = cva(
  'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label: React.FC<
  React.ComponentPropsWithRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
> = ({ className, ...props }) => (
  <LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />
);
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
