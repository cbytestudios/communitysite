declare module 'input-otp' {
  import * as React from 'react'
  export const OTPInput: any
  export const OTPInputContext: React.Context<{ slots?: Array<{ char?: string; hasFakeCaret?: boolean; isActive?: boolean }> } | undefined>
}
