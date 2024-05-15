import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui'
import { cn } from '~/libs/utils'
import { Models } from '~/services/models'

interface ModelSelectorProps
  extends React.ComponentProps<typeof SelectTrigger> {
  onChangeValue?: (model: string) => void
  value?: string
}
export const ModelSelect = ({
  onChangeValue,
  value,
  className,
  name,
  ...rest
}: ModelSelectorProps) => {
  return (
    <Select
      value={value}
      name={name}
      onValueChange={(value) => onChangeValue?.(value)}
    >
      <SelectTrigger
        className={cn(
          'h-auto py-1 text-xs capitalize focus:ring-offset-0',
          className,
        )}
        {...rest}
      >
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
