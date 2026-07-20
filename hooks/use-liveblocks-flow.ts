"use client";

import { useStorage, useMutation } from "@liveblocks/react/suspense";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from "@xyflow/react";

export function useLiveblocksFlow({ suspense = true }: { suspense?: boolean } = {}) {
  const nodes = (useStorage((root) => root.nodes) as Node[]) || [];
  const edges = (useStorage((root) => root.edges) as Edge[]) || [];

  const onNodesChange: OnNodesChange = useMutation(({ storage }, changes) => {
    const currentNodes = (storage.get("nodes") as Node[]) || [];
    storage.set("nodes", applyNodeChanges(changes, currentNodes));
  }, []);

  const onEdgesChange: OnEdgesChange = useMutation(({ storage }, changes) => {
    const currentEdges = (storage.get("edges") as Edge[]) || [];
    storage.set("edges", applyEdgeChanges(changes, currentEdges));
  }, []);

  const onConnect: OnConnect = useMutation(({ storage }, connection) => {
    const currentEdges = (storage.get("edges") as Edge[]) || [];
    storage.set("edges", addEdge(connection, currentEdges));
  }, []);

  const onDelete = useMutation(
    ({ storage }, { nodes: nodesToDelete, edges: edgesToDelete }: { nodes?: Node[]; edges?: Edge[] }) => {
      if (nodesToDelete && nodesToDelete.length > 0) {
        const currentNodes = (storage.get("nodes") as Node[]) || [];
        const deleteIds = new Set(nodesToDelete.map((n) => n.id));
        storage.set(
          "nodes",
          currentNodes.filter((n) => !deleteIds.has(n.id))
        );
      }
      if (edgesToDelete && edgesToDelete.length > 0) {
        const currentEdges = (storage.get("edges") as Edge[]) || [];
        const deleteIds = new Set(edgesToDelete.map((e) => e.id));
        storage.set(
          "edges",
          currentEdges.filter((e) => !deleteIds.has(e.id))
        );
      }
    },
    []
  );

  const setNodes = useMutation(({ storage }, payload) => {
    const currentNodes = (storage.get("nodes") as Node[]) || [];
    const nextNodes = typeof payload === "function" ? payload(currentNodes) : payload;
    storage.set("nodes", nextNodes);
  }, []);

  const setEdges = useMutation(({ storage }, payload) => {
    const currentEdges = (storage.get("edges") as Edge[]) || [];
    const nextEdges = typeof payload === "function" ? payload(currentEdges) : payload;
    storage.set("edges", nextEdges);
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDelete,
    setNodes,
    setEdges,
  };
}