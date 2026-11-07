"use client";
import { Children, isValidElement, type ReactNode } from "react";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

type Props = {
  children: ReactNode;
  value: string | number;
  onChange: (event: { target: { value: string } }) => void;
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
  required?: boolean;
};
export function AppSelect({ children, value, onChange, id, disabled, required, "aria-label": label }: Props) {
  const options = Children.toArray(children).filter(isValidElement).map((child) => {
    const props = child.props as { value?: string | number; children: ReactNode; disabled?: boolean };
    return { value: String(props.value ?? props.children), label: props.children, disabled: props.disabled };
  });
  return <Select.Root value={String(value)} onValueChange={(next) => { if (next !== null) onChange({ target: { value: next } }); }} items={options} disabled={disabled} required={required}>
    <Select.Trigger id={id} aria-label={label} className="app-select-trigger">
      <Select.Value /><Select.Icon className="app-select-chevron"><ChevronDown size={16}/></Select.Icon>
    </Select.Trigger>
    <Select.Portal><Select.Positioner className="app-select-positioner" sideOffset={8} align="center" alignItemWithTrigger={false}>
      <Select.Popup className="app-select-popup"><Select.List className="app-select-list">
        {options.map((option) => <Select.Item key={option.value} value={option.value} disabled={option.disabled} className="app-select-item">
          <Select.ItemText>{option.label}</Select.ItemText>
          <span className="app-select-mark"><Select.ItemIndicator><Check size={12} strokeWidth={2.5}/></Select.ItemIndicator></span>
        </Select.Item>)}
      </Select.List></Select.Popup>
    </Select.Positioner></Select.Portal>
  </Select.Root>;
}
