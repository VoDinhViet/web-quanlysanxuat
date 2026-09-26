import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/(authed)/manage_/operations")({
  beforeLoad: () => {
    throw redirect({
      to: "/manage/settings/operations",
      search: { page: 1, limit: 10 },
    })
  },
})
