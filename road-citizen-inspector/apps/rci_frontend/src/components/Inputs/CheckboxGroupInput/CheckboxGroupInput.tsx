import InputContainer from '../InputContainer'
import type {InputContainerProps} from '../InputContainer';
import type { ReactElement } from 'react'
import type { CheckboxGroupItemProps } from './CheckboxGroupItem'

export type CheckboxGroupInputProps = {
  children: Array<ReactElement<CheckboxGroupItemProps>> | ReactElement<CheckboxGroupItemProps> | undefined
} & Omit<InputContainerProps, 'children'>
export default function CheckboxGroupInput({
  children,
  ...rest
}: CheckboxGroupInputProps) {
  return (
    <InputContainer {...rest}>
      <div className='flex flex-col gap-4 @lg:grid @lg:grid-cols-2'>{children}</div>
    </InputContainer>
  )
}
