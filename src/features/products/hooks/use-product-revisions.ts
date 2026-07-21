import { useState } from "react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { toast } from "sonner"

import { activateProductRevision } from "@/features/products/server-functions/activate-product-revision"
import { productRevisionsQueryOptions } from "@/features/products/products.query"
import { createProductRevision } from "@/features/products/server-functions/create-product-revision"
import { updateProductRevision } from "@/features/products/server-functions/update-product-revision"
import type { CreateProductRevisionSchema } from "@/features/products/schemas/create-product-revision.schema"
import type { UpdateProductRevisionSchema } from "@/features/products/schemas/update-product-revision.schema"
import type { ProductRevision } from "@/features/products/types/product-revision.type"
import type { Product } from "@/features/products/types/product.type"

type CreateRevisionPrefill = {
  sourceRevisionId: string
  setAsCurrent: boolean
}

/**
 * Owns the product's revision list plus which revision dialog is open. The
 * revisions tab itself is shown/hidden by the page's `?tab=` search param, not
 * by this hook. The list is loaded from the real GET revisions endpoint;
 * `createRevision`, `confirmPromote`, and `submitEdit` all persist through
 * real mutations.
 */
export function useProductRevisions(product: Product) {
  const queryClient = useQueryClient()
  const createRevisionFn = useServerFn(createProductRevision)
  const activateRevisionFn = useServerFn(activateProductRevision)
  const updateRevisionFn = useServerFn(updateProductRevision)

  const { data: productRevisions } = useSuspenseQuery(
    productRevisionsQueryOptions(product.id)
  )
  const [revisions, setRevisions] =
    useState<ProductRevision[]>(productRevisions)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createPrefill, setCreatePrefill] = useState<CreateRevisionPrefill>()
  const [defaultRevisionId, setDefaultRevisionId] = useState<string | null>(
    null
  )
  const [editingRevisionId, setEditingRevisionId] = useState<string | null>(
    null
  )

  const activeRevision =
    revisions.find((revision) => revision.isActive) ?? revisions[0]

  const { mutate: createRevision, isPending: isCreatingRevision } = useMutation(
    {
      mutationFn: (input: CreateProductRevisionSchema) =>
        createRevisionFn({ data: { ...input, productId: product.id } }),
      onSuccess: (created) => {
        setRevisions((prev) => [...prev, created])
        setIsCreateOpen(false)
        toast.success("Đã tạo revision mới")
        void queryClient.invalidateQueries({ queryKey: ["products"] })
      },
      onError: (error) => toast.error(error.message),
    }
  )

  const { mutate: activateRevision, isPending: isPromoting } = useMutation({
    mutationFn: (revisionId: string) =>
      activateRevisionFn({ data: { productId: product.id, revisionId } }),
    onSuccess: (activated) => {
      setRevisions((prev) =>
        prev.map((revision) =>
          revision.id === activated.id
            ? activated
            : { ...revision, isActive: false }
        )
      )
      setDefaultRevisionId(null)
      toast.success("Đã đặt bản hiện hành")
      void queryClient.invalidateQueries({ queryKey: ["products"] })
    },
    onError: (error) => toast.error(error.message),
  })

  const { mutate: updateRevision, isPending: isUpdatingRevision } = useMutation(
    {
      mutationFn: (
        input: UpdateProductRevisionSchema & { revisionId: string }
      ) => updateRevisionFn({ data: { ...input, productId: product.id } }),
      onSuccess: (updated) => {
        setRevisions((prev) =>
          prev.map((revision) =>
            revision.id === updated.id ? updated : revision
          )
        )
        setEditingRevisionId(null)
        toast.success("Đã cập nhật revision")
        void queryClient.invalidateQueries({ queryKey: ["products"] })
      },
      onError: (error) => toast.error(error.message),
    }
  )

  function openCreateDialog(prefill?: CreateRevisionPrefill) {
    setCreatePrefill(prefill)
    setIsCreateOpen(true)
  }

  function confirmPromote() {
    if (defaultRevisionId) {
      activateRevision(defaultRevisionId)
    }
  }

  function submitEdit(input: UpdateProductRevisionSchema) {
    if (editingRevisionId) {
      updateRevision({ ...input, revisionId: editingRevisionId })
    }
  }

  return {
    revisions,
    activeRevision,
    isCreateOpen,
    setIsCreateOpen,
    createPrefill,
    openCreateDialog,
    createRevision,
    isCreatingRevision,
    defaultRevisionId,
    setDefaultRevisionId,
    confirmPromote,
    isPromoting,
    editingRevisionId,
    setEditingRevisionId,
    submitEdit,
    isUpdatingRevision,
  }
}

export type UseProductRevisionsResult = ReturnType<typeof useProductRevisions>
