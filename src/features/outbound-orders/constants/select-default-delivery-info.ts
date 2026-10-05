import type { Client } from "@/lib/types/client.type"

// Địa chỉ giao hàng + người nhận mặc định của phiếu giao hàng theo khách hàng: liên hệ chính
// (không có thì liên hệ đầu tiên), điện thoại ưu tiên của liên hệ rồi mới đến của khách. Trống thì
// "" — giá trị rỗng của ô nhập.
export function selectDefaultDeliveryInfo(client: Client) {
  const receiverContact =
    client.contacts.find((contact) => contact.isPrimary) ??
    client.contacts.at(0)

  return {
    deliveryAddress: client.address ?? "",
    receiverName: receiverContact?.name ?? "",
    receiverPhone: receiverContact?.phoneNumber ?? client.phoneNumber ?? "",
  }
}
