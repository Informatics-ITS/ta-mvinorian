import * as d3 from 'd3';
import { AnimatePresence, motion, Variants } from 'motion/react';
import React from 'react';

import { useElementDimensions } from '@/hook/use-element-dimensions';
import { useForwardedRef } from '@/hook/use-forwarded-ref';
import { getGameNodeById, getGameNodePlayerById } from '@/lib/game-topology';
import { cn } from '@/lib/utils';
import { GamePlayerPhase, useGameStateContext } from '@/provider/game-state-provider';

import { Button } from '../ui/button';
import { GameNode } from './node';

export interface GameBoardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const GameBoard = React.forwardRef<HTMLDivElement, GameBoardProps>(({ className, ...props }, ref) => {
  const { role, playerPhase, getGameTopology, getGamePlayerNodes, checkIsNodeTargetable, clickNode, clickTargetNode } =
    useGameStateContext();
  const topology = getGameTopology();
  const playerNodes = getGamePlayerNodes();

  const zoomRef = React.useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const zoomStateRef = React.useRef<d3.ZoomTransform | null>(null);
  const hasInitializedZoom = React.useRef(false);

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
              .attr('fill-opacity', 0.1),
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

      zoomStateRef.current = e.transform;
    },
    [grid, scaleX, scaleY],
  );

  React.useEffect(() => {
    if (!svgRef.current || !width || !height) return;

    const svgTopLeft: [number, number] = [-width, -height];
    const svgBottomRight: [number, number] = [2 * width, 2 * height];

    if (!zoomRef.current) {
      zoomRef.current = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 5])
        .translateExtent([svgTopLeft, svgBottomRight])
        .on('zoom', zoomed);
    } else zoomRef.current.translateExtent([svgTopLeft, svgBottomRight]);

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
    svg.call(zoomRef.current);

    return () => {
      if (zoomRef.current) svg.on('.zoom', null);
    };
  }, [zoomed, width, height]);

  React.useEffect(() => {
    if (!svgRef.current || !zoomRef.current || !width || !height || !topology) return;

    const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);

    if (!hasInitializedZoom.current) {
      const initialTransform =
        zoomStateRef.current ?? d3.zoomIdentity.scale(0.5).translate(width / 2 - 80, height / 2 - 250);

      svg.call(zoomRef.current.transform, initialTransform);
      zoomStateRef.current = initialTransform;
      hasInitializedZoom.current = true;
    }

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
  }, [topology, grid, scaleX, scaleY, width, height]);

  const nodeAnimation: Variants = {
    initial: {
      border: '8px solid transparent',
      opacity: 0,
      borderRadius: '1.5rem',
    },
    pulse: {
      border: '8px solid #cce6ff',
      opacity: [1, 0.2, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'linear' },
    },
    hover: {
      border: '8px solid #ebebeb',
      opacity: 1,
      transition: { duration: 0.2 },
    },
    active: {
      border: '8px solid #c9c9c9',
      opacity: 1,
      transition: { duration: 0.2 },
    },
  };

  const handleCheckIsNodeTargetable = (nodeId: string) => {
    if (playerPhase !== GamePlayerPhase.SelectNode) return false;
    return checkIsNodeTargetable(nodeId);
  };

  return (
    <div
      data-tour='game-board'
      ref={innerRef}
      className={cn('bg-background-200 relative h-full w-full overflow-clip', className)}
      {...props}
    >
      {topology && role && (
        <svg ref={svgRef} width={width} height={height} className='h-full w-full'>
          <g id='grid' className='grid'></g>

          {topology.links.map((link) => {
            const sourceNode = getGameNodeById(link.source);
            const targetNode = getGameNodeById(link.target);

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

          {topology.nodes.map((topologyNode) => {
            const playerNode = getGameNodePlayerById(playerNodes, topologyNode.id);
            const gameNode = getGameNodeById(topologyNode.id);
            if (!gameNode || !playerNode) return null;

            return (
              <foreignObject
                id={gameNode.id}
                key={gameNode.id}
                width={210}
                height={290}
                x={gameNode.x + width / 4}
                y={gameNode.y + height / 8}
                className={cn('node flex items-center justify-center overflow-visible', gameNode.id)}
              >
                <GameNode node={topologyNode} role={role!} className='relative z-0' />
                <AnimatePresence>
                  {playerNode.selected && handleCheckIsNodeTargetable(playerNode.id) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute top-0 left-0 z-10 flex h-72 w-52 shrink-0 flex-col items-center overflow-clip rounded-xl'
                    >
                      <Button
                        size='lg'
                        variant='ghost'
                        onClick={() => clickTargetNode(playerNode.id)}
                        className='!text-label-20 hover:bg-background-100 hover:border-background-100 relative z-20 mt-[72px] border border-gray-400 text-gray-100'
                      >
                        Target Node
                      </Button>
                      <div
                        className='bg-gray-1000 absolute right-0 left-0 h-full w-full opacity-40'
                        onClick={() => clickNode(playerNode.id)}
                      ></div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.div
                  variants={nodeAnimation}
                  initial='initial'
                  animate={
                    handleCheckIsNodeTargetable(playerNode.id) ? 'pulse' : playerNode.selected ? 'active' : 'initial'
                  }
                  whileHover={!playerNode.selected ? 'hover' : 'active'}
                  onClick={() => clickNode(playerNode.id)}
                  className='absolute -top-5 -right-5 -bottom-5 -left-5 z-0 rounded-3xl'
                ></motion.div>
              </foreignObject>
            );
          })}
        </svg>
      )}
    </div>
  );
});
