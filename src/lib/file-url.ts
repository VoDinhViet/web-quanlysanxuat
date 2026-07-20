import { API_BASE_URL } from "@/lib/constants"

/**
 * The backend mints `FileResDto.url` host-relative (`/api/files/<id>/download?exp=&sig=`),
 * but the app and the API are different origins in development (:3000 vs
 * VITE_API_URL). A bare `src` would resolve against the app origin and 404, so
 * every `<img src>` / `<a href>` pointing at an uploaded file goes through here.
 *
 * A no-op when API_BASE_URL is "" — i.e. when the two are same-origin.
 */
export function resolveFileUrl(url: string): string {
  return `${API_BASE_URL}${url}`
}
