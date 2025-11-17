
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import React from 'react'
import { SvgXml } from "react-native-svg"

export function EditIcon() {
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const editXml = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="47" height="47" rx="15.5" stroke="${colors.border}" stroke-opacity="0.2"/>
    <g clip-path="url(#clip0_24_6018)">
      <path d="M31.7594 19.732L28.268 16.2414C28.1519 16.1253 28.0141 16.0332 27.8624 15.9704C27.7107 15.9075 27.5482 15.8752 27.384 15.8752C27.2198 15.8752 27.0572 15.9075 26.9056 15.9704C26.7539 16.0332 26.6161 16.1253 26.5 16.2414L16.8664 25.875C16.7498 25.9906 16.6574 26.1283 16.5945 26.28C16.5316 26.4317 16.4995 26.5944 16.5 26.7586V30.25C16.5 30.5815 16.6317 30.8995 16.8661 31.1339C17.1005 31.3683 17.4185 31.5 17.75 31.5H30.875C31.0408 31.5 31.1997 31.4341 31.3169 31.3169C31.4342 31.1997 31.5 31.0408 31.5 30.875C31.5 30.7092 31.4342 30.5503 31.3169 30.4331C31.1997 30.3158 31.0408 30.25 30.875 30.25H23.0094L31.7594 21.5C31.8755 21.3839 31.9676 21.2461 32.0304 21.0944C32.0933 20.9428 32.1256 20.7802 32.1256 20.616C32.1256 20.4518 32.0933 20.2893 32.0304 20.1376C31.9676 19.9859 31.8755 19.8481 31.7594 19.732ZM21.2414 30.25H17.75V26.7586L24.625 19.8836L28.1164 23.375L21.2414 30.25ZM29 22.4914L25.5094 19L27.3844 17.125L30.875 20.6164L29 22.4914Z" fill="${colors.text}"/>
    </g>
    <defs>
      <clipPath id="clip0_24_6018">
        <rect width="24" height="24" fill="white" transform="translate(12 12)"/>
      </clipPath>
    </defs>
  </svg>`

  return <SvgXml xml={editXml} width={48} height={48} />
}