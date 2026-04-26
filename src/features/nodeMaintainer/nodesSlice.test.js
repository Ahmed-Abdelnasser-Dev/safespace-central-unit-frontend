import { describe, expect, it } from 'vitest';
import reducer, { addLane, addNode } from './nodesSlice';

describe('nodesSlice road configuration reducers', () => {
  it('normalizes sparse nodes when they are added', () => {
    const state = reducer(undefined, {
      type: '@@INIT',
    });

    const nextState = reducer(state, addNode({
      id: 'node-1',
      name: 'Node 1',
    }));

    const node = nextState.nodes[0];

    expect(node.roadRules).toBeDefined();
    expect(Array.isArray(node.roadRules.lanes)).toBe(true);
    expect(node.roadRules.lanes).toHaveLength(0);
    expect(Array.isArray(node.lanePolygons)).toBe(true);
  });

  it('adds a lane even when roadRules lanes were missing on the node', () => {
    const state = reducer(undefined, {
      type: '@@INIT',
    });

    const sparseNodeState = reducer(state, addNode({
      id: 'node-1',
      name: 'Node 1',
      roadRules: {},
    }));

    const nextState = reducer(sparseNodeState, addLane({
      nodeId: 'node-1',
      lane: { id: 1, name: 'Lane 1', type: 'Custom Lane', status: 'open' },
    }));

    const node = nextState.nodes[0];

    expect(node.roadRules.lanes).toHaveLength(1);
    expect(node.roadRules.lanes[0]).toMatchObject({
      id: 1,
      name: 'Lane 1',
      status: 'open',
    });
    expect(node.lanePolygons).toHaveLength(1);
    expect(node.lanePolygons[0]).toMatchObject({
      laneNumber: 1,
      name: 'Lane 1',
      isEmpty: true,
    });
  });
});