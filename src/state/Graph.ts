import { Graph as Graphlib } from 'graphlib';


// TODO: Maybe this should event should include a graph diff instead of the full graph,
// that would make it easier to do incremental layout updates, for example.


export class Graph extends EventTarget {
  // This is a simple wrapper around the graphlib library. It provides a simple
  // API for basic manipulations, and emits events when the structure of the graph
  // is changed. This allows other parts of the app to react in a decoupled way.
  // 
  // Of course, you can manipulate the graphlib object directly if you want to,
  // in which case the events won't be emitted, so you might forget to update
  // the rendering, etc. But you are a grown-up and I trust that you can handle that.
  private _graph: Graphlib;

  private emitGraphUpdated() {
    clearTimeout(this.updateTimeout);  // Clear any previous scheduled updates

    // Schedule the update to happen after a short delay
    this.updateTimeout = setTimeout(() => {
      this.dispatchEvent(new CustomEvent('graphUpdated', {
        detail: {
          nodes: this.nodes(),
          edges: this.edges(),
        }
      }));
    }, 50);  // Delay of 50ms to debounce rapid updates
  }

  constructor(options? : GraphOptions) {
    super();
    this._graph = new Graphlib(options);
  }

  setDefaultNodeLabel(label: any): Graph;
  setDefaultNodeLabel(labelFn: (v: string) => any): Graph;
  setDefaultNodeLabel(arg1: any): Graph {
    this._graph.setDefaultNodeLabel(arg1);
    return this;
  }

  setNode(node: string, label?: any) : Graph {
    this._graph.setNode(node, label);
    this.dispatchEvent(new CustomEvent('setNode', {node: node, label: label}));
    this.emitGraphUpdated();
    return this;
  }

  setNodes(nodes: string[], label?: any): Graph {
    this._graph.setNodes(nodes, label);
    this.dispatchEvent(new CustomEvent('setNodes', {nodes: nodes, label: label}));
    this.emitGraphUpdated();
    return this;
  }

  setParent(v: string, p?: string): Graph {
    this._graph.setParent(v, p);
    this.dispatchEvent(new CustomEvent('setParent', {v: v, p: p}));
    this.emitGraphUpdated();
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  parent(v: string): string | void {
    return this._graph.parent(v);
  }

  children(v?: string): string[] {
    return this._graph.children(v);
  }

  filterNodes(filter: (v: string) => boolean): Graph {
    // May need to reconsider this. Does filterNodes mutate the original graph?
    this._graph = this._graph.filterNodes(filter);
    this.dispatchEvent(new CustomEvent('filterNodes', {filter: filter}));
    this.emitGraphUpdated();
    return this;
  }

  setDefaultEdgelabel(label: any): Graph;
  setDefaultEdgeLabel(labelFn: (v: string) => any): Graph;
  setDefaultEdgeLabel(arg1: any): Graph {
    this._graph.setDefaultEdgeLabel(arg1);
    return this;
  }

  setPath(nodes: string[], label?: any): Graph {
    this._graph.setPath(nodes, label);
    this.dispatchEvent(new CustomEvent('setPath', {nodes: nodes, label: label}));
    this.emitGraphUpdated();
    return this;
  }

  hasNode(name: string): boolean {
    return this._graph.hasNode(name);
  }

  removeNode(name: string): Graph {
    this._graph.removeNode(name); this.dispatchEvent(new CustomEvent('removeNode', {name: name}));
    this.emitGraphUpdated();
    return this;
  }
  
  nodes(): string[] {
    return this._graph.nodes();
  }

  node(name: string): any {
    return this._graph.node(name);
  }

  setEdge(edge: Edge, label?: any): Graph;
  setEdge(v: string, w: string, label?: any, name?: string): Graph;
  setEdge(arg1: string, arg2?: string, arg3?: any, arg4?: string): Graph {
    this._graph.setEdge(arg1, arg2, arg3, arg4);
    this.dispatchEvent(new CustomEvent('setEdge', [arg1, arg2, arg3, arg4]));
    this.emitGraphUpdated();
    return this;
  }

  edges(): Edge[] {
    return this._graph.edges();
  }

  
  edge(e: Edge): any;
  edge(v: string, w: string, name?: string): any;
  edge(arg1: any, arg2?: any, arg3?: any): any {
    return this._graph.edge(arg1, arg2, arg3);
  }

  hasEdge(edge: Edge): boolean;
  hasEdge(v: string, w: string, name?: string): boolean;
  hasEdge(arg1: any, arg2?: any, arg3?: any): boolean {
    return this._graph.hasEdge(arg1, arg2, arg3);
  }

  removeEdge(edge: Edge): Graph;
  removeEdge(v: string, w: string, name?: string): Graph;
  removeEdge(arg1: any, arg2?: any, arg3?: any): Graph { 
    this._graph.removeEdge(arg1, arg2, arg3);
    this.dispatchEvent(new CustomEvent('removeEdge', [arg1, arg2, arg3]))
    this.emitGraphUpdated();
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  inEdges(v: string, w?: string): void | Edge[] {
    return this._graph.inEdges(v, w);
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  outEdges(v: string, w?: string): void | Edge[] {
    return this._graph.outEdges(v, w);
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  nodeEdges(v: string, w?: string): void | Edge[] {
    return this._graph.nodeEdges(v, w);
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  predecessors(v: string): void | string[] {
    return this._graph.predecessors(v);
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  successors(v: string): void | string[] {
    return this._graph.successors(v);
  }

  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  neighbors(v: string): void | string[] {
    return this._graph.neighbors(v);
  }

  isDirected(): boolean {
    return this._graph.isDirected();
  }

  isMultigraph(): boolean {
    return this._graph.isMultigraph();
  }

  isCompound(): boolean {
    return this._graph.isCompond();
  }

  setGraph(label: any): Graph {
    this._graph.setGraph(label);
    this.dispatchEvent(new CustomEvent('setGraph', {label: label}));
    this.emitGraphUpdated();
    return this;
  }

  graph(): any {
    return this._graph.graph();
  }

  nodeCount(): number {
    return this._graph.nodeCount();
  }

  edgeCount(): number {
    return this._graph.edgeCount();
  }

  sources(): string[] {
    return this._graph.sources();
  }

  sinks(): string[] {
    return this._graph.sinks();
  }
}

