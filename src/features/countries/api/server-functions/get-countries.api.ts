import { createServerFn } from "@tanstack/react-start"
import axios from "axios"

import { http, logHttpError } from "@/lib/http"
import type { ApiErrorResponse } from "@/lib/http"
import type { CountryRef } from "@/lib/types/supplier.type"

const GENERIC_ERROR_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại."

function resolveGetCountriesErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return GENERIC_ERROR_MESSAGE
  }

  switch (error.response?.data.errorCode) {
    default:
      return GENERIC_ERROR_MESSAGE
  }
}

export const getCountries = createServerFn({ method: "GET" }).handler(
  async (): Promise<CountryRef[]> => {
    try {
      const response = await http.get<CountryRef[]>("/api/countries")

      return response.data
    } catch (error) {
      logHttpError(error, "getCountries")

      throw new Error(resolveGetCountriesErrorMessage(error))
    }
  }
)
