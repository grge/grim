function get_nearest(node, candidates, graph, exclude_node = true) {
  if (exclude_node) {
    candidates = [...candidates].filter((n) => n !== node)
  }

  if (candidates.length == 0) {
    return
  }

  // TODO: Can make this more efficient by pre-computing the distance
  var distance = function(n) {
    console.log(n, node)
    var a = graph.node(n)
    var b = graph.node(node)
    return Math.sqrt((a.x - b.x)^2 + (a.y - b.y)^2)
  }

  return candidates.sort((a, b) => distance(b) - distance(a)).pop()
}

function get_next_in_cycle(current, cycle) {
// TODO: Should add a way to parameterize or even globally set the order
// of the cycle. E.g. based on x-coordinate
  const index = cycle.indexOf(current)
  if (index == -1) {
    return cycle[0]
  }
  if (index == cycle.length - 1) {
    return cycle[0]
  }
  return cycle[index + 1]
}

function get_next_in_direction(node, candidates, graph, direction) {
  const c = [...candidates]
  var ordered_candidates = [];

  if (direction == 'left') {
    ordered_candidates = c.sort((a, b) => graph.node(a).x - graph.node(b).x).reverse()
  }
  else if (direction == 'right') {
    ordered_candidates = c.sort((a, b) => graph.node(a).x - graph.node(b).x)
  }
  else if (direction == 'up') {
    ordered_candidates = c.sort((a, b) => graph.node(b).y - graph.node(a).y).reverse()
  }
  else if (direction == 'down') {
    ordered_candidates = c.sort((a, b) => graph.node(a).y - graph.node(b).y)
  }
  else {
    throw 'Invalid direction'
  }
  const node_index = ordered_candidates.indexOf(node)

  if (node_index == -1) {
    throw 'Node not in candidates'
  }
  if (node_index == ordered_candidates.length - 1) {
    return node
  }
  return ordered_candidates[node_index + 1]
}

function union_map(nodes, edges, graph, node_map, edge_map) {
  // node_map and edge_map are functions that take a node/edge and return a
  // set of nodes and a set of edges. 
  var pairs_a = [...nodes].map(node_map)
  var pairs_b = [...edges].map(edge_map)

  // combine to get a single list where each entry is a tuple (nodes, edges)
  var pairs = pairs_a.concat(pairs_b)
  
  // now reduce to a single tuple (nodes, edges), which is the union of all
  // the nodes and edges in the pairs
  var zip_set_union = ([a1, b1], [a2, b2]) => {
    return [a1.union(a2), b1.union(b2)]
  }

  return pairs.reduce(zip_set_union, [new Set(), new Set()])
  
}

function null_map(element, graph) {
  return [new Set(), new Set()]
}

function siblings(node, graph) {
  const preds = graph.predecessors(node)
  if (! preds) {
    return [new Set(), new Set()]
  }
  return [new Set(preds.map((p) => graph.successors(p)).flat()), new Set()]
}

function sel_nearest_successor(nodes, edges, graph) {
  return union_map(nodes, edges, graph, (node) => {
    const succs = graph.successors(node)
    if (succs.length == 0) {
      return [new Set([node]), new Set()]
    }
    const nearest = get_nearest(node, succs, graph)
    return [new Set([nearest]), new Set()]
  }, null_map)
}

function sel_nearest_predecessor(nodes, edges, graph) {
  return union_map(nodes, edges, graph, (node) => {
    const preds = graph.predecessors(node)
    if (preds.length == 0) {
      return [new Set([node]), new Set()]
    }
    const nearest = get_nearest(node, preds, graph)
    return [new Set([nearest]), new Set()]
  }, null_map)
}

function sel_next_sibling(nodes, edges, graph, direction) {
  return union_map(nodes, edges, graph, (node) => {
    const [sib_nodes, edges] = siblings(node, graph)
    const nearest = get_next_in_direction(node, sib_nodes, graph, direction)
    return [new Set([nearest]), new Set()]
  }, null_map)
}

function sel_all_successors(nodes, edges, graph) {
  var [new_nodes, new_edges] = union_map(nodes, edges, graph, (node) => {
    return [new Set(graph.successors(node)), new Set()]
  }, null_map)

  if (new_nodes.size == 0) {
    return [nodes, new_edges]
  }

  return [new_nodes, new_edges]
}

function sel_all_predecessors(nodes, edges, graph) {
  var [new_nodes, new_edges] = union_map(nodes, edges, graph, (node) => {
    return [ new Set(graph.predecessors(node)), new Set()]
  }, null_map)

  if (new_nodes.size == 0) {
    return [nodes, new_edges]
  }

  return [new_nodes, new_edges]
}

function sel_all_siblings(nodes, edges, graph) {
  return union_map(nodes, edges, graph, (node) => {
    return siblings(node, graph)
  }, null_map)
}

function sel_sinks(nodes, edges, graph) {
  return [graph.sinks(), new Set()]
}

function sel_sources(nodes, edges, graph) {
  return [graph.sources(), new Set()]
}

function sel_cycle_sinks(nodes, edges, graph) {
  if (graph.sinks().length == 0) {
    return [new Set(), new Set()]
  }
  if (nodes.size == 0) {
    return [new Set(graph.sinks()[0]), new Set()]
  }
  return union_map(nodes, edges, graph, (node) => {
    const sinks = graph.sinks()
    const next_sink = get_next_in_cycle(node, sinks)
    return [new Set([next_sink]), new Set()]
  }, null_map)
}

