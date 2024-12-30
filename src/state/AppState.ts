
import { Graph } from './Graph';

export class AppState extends EventTarget {
  public graph: Graph;

  public selectedNodes: Set<string> = new Set();
  public selectedEdges: Set<Edge> = new Set();
  public frozenNodes: Set<string> = new Set();
  public frozenEdges: Set<Edge> = new Set();
  public mode: string = 'normal';

  constructor() {
    super();

    this.graph = new Graph({ directed: true, compound: true })
    this.graph.setDefaultEdgeLabel("")
    this.graph.setGraph({'label': 'Graph', 'rankdir': 'TB', 'ranker': 'network-simplex' })
    this.graph._graph.setNode('a', { label: 'A' });
    this.graph._graph.setNode('b', { label: 'B' });
    this.graph._graph.setNode('c', { label: 'C' });
    this.graph._graph.setEdge('a', 'b')
    this.graph._graph.setEdge('b', 'c')
    this.graph._graph.setEdge('a', 'c')

    // TODO: Probably need to modify dagre-d3 to set id attributes automatically.
    for (let node of this.graph._graph.nodes()) {
      this.graph._graph.setNode(node, { id: node, label: this.graph._graph.node(node).label });
    }
  }

  setFrozenNodes(nodes: List<string>) {
    this.frozenNodes = new Set(nodes);
    this.dispatchEvent(new CustomEvent('setFrozenNodes', {nodes: this.frozenNodes}));
  }

  setFrozenEdges(edges: List<Edge>) {
    this.frozenEdges = new Set(edges);
    this.dispatchEvent(new CustomEvent('setFrozenEdges', {nodes: this.frozenEdges}));
  }

  setSelectedNodes(nodes: List<string>) {
    this.selectedNodes = new Set(nodes)
    this.dispatchEvent(new CustomEvent('setSelectedNodes', {nodes: this.selectedNodes}));
  }

  setSelectedEdges(edges: List<Edge>) {
    this.selectedEdges = new Set(edges)
    this.dispatchEvent(new CustomEvent('setSelectedEdges', {edges: this.selectedEdges}));
  }

  setMode(mode: string) {
    this.mode = mode;
    this.dispatchEvent(new CustomEvent('setMode', {mode: this.mode}));
  }
}
