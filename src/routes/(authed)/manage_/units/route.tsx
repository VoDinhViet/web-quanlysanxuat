import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/(authed)/manage_/units")({
  beforeLoad: () => {
    throw redirect({ to: "/manage/settings/units" })
  },
})