function sel_cycle_sources(nodes, edges, graph) {
  if (graph.sources().length == 0) {
    return [new Set(), new Set()]
  }
  if (nodes.size == 0) {
    return [new Set(graph.sources()[0]), new Set()]
  }
  return union_map(nodes, edges, graph, (node) => {
    const sinks = graph.sources()
    const next_sink = get_next_in_cycle(node, sinks)
    return [new Set([next_sink]), new Set()]
  }, null_map)

}

function sel_in_edges(nodes, edges, graph) {
  return union_map(nodes, edges, graph, 
    (node) => {
      return [new Set(), new Set(graph.inEdges(node))]
    }, 
    (edge) => {
      return [new Set(), new Set(graph.inEdges(edge.w))]
    }
  )
}

function cycle_in_edges(nodes, edges, graph) {
  return union_map(nodes, edges, graph, 
    (node) => {
      const in_nodes = graph.predecessors(node)
      if (in_nodes.length == 0) {
        return [new Set(), new Set()]
      }
      return [new Set(), new Set([{v: in_nodes[0], w: node}])];
    },
    (edge) => {
      const in_nodes = graph.predecessors(edge.w)
      const next_in_node  = get_next_in_cycle(edge.v, in_nodes)
      return [new Set(), new Set([{v: next_in_node, w: edge.w}])]
    }
  )
}

function sel_out_edges(nodes, edges, graph) {
  return union_map(nodes, edges, graph, 
    (node) => {
      return [new Set(), new Set(graph.outEdges(node))]
    }, 
    (edge) => {
      return [new Set(), new Set(graph.outEdges(edge.v))]
    }
  )
}


function cycle_out_edges(nodes, edges, graph) {
  return union_map(nodes, edges, graph, 
    (node) => {
      const out_nodes = graph.successors(node)
      if (out_nodes.length == 0) {
        return [new Set(), new Set()]
      }
      return [new Set(), new Set([{v: node, w: out_nodes[0]}])];
    },
    (edge) => {
      const out_nodes = graph.successors(edge.v)
      const next_out_node  = get_next_in_cycle(edge.w, out_nodes)
      return [new Set(), new Set([{v: edge.v, w: next_out_node}])]
    }
  )
}

// CLUSTER NAVIGATION

function select_parent_node(nodes, edges, graph) {
  return union_map(nodes, edges, graph, (node) => {
    const parent = graph.parent(node)
    if (! parent) {
      return [new Set([node]), new Set()]
    }
    return [new Set([parent]), new Set()]
  }, null_map)
}


function select_all_children(nodes, edges, graph) {
  return union_map(nodes, edges, graph, (node) => {
    const children = graph.children(node)
    if (children.length == 0) {
      return [new Set([node]), new Set()]
    }
    return [new Set(children), new Set()]
  }, null_map)
}

function select_first_child(nodes, edges, graph) {
  return union_map(nodes, edges, graph, (node) => {
    const children = graph.children(node)
    if (children.length == 0) {
      return [new Set([node]), new Set()]
    }
    // TODO: Use a nearest map instead of [0]
    const nearest = get_nearest(node, children, graph)
    return [new Set([nearest]), new Set()]
  }, null_map)
}

function cycle_in_cluster(nodes, edges, graph) {
  return union_map(nodes, edges, graph, (node) => {
    const parent = graph.parent(node);
    if (! parent) {
      // TODO: Better behvious would be cycle among all top level nodes
      return [new Set(), new Set()]
    }

    const children = graph.children(parent)
    const next_child = get_next_in_cycle(node, children)
    return [new Set([next_child]), new Set()]
  }, null_map)
}



// Other navigation actions
// * Select entire connected component
// * Select entire cycle
// * Select all
// * Select connected subgraph (e.g. all edges that are reachable from the selected nodes)
// * Cycle connected components
// * Deselect all nodes in selection
// * Deletect all edges in selection

var nav_actions_dict = {
  'FirstSuccessor': sel_nearest_successor,
  'FirstPredecessor': sel_nearest_predecessor,
  'AllSuccessors': sel_all_successors,
  'AllPredecessors': sel_all_predecessors,
  'AllSiblings': sel_all_siblings,
  'NextSiblingLeft': (n, e, g) => { return sel_next_sibling(n, e, g, 'left') },
  'NextSiblingRight': (n, e, g) => { return sel_next_sibling(n, e, g, 'right') },
  'Sources': sel_sources,
  'Sinks': sel_sinks,
  'CycleSources': sel_cycle_sources,
  'CycleSinks': sel_cycle_sinks,
  'InEdges': sel_in_edges,
  'CycleInEdges': cycle_in_edges,
  'OutEdges': sel_out_edges,
  'CycleOutEdges': cycle_out_edges,
  'Parent': select_parent_node,
  'AllChildren': select_all_children,
  'FirstChild': select_first_child,
  'CycleInCluster': cycle_in_cluster,
}


export const NavActions = Object.fromEntries(Object.entries(nav_actions_dict).map(
  ([name, f]) => {
    var new_f = (state) => {
      var [nodes, edges] = f(state.selectedNodes, state.selectedEdges, state.graph)
      if (state.mode == 'normal') {
        state.setSelectedNodes(nodes)
        state.setSelectedEdges(edges)
      } else if (state.mode == 'add') {
        state.setSelectedNodes(nodes.union(state.selectedNodes))
        state.setSelectedEdges(edges.union(state.selectedEdges))
      }
    }

    return [name, new_f]
  }
));
