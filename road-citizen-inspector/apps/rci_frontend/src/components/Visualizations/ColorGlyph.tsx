export type ColorGlyphProps = {
    color: string;
    size?: number;
    radius?: number;
} 
export default function ColorGlyph({
    color,
    size = 20,
    radius = 5
}: ColorGlyphProps) {
    return (
        <svg width={size} height={size}>
            <rect
                width={size} height={size}
                fill={color}
                rx={radius}
                ry={radius}
            />
        </svg>
    )
}