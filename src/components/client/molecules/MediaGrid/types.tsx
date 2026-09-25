import { ImageProps } from "@/components/client/atoms/Image/types";
import { VideoProps } from "@/components/client/atoms/Video/types";
import { FileProps } from "@/components/client/atoms/File/types";

export type MediaGridItem =
    | ({ type: "image" } & ImageProps)
    | ({ type: "video" } & VideoProps)
    | ({ type: "file" } & FileProps);

export interface MediaGridProps {
    items: MediaGridItem[];
    columns?: number;
}
