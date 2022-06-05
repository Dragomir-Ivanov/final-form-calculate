import { Decorator } from 'final-form'

export type FieldName = string

export type FieldPattern = FieldName | RegExp | (FieldName | RegExp)[]

export type UpdatesByName = {
  [FieldName: string]: (
    value: any,
    allValues?: Object,
    prevValues?: Object
  ) => any
}

export type Hints = {
  skipNextUpdate: boolean
}

export type UpdatesForAll = (
  value: any,
  field: string,
  allValues: Object | undefined,
  prevValues: Object | undefined,
  setHints: (hints: Hints) => void
) => { [FieldName: string]: any }

export type Updates = UpdatesByName | UpdatesForAll

export type Calculation = {
  field: FieldPattern
  updates: Updates
  updateOnPristine?: boolean
  isEqual?: (a: any, b: any) => boolean
}

export default function createDecorator<FormValues = object>(
  ...calculations: Calculation[]
): Decorator<FormValues>
