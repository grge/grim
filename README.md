# grim

A visual graph editor for the browser.

## Architecture concepts

* *Graph* - This is a this wrapper around dagrejs/graphlib that emit events
  when the graph is mutated.

* *GraphRenderer* - This is responsible for actually drawing the graph, targetting
  SVG for now.

* *Actions* - These are the target of keybindings or other UI. They can be
  things like navigation (changing the selected node), view (zooming), or
  editing (adding a new child of the selected node). They are usually context
  dependent, e.g., depend on a selection, rather than global.

* *Commands* - These are part of the Command pattern, and are generally called
  from within actions, and they go on the undo/redo stack when called.

## Actions

Actions are the target of keybindings or other UI.

### Navigation

* cycle edges on source node
* cycle edges on target node
* select subgraph closure
* follow edges to source
* follow edges to target
* ~go to first descendent node~
* ~go to first ancestor node~
* go to node by id
* select parent subgraph cluster
* select all elements in subgraphs
* go to next sink node (cycle)
* go to next source node (cycle)
* ~go to next sibling node (cycle)~

### Editing

#### Attributes

* Edit the node label

#### Add

* ~add a child node~
* add a parent node
* add edges between selected nodes
* add a node along the selected edge
* add edge from selected node to node by id
* Make subgraph cluster from selected nodes
* fully connect selected nodes

#### Delete

* delete selected node or edge and detach edges
* delete selected node and replace edges with edges between neighbors
* collapse selected node (replace all nodes with a single node, and make edges consisten)
