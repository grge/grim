
function randomId() {
  // needs to be a random valid id, so can't start with numbers.
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const len = 5;
  let id = '';
  for (let i = 0; i < len; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function addDescendent(state: AppState) {
  const selectedNodes = Array.from(state.selectedNodes);
  if (selectedNodes.length === 0) {
    return;
  }
  const newNodeId = randomId();
  state.graph.setNode(newNodeId, { label: newNodeId })
  for (let node of selectedNodes) { state.graph.setEdge(node, newNodeId, {});
  }
}

export function addPredecessor(state: AppState) {
  const selectedNodes = Array.from(state.selectedNodes);
  if (selectedNodes.length === 0) {
    return;
  }
  const newNodeId = randomId();
  state.graph.setNode(newNodeId, { label: newNodeId })
  for (let node of selectedNodes) {
    state.graph.setEdge(newNodeId, node, { });
  }
}

export function deleteSelection(state: AppState) {
  for (let edge of Array.from(state.selectedEdges)) {
    state.graph.removeEdge(edge.v, edge.w)
  }
  for (let node of Array.from(state.selectedNodes)) {
    state.graph.removeNode(node);
  }
  state.setSelectedNodes(new Set());
  state.setSelectedEdges(new Set());
}

export function addFreeNode(state: AppState) {
  const newNodeId = randomId();
  state.graph.setNode(newNodeId, { label: newNodeId });
}

export function addDescendents(state: AppState) {
  const selectedNodes = Array.from(state.selectedNodes);
  if (selectedNodes.length === 0) {
    return;
  }
  for (let node of selectedNodes) {
    const newNodeId = randomId();
    state.graph.setNode(newNodeId, { label: newNodeId })
    state.graph.setEdge(node, newNodeId, { });
  }
}

export function collapseSelection(state: AppState) {
  const selectedNodes = Array.from(state.selectedNodes);
  if (selectedNodes.length === 0) {
    return;
  }
  const newNodeId = randomId();
  state.graph.setNode(newNodeId, { label: newNodeId });
  for (let node of selectedNodes) {
    for (let edge of state.graph._graph.outEdges(node)) {
      state.graph.setEdge(newNodeId, edge.w, { });
    }
    for (let edge of state.graph._graph.inEdges(node)) {
      state.graph.setEdge(edge.v, newNodeId, { });
    }
    state.graph.removeNode(node);
  }
}

export function addPredecessors(state: AppState) {
  const selectedNodes = Array.from(state.selectedNodes);
  if (selectedNodes.length === 0) {
    return;
  }
  for (let node of selectedNodes) {
    const newNodeId = randomId();
    state.graph.setNode(newNodeId, { label: newNodeId })
    state.graph.setEdge(newNodeId, node, { });
  }
}


// CLUSTER ACTIONS

export function addParent(state: AppState) {
  const selectedNodes = Array.from(state.selectedNodes);
  if (selectedNodes.length === 0) {
    return;
  }
  const newNodeId = randomId();
  state.graph.setNode(newNodeId, { label: newNodeId });
  for (let node of selectedNodes) {
    state.graph.setParent(node, newNodeId)
  }
}

export function addChild(state: AppState) {
  const selectedNodes = Array.from(state.selectedNodes);
  if (selectedNodes.length === 0) {
    return;
  }
  for (let node of selectedNodes) {
    const newNodeId = randomId();
    state.graph.setNode(newNodeId, { label: newNodeId });
    state.graph.setParent(newNodeId, node)
  }
}


// FROZEN SLECTION

export function freezeSelection(state: AppState) {
  state.setFrozenNodes(state.frozenNodes.union(state.selectedNodes))
  state.setFrozenEdges(state.frozenEdges.union(state.selectedEdges))
  state.setSelectedNodes(new Set())
  state.setSelectedEdges(new Set())
}

export function unfreezeSelection(state: AppState) {
  state.setSelectedNodes(state.selectedNodes.union(state.frozenNodes))
  state.setSelectedEdges(state.selectedEdges.union(state.frozenEdges))
  state.setFrozenNodes(new Set())
  state.setFrozenEdges(new Set())
}

export function edgeFromFrozen(state: AppState) {
  const vs = state.frozenNodes;
  const ws = state.selectedNodes;
  if (ws.size == 0) {
    return
  }
  if (vs.size == 0) {
    return
  }
  for (let w of ws) {
    for (let v of vs) {
      state.graph.setEdge(v, w, {})
    }
  }
  unfreezeSelection(state)
}


// Other Actions
// * Delete selected nodes and reconnect incoming and outgoing edges
// * Add a new node along each selected edge


// Cluster actions
// * Choose a node as the parent of the selected node (using the node select mode)
// * Choose a node as the parent of the selected node (using the node pallette)
// * Reset the parent of the selected (i.e., set to null)

