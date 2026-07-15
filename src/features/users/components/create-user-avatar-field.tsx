import { useRef, useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { useMutation } from "@tanstack/react-query"
import { Loader2, UploadCloud } from "lucide-react"

import { uploadUserAvatar } from "@/features/users/server-functions/upload-user-avatar"
import { cn } from "@/lib/utils"

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png"]

function resolveClientAvatarError(file: File): string | null {
  if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
    return "Chỉ chấp nhận định dạng JPG, PNG."
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    return "Kích thước ảnh tối đa 2MB."
  }

  return null
}

type CreateUserAvatarFieldProps = {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function CreateUserAvatarField({
  value,
  onChange,
  disabled,
}: CreateUserAvatarFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const uploadAvatarFn = useServerFn(uploadUserAvatar)

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      return uploadAvatarFn({ data: formData })
    },
    onSuccess: (result) => onChange(result.url),
  })

  const handleFile = (file: File | undefined) => {
    if (!file || disabled) {
      return
    }

    const validationMessage = resolveClientAvatarError(file)
    setClientError(validationMessage)

    if (!validationMessage) {
      uploadMutation.mutate(file)
    }
  }

  const errorMessage = clientError ?? uploadMutation.error?.message ?? null

  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium text-foreground">
        Ảnh đại diện
      </span>
      <div
        className={cn(
          "relative flex aspect-square w-full max-w-48 flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed border-input bg-background text-center transition-colors",
          isDragOver && "border-primary bg-primary/5",
          disabled && "pointer-events-none opacity-50"
        )}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragOver(false)
          handleFile(event.dataTransfer.files[0])
        }}
      >
        {value.length > 0 ? (
          <img
            src={value}
            alt="Ảnh đại diện"
            className="size-full object-cover"
          />
        ) : (
          <>
            <UploadCloud className="size-8 text-muted-foreground" />
            <p className="px-4 text-xs text-muted-foreground">
              Kéo thả ảnh vào đây hoặc{" "}
              <button
                type="button"
                className="text-primary underline underline-offset-2"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                chọn file
              </button>
            </p>
          </>
        )}

        {uploadMutation.isPending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            handleFile(event.target.files?.[0])
            event.target.value = ""
          }}
        />
      </div>

      <p className="text-[11px] text-muted-foreground">
        Định dạng: JPG, PNG (Tối đa 2MB)
      </p>

      {errorMessage ? (
        <p className="text-xs text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
