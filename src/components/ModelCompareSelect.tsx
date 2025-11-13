import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import type { PricingModel } from '../data/types';
import { Button } from './ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { t, type Language } from './i18n';

export type ModelCompareSelectProps = {
  models: PricingModel[];
  value: string;
  onChange: (id: string) => void;
  lang: Language;
  placeholder: string;
  canRemove: boolean;
  onRemove?: () => void;
};

export function ModelCompareSelect({ models, value, onChange, lang, placeholder, canRemove, onRemove }: ModelCompareSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = models.find((model) => model.id === value);

  return (
    <div className="relative">
      {canRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          aria-label={t('removeSlot', lang)}
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-border"
          >
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium leading-tight">
                {selectedModel ? selectedModel.name : placeholder}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedModel ? selectedModel.provider : t('searchModels', lang)}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
            <CommandInput placeholder={t('searchModels', lang)} />
            <CommandEmpty>{t('noModelsFound', lang)}</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.id}
                  value={`${model.name} ${model.provider}`}
                  onSelect={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.provider}</span>
                  </div>
                  {model.id === value && <Check className="h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
