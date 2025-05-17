import * as d3 from 'd3';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { useForwardedRef } from '@/hook/use-forwarded-ref';
import { TopologyNodeType } from '@/lib/topology';
import { cn } from '@/lib/utils';
import { GameEngineType } from '@/provider/game-engine-provider';

import { GameNode } from './game-node';

export interface GameBoardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  topology: GameEngineType['topology'];
  role: GameEngineType['role'];
}

export const GameBoard = React.forwardRef<HTMLDivElement, GameBoardProps>(
  ({ topology, role, children, className, ...props }, ref) => {
    const zoomRef = React.useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
    const zoomStateRef = React.useRef<d3.ZoomTransform | null>(null);

    const innerRef = useForwardedRef(ref);
    const { width, height } = useElementDimensions(innerRef);
    const ratio = height / width;
    const range = 12;
    const ticks = 24;

    const svgRef = React.useRef<SVGSVGElement>(null);

    const scaleX = React.useMemo(() => d3.scaleLinear().domain([-range, range]).range([0, width]), [width]);

    const scaleY = React.useMemo(
      () =>
        d3
          .scaleLinear()
          .domain([-range * ratio, range * ratio])
          .range([height, 0]),
      [ratio, height],
    );
    const grid = React.useCallback(
      (
        g: d3.Selection<d3.BaseType, unknown, null, undefined>,
        x: d3.ScaleLinear<number, number, never>,
        y: d3.ScaleLinear<number, number, never>,
      ) => {
        g.selectAll('*').remove();

        const yTicks = y.ticks(ticks * ratio);
        const xTicks = x.ticks(ticks);

        const gridPoints = [];
        for (const yTick of yTicks) {
          for (const xTick of xTicks) {
            gridPoints.push({ x: xTick, y: yTick });
          }
        }

        return g
          .attr('stroke', 'currentColor')
          .attr('stroke-opacity', 0.1)
          .selectAll('circle')
          .data(gridPoints)
          .join(
            (enter) =>
              enter
                .append('circle')
                .attr('cx', (d) => x(d.x))
                .attr('cy', (d) => y(d.y))
                .attr('r', 2)
                .attr('fill', 'currentColor')
                .attr('fill-opacity', 0.2),
            (update) => update.attr('cx', (d) => x(d.x)).attr('cy', (d) => y(d.y)),
            (exit) => exit.remove(),
          );
      },
      [ratio],
    );

    const zoomed = React.useCallback(
      (e: d3.D3ZoomEvent<SVGElement, unknown>) => {
        const zx = e.transform.rescaleX(scaleX).interpolate(d3.interpolateRound);
        const zy = e.transform.rescaleY(scaleY).interpolate(d3.interpolateRound);
        const g = d3.select(svgRef.current).select('.grid');
        const node = d3.select(svgRef.current).selectAll('.node');
        const link = d3.select(svgRef.current).selectAll('.link');

        g.call(grid, zx, zy);
        node.attr('transform', e.transform.toString());
        link.attr('transform', e.transform.toString());
      },
      [grid, scaleX, scaleY],
    );

    React.useEffect(() => {
      if (!svgRef.current || !width || !height) return;

      const svgTopLeft: [number, number] = [-width / 8, -height / 4];
      const svgBottomRight: [number, number] = [width + width / 2, (7 * height) / 4];

      if (!zoomRef.current) {
        zoomRef.current = d3
          .zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.5, 5])
          .translateExtent([svgTopLeft, svgBottomRight])
          .on('zoom', zoomed);
      } else zoomRef.current.translateExtent([svgTopLeft, svgBottomRight]);

      const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

      svg.call(zoomRef.current);

      if (zoomStateRef.current) svg.call(zoomRef.current.transform, zoomStateRef.current);
      else svg.call(zoomRef.current.transform, d3.zoomIdentity);

      return () => {
        if (zoomRef.current) svg.on('.zoom', null);
      };
    }, [zoomed, width, height]);

    React.useEffect(() => {
      if (!svgRef.current || !zoomRef.current) return;

      if (zoomStateRef.current) {
        const transform = zoomStateRef.current;
        const zx = transform.rescaleX(scaleX).interpolate(d3.interpolateRound);
        const zy = transform.rescaleY(scaleY).interpolate(d3.interpolateRound);

        const g = d3.select(svgRef.current).select('.grid');
        const node = d3.select(svgRef.current).selectAll('.node');
        const link = d3.select(svgRef.current).selectAll('.link');

        g.call(grid, zx, zy);
        node.attr('transform', transform.toString());
        link.attr('transform', transform.toString());
      }
    }, [topology, grid, scaleX, scaleY]);

    return (
      <div
        ref={innerRef}
        className={cn('bg-background-200 relative h-full w-full overflow-clip', className)}
        {...props}
      >
        {topology && (
          <svg ref={svgRef} width={width} height={height} className='h-full w-full'>
            <g id='grid' className='grid'></g>

            {topology.links.map((link) => {
              const sourceNode = getNodeById(link.source, topology.nodes);
              const targetNode = getNodeById(link.target, topology.nodes);

              if (!sourceNode || !targetNode) return null;

              return (
                <line
                  key={`${link.source}-${link.target}`}
                  x1={sourceNode.x + 210 / 2 + width / 4}
                  y1={sourceNode.y + 290 / 2 + height / 8}
                  x2={targetNode.x + 210 / 2 + width / 4}
                  y2={targetNode.y + 290 / 2 + height / 8}
                  className='link stroke-gray-500 stroke-[8px]'
                />
              );
            })}

            {topology.nodes.map((node) => {
              return (
                <foreignObject
                  id={node.id}
                  key={node.id}
                  width={210}
                  height={290}
                  x={node.x + width / 4}
                  y={node.y + height / 8}
                  className={cn('node flex items-center justify-center overflow-visible', node.id)}
                >
                  <GameNode node={node} role={role!} />
                </foreignObject>
              );
            })}
          </svg>
        )}
        {children}
      </div>
    );
  },
);

function getNodeById(id: string, nodes: TopologyNodeType[]) {
  return nodes.find((node) => node.id === id);
}
