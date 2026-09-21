export type PurchaseChainNoteItem = {
  id: string
  code: string
  note: string | null
}

export type PurchaseChainNotes = {
  purchaseRequests: PurchaseChainNoteItem[]
  quotations: PurchaseChainNoteItem[]
  purchaseOrders: PurchaseChainNoteItem[]
  inventoryReceipts: PurchaseChainNoteItem[]
}
