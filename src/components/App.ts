import { AppState } from '../state/AppState';
import { KeyBindingManager } from '../keybindings/KeyBindingManager';

import { NavActions } from '../actions/navigation';

import {
  addDescendent,
  addPredecessor,
  addDescendents,
  addPredecessors,
  addParent,
  deleteSelection,
  collapseSelection,
  freezeSelection,
  unfreezeSelection,
  edgeFromFrozen
} from '../actions/editing';

import 'dagre';
import * as dagreD3 from 'dagre-d3';
import * as d3 from 'd3';


export class App {
  private state: AppState;
  private keyBindingManager: KeyBindingManager;
  private container: HTMLElement | null = null;
  private svg: SVGElement | null = null;

  constructor(container : HTMLElement) {
    this.state = new AppState();
    this.keyBindingManager = new KeyBindingManager();
    this.container = container;

    this.svg = d3.select(container).append('svg');
    const inner = this.svg.append('g');
    this.zoom = d3.zoom().on("zoom", function() {
      inner.attr("transform", d3.event.transform);
    });

    this.svg.call(this.zoom);

    const bindings = getBindings()

    for (let key in bindings) {
      this.keyBindingManager.register(key, () => bindings[key](this.state))
    }

    this.state.graph.addEventListener('graphUpdated', (event : Event) => {
      this.render();
    })

    this.state.addEventListener('setFrozenNodes', (event : CustomEvent) => {
      this.svg.selectAll('g').classed('frozen', false);
      this.svg.selectAll('g').classed('frozen', false);

      for (let node of event.target.frozenNodes) {
        var query = `g#${node}`;
        var node_el = this.svg.select(query);
        node_el.classed('frozen', true);
      }
    });

    this.state.addEventListener('setSelectedNodes', (event : CustomEvent) => {
      this.svg.selectAll('g').classed('selected', false);
      this.svg.selectAll('g').classed('selected', false);

      for (let node of event.target.selectedNodes) {
        var query = `g#${node}`;
        var node_el = this.svg.select(query);
        node_el.classed('selected', true);
      }
    });

    this.state.addEventListener('setSelectedEdges', (event : CustomEvent) => {
      console.log(event.target)
      this.svg.selectAll('g.edgePath').classed('selected', false);
      for (let edge of event.target.selectedEdges) {
        var query = `g.edgePath#${edge.v}_${edge.w}`;
        var edge_el = this.svg.select(query);
        edge_el.classed('selected', true);
      }
    })
  }

  render() {
    var render = new dagreD3.render();
    var g = this.state.graph._graph
    for (let node of g.nodes()) {
      g.setNode(node, { id: node, label: g.node(node).label });
    }
    for (let edge of g.edges()) {
      g.setEdge(edge.v, edge.w, { id: `${edge.v}_${edge.w}`, label: g.edge(edge).label });
      }
    // TODO: Do the layout in a worker thread, set up support for future "incremental" layouts
    g.graph().transition = function(selection) {
      return selection.transition().duration(500);
    }
    
    const inner = this.svg.select('g');
    render(inner, g);

    // give containier enough height
    this.svg.attr('height', this.state.graph._graph.graph().height + 40);

  }
}

function getBindings() {
  return {
    'j': NavActions['FirstSuccessor'],
    'J': NavActions['AllSuccessors'],
    'k': NavActions['FirstPredecessor'],
    'K': NavActions['AllPredecessors'],
    'l': NavActions['NextSiblingRight'],
    'L': NavActions['AllSiblings'],
    'h': NavActions['NextSiblingLeft'],
    'H': NavActions['AllSiblings'],
    'i': NavActions['CycleSources'],
    'I': NavActions['Sources'],
    'b': NavActions['CycleSinks'],
    'B': NavActions['Sinks'],
    'b': NavActions['CycleSinks'],
    'B': NavActions['Sinks'],
    'U': NavActions['InEdges'],
    'u': NavActions['CycleInEdges'],
    'V': NavActions['OutEdges'],
    'v': NavActions['CycleOutEdges'],
    'a': addDescendent,
    'A': addPredecessor,
    's': addDescendents,
    'S': addPredecessors,
    'x': deleteSelection,
    'c': collapseSelection,
    'f': freezeSelection,
    'F': unfreezeSelection,
    'e': edgeFromFrozen,
    'o': NavActions['Parent'],
    'm': NavActions['FirstChild'],
    'M': NavActions['AllChildren'],
    'p': addParent,
    'z': (state) => state.setMode('add'),
    'Escape': (state) => state.setMode('normal'),
  }
}

