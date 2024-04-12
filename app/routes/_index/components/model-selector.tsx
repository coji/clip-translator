import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui'
import { cn } from '~/libs/utils'
import { Models } from '~/services/claude3'

interface ModelSelectorProps
  extends React.ComponentProps<typeof SelectTrigger> {
  onChangeValue?: (model: string) => void
  defaultValue?: string
  value?: string
}
export const ModelSelector = ({
  onChangeValue,
  defaultValue,
  value,
  className,
  name,
  ...rest
}: ModelSelectorProps) => {
  return (
    <Select
      defaultValue={defaultValue}
      value={value}
      name={name}
      onValueChange={(value) => onChangeValue?.(value)}
    >
      <SelectTrigger className={cn('capitalize', className)} {...rest}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(Models).map((modelId) => (
          <SelectItem key={modelId} value={modelId} className="capitalize">
            {modelId}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
