import { twMerge } from "tailwind-merge";
import type { IconType } from "react-icons";

export type BadgeProps = {
    icon: IconType;
    label: string;
    size?: "sm" | "md" | "lg";
    className?: string;
};

export default function Badge({
    icon: Icon,
    label,
    size = "md",
    className,
}: BadgeProps) {

    const sizeStyles = {
        sm: {
            container: "gap-1 py-0.5 px-1.5 rounded-md",
            icon: 12,
            text: "text-xs",
        },
        md: {
            container: "gap-1 py-1 px-2 rounded-lg",
            icon: 16,
            text: "text-sm",
        },
        lg: {
            container: "gap-2 py-1.5 px-3 rounded-xl",
            icon: 20,
            text: "text-base",
        },
    }[size];

    return (
        <div
            className={twMerge(
                "flex flex-row items-center bg-neutral-200 w-fit",
                sizeStyles.container,
                className
            )}
        >
            <span>
                <Icon size={sizeStyles.icon} />
            </span>
            <p className={twMerge("font-medium", sizeStyles.text)}>
                {label}
            </p>
        </div>
    );
}