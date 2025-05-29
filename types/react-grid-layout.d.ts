declare module 'react-grid-layout' {
    import * as React from 'react';
  
    export interface Layout {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
      minW?: number;
      minH?: number;
      maxW?: number;
      maxH?: number;
      static?: boolean;
      isDraggable?: boolean;
      isResizable?: boolean;
    }
  
    export interface ResponsiveProps {
      className?: string;
      cols?: { [key: string]: number };
      rowHeight?: number;
      width?: number;
      layouts?: { [key: string]: Layout[] };
      isDraggable?: boolean;
      isResizable?: boolean;
      onLayoutChange?: (layout: Layout[]) => void;
    }
  
    export class Responsive extends React.Component<ResponsiveProps> {}
  
    export function WidthProvider(component: React.ComponentType<any>): React.ComponentType<any>;
  }