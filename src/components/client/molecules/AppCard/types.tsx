import { IconName } from "../../atoms/Icon/types";

export interface AppCardProps {
  icon: IconName;
  iconLabel: string;
  iconColor?: string;
  title: string;
  bookmarked?: boolean;
  onBookmarkClick?: () => void;
  onButtonClick?: () => void;
  className?: string;
}
