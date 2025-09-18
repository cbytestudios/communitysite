declare module 'next-auth/react' {
  export function signIn(provider?: string, options?: any): Promise<void>
}
