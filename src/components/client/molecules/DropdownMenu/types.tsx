
export interface DropdownMenuItem {
  label: string;
  value: string;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  onSelect: (item: DropdownMenuItem) => void;
  className?: string;
}