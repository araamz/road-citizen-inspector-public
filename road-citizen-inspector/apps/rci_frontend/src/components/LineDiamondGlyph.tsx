import { GlyphDiamond } from "@visx/glyph";

export type LineDiamondGlyphProps = {
    lineColor: string;
    glyphColor: string;
    glyphSize?: "sm" | "md" | "lg";
};

export default function LineDiamondGlyph({
    lineColor,
    glyphColor,
    glyphSize = "md",
}: LineDiamondGlyphProps) {

    const size = (() => {
        switch (glyphSize) {
            case "sm":
                return {
                    svg: { width: 20, height: 10 },
                    line: { width: 20, height: 2 },
                    glyph: { size: 40 },
                };
            case "lg":
                return {
                    svg: { width: 40, height: 20 },
                    line: { width: 40, height: 4 },
                    glyph: { size: 120 },
                };
            case "md":
            default:
                return {
                    svg: { width: 30, height: 14 },
                    line: { width: 30, height: 3 },
                    glyph: { size: 80 },
                };
        }
    })();

    const centerX = size.svg.width / 2;
    const centerY = size.svg.height / 2;

    return (
        <svg height={size.svg.height} width={size.svg.width}>
            <rect
                x={0}
                y={centerY - size.line.height / 2}
                width={size.line.width}
                height={size.line.height}
                fill={lineColor}
                rx={2}
            />
            <GlyphDiamond
                left={centerX}
                top={centerY}
                size={size.glyph.size}
                fill={glyphColor}
                stroke="white"
                strokeWidth={1.5}
            />
        </svg>
    );
}