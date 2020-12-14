import { OrdinalColorScaleConfig } from '@nivo/colors'
import { ArcTransitionMode } from '@nivo/arcs'
import { PieTooltip } from './PieTooltip'

export const defaultProps = {
    id: 'id',
    value: 'value',
    sortByValue: false,
    innerRadius: 0,
    padAngle: 0,
    cornerRadius: 0,

    layers: ['radialLabels', 'arcs', 'arcLabels', 'legends'],

    // layout
    startAngle: 0,
    endAngle: 360,
    fit: true,
    activeInnerRadiusOffset: 0,
    activeOuterRadiusOffset: 0,

    // border
    borderWidth: 0,
    borderColor: {
        from: 'color',
        modifiers: [['darker', 1]],
    },

    // radial labels
    radialLabel: 'id',
    enableRadialLabels: true,
    radialLabelsSkipAngle: 0,
    radialLabelsLinkOffset: 0,
    radialLabelsLinkDiagonalLength: 16,
    radialLabelsLinkHorizontalLength: 24,
    radialLabelsLinkStrokeWidth: 1,
    radialLabelsTextXOffset: 6,
    radialLabelsTextColor: { theme: 'labels.text.fill' },
    radialLabelsLinkColor: { theme: 'axis.ticks.line.stroke' },

    // arc labels
    enableArcLabels: true,
    arcLabel: 'formattedValue',
    arcLabelsSkipAngle: 0,
    arcLabelsRadiusOffset: 0.5,
    arcLabelsTextColor: { theme: 'labels.text.fill' },

    colors: ({ scheme: 'nivo' } as unknown) as OrdinalColorScaleConfig,
    defs: [],
    fill: [],

    isInteractive: true,

    animate: true,
    motionConfig: 'gentle',
    transitionMode: 'innerRadius' as ArcTransitionMode,

    tooltip: PieTooltip,

    legends: [],

    role: 'img',

    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio ?? 1 : 1,
}
