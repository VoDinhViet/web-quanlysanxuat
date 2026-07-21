import { useState } from "react"
import { toast } from "sonner"

import { buildInitialStructure } from "@/features/products/mock/product-structure.mock"
import {
  productOperationSchema,
  structureNodeSchema,
} from "@/features/products/schemas/product-structure.schema"
import type {
  ProductOperationSchema,
  StructureNodeSchema,
} from "@/features/products/schemas/product-structure.schema"
import type {
  ProductOperation,
  ProductStructureNode,
} from "@/features/products/types/product-structure.type"

function mapNode(
  nodes: ProductStructureNode[],
  nodeId: string,
  updater: (node: ProductStructureNode) => ProductStructureNode
): ProductStructureNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) return updater(node)
    return node.children.length === 0
      ? node
      : { ...node, children: mapNode(node.children, nodeId, updater) }
  })
}

function insertNode(
  nodes: ProductStructureNode[],
  parentId: string | null,
  child: ProductStructureNode
): ProductStructureNode[] {
  if (parentId === null) return [...nodes, child]
  return mapNode(nodes, parentId, (node) => ({
    ...node,
    children: [...node.children, child],
  }))
}

function removeNodeById(
  nodes: ProductStructureNode[],
  nodeId: string
): ProductStructureNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) =>
      node.children.length === 0
        ? node
        : { ...node, children: removeNodeById(node.children, nodeId) }
    )
}

function renumberOperations(
  operations: ProductOperation[]
): ProductOperation[] {
  return operations.map((operation, index) => ({
    ...operation,
    sequence: index + 1,
  }))
}

export type NodeDialogState =
  | { mode: "closed" }
  | { mode: "add"; parentId: string | null }
  | { mode: "edit"; node: ProductStructureNode }

export type OperationDialogState =
  | { mode: "closed" }
  | { mode: "add"; nodeId: string }
  | { mode: "edit"; nodeId: string; operation: ProductOperation }

/**
 * Owns the structure tab's BOM tree. There is no backend yet (see the note on
 * `PRODUCT_DETAIL_TABS` in product-detail-search.schema.ts), so this is plain
 * local state seeded from the mock tree — every add/edit/delete is
 * client-only and resets on reload. When the real API lands, this hook is the
 * one place to swap for query/mutation calls; the tab components don't change.
 */
export function useProductStructure() {
  const [nodes, setNodes] = useState<ProductStructureNode[]>(() =>
    buildInitialStructure()
  )
  const [nodeDialog, setNodeDialog] = useState<NodeDialogState>({
    mode: "closed",
  })
  const [deletingNode, setDeletingNode] = useState<ProductStructureNode | null>(
    null
  )
  const [operationDialog, setOperationDialog] = useState<OperationDialogState>({
    mode: "closed",
  })

  function openAddNode(parentId: string | null) {
    setNodeDialog({ mode: "add", parentId })
  }

  function openEditNode(node: ProductStructureNode) {
    setNodeDialog({ mode: "edit", node })
  }

  function closeNodeDialog() {
    setNodeDialog({ mode: "closed" })
  }

  // There's no server function to validate/transform through (no backend yet
  // — see product-detail-search.schema.ts), so this hook parses the raw form
  // value itself, standing in for what a createServerFn .validator() would
  // normally do.
  function submitNode(rawValue: StructureNodeSchema) {
    const value = structureNodeSchema.parse(rawValue)

    if (nodeDialog.mode === "edit") {
      const { node: editingNode } = nodeDialog
      setNodes((prev) =>
        mapNode(prev, editingNode.id, (node) => ({ ...node, ...value }))
      )
      toast.success("Đã cập nhật hạng mục")
    } else if (nodeDialog.mode === "add") {
      const newNode: ProductStructureNode = {
        id: crypto.randomUUID(),
        ...value,
        imageUrl: null,
        operations: [],
        children: [],
      }
      setNodes((prev) => insertNode(prev, nodeDialog.parentId, newNode))
      toast.success("Đã thêm hạng mục")
    }
    closeNodeDialog()
  }

  function confirmDeleteNode() {
    if (!deletingNode) return
    setNodes((prev) => removeNodeById(prev, deletingNode.id))
    setDeletingNode(null)
    toast.success("Đã xoá hạng mục")
  }

  function openAddOperation(nodeId: string) {
    setOperationDialog({ mode: "add", nodeId })
  }

  function openEditOperation(nodeId: string, operation: ProductOperation) {
    setOperationDialog({ mode: "edit", nodeId, operation })
  }

  function closeOperationDialog() {
    setOperationDialog({ mode: "closed" })
  }

  function submitOperation(rawValue: ProductOperationSchema) {
    const value = productOperationSchema.parse(rawValue)

    if (operationDialog.mode === "edit") {
      const { nodeId, operation: editingOperation } = operationDialog
      setNodes((prev) =>
        mapNode(prev, nodeId, (node) => ({
          ...node,
          operations: node.operations.map((operation) =>
            operation.id === editingOperation.id
              ? { ...operation, ...value }
              : operation
          ),
        }))
      )
      toast.success("Đã cập nhật công đoạn")
    } else if (operationDialog.mode === "add") {
      const { nodeId } = operationDialog
      setNodes((prev) =>
        mapNode(prev, nodeId, (node) => ({
          ...node,
          operations: [
            ...node.operations,
            {
              id: crypto.randomUUID(),
              sequence: node.operations.length + 1,
              ...value,
            },
          ],
        }))
      )
      toast.success("Đã thêm công đoạn")
    }
    closeOperationDialog()
  }

  function removeOperation(nodeId: string, operationId: string) {
    setNodes((prev) =>
      mapNode(prev, nodeId, (node) => ({
        ...node,
        operations: renumberOperations(
          node.operations.filter((operation) => operation.id !== operationId)
        ),
      }))
    )
    toast.success("Đã xoá công đoạn")
  }

  return {
    nodes,
    nodeDialog,
    openAddNode,
    openEditNode,
    closeNodeDialog,
    submitNode,
    deletingNode,
    setDeletingNode,
    confirmDeleteNode,
    operationDialog,
    openAddOperation,
    openEditOperation,
    closeOperationDialog,
    submitOperation,
    removeOperation,
  }
}

export type UseProductStructureResult = ReturnType<typeof useProductStructure>
