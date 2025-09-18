declare module 'react-hook-form' {
  export function useForm(...args: any[]): any
  export const Controller: any
  export const FormProvider: any
  export const useFormContext: any
  export const useFormState: any
  // ControllerProps is generic in real types; provide a permissive generic signature
  export type ControllerProps<TFieldValues = any, TName extends FieldPath<TFieldValues> = any> = any
  export type FieldPath<T> = any
  export type FieldValues = any
}
