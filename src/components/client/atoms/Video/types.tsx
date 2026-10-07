import React from "react";

export interface VideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    className?: string;
    rounded?: boolean;
}
