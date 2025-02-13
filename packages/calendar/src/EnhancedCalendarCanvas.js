/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React, { memo, useRef, useState, useEffect, useCallback } from 'react'
import {
    isCursorInRect,
    getRelativeCursor,
    degreesToRadians,
    useDimensions,
    useTheme,
    withContainer,
    useValueFormatter,
} from '@nivo/core'
import { renderLegendToCanvas } from '@nivo/legends'
import { useCalendarLayout } from './enhancedHooks'
import { useMonthLegends, useBlockLegends, useDays, useColorScale } from './sharedHooks'
import { useTooltip } from '@nivo/tooltip'
import {
    EnhancedCalendarCanvasDefaultProps,
    EnhancedCalendarCanvasPropTypes,
} from './enhancedProps'

const findDayUnderCursor = (event, canvasEl, days, size, dayBorderWidth, margin) => {
    const [x, y] = getRelativeCursor(canvasEl, event)
    return days.find(day => {
        return (
            day.value !== undefined &&
            isCursorInRect(
                day.x + margin.left - dayBorderWidth / 2,
                day.y + margin.top - dayBorderWidth / 2,
                size + dayBorderWidth,
                size + dayBorderWidth,
                x,
                y
            )
        )
    })
}

const EnhancedCalendarCanvas = memo(
    ({
        margin: partialMargin,
        width,
        height,
        pixelRatio,

        align,
        colors,
        colorScale,
        data,
        direction,
        emptyColor,
        from,
        to,
        minValue,
        maxValue,
        valueFormat,
        legendFormat,

        blockLegend,
        blockLegendOffset,
        blockLegendPosition,
        blockSpacing,

        monthLegend,
        monthLegendOffset,
        monthLegendPosition,
        monthSpacing,

        dayBorderColor,
        dayBorderWidth,
        daySpacing,

        granularity,
        weekDirection,
        breakpoint,

        isInteractive,
        tooltip,
        onClick,
        onMouseEnter,
        onMouseLeave,
        onMouseMove,

        legends,
    }) => {
        const canvasEl = useRef(null)
        const { innerWidth, innerHeight, outerWidth, outerHeight, margin } = useDimensions(
            width,
            height,
            partialMargin
        )
        const { months, blocks, ...rest } = useCalendarLayout({
            width: innerWidth,
            height: innerHeight,
            from,
            to,
            direction,
            blockSpacing,
            monthSpacing,
            daySpacing,
            align,
            granularity,
            weekDirection,
            breakpoint,
        })
        const colorScaleFn = useColorScale({ data, minValue, maxValue, colors, colorScale })
        const monthLegends = useMonthLegends({
            months,
            direction,
            monthLegendPosition,
            monthLegendOffset,
        })
        const blockLegends = useBlockLegends({
            blocks,
            direction,
            blockLegendPosition,
            blockLegendOffset,
        })
        const days = useDays({ days: rest.days, data, colorScale: colorScaleFn, emptyColor })
        const [currentDay, setCurrentDay] = useState(null)
        const theme = useTheme()
        const formatValue = useValueFormatter(valueFormat)
        const formatLegend = useValueFormatter(legendFormat)

        const { showTooltipFromEvent, hideTooltip } = useTooltip()

        useEffect(() => {
            canvasEl.current.width = outerWidth * pixelRatio
            canvasEl.current.height = outerHeight * pixelRatio

            const ctx = canvasEl.current.getContext('2d')

            ctx.scale(pixelRatio, pixelRatio)

            ctx.fillStyle = theme.background
            ctx.fillRect(0, 0, outerWidth, outerHeight)
            ctx.translate(margin.left, margin.top)

            days.forEach(day => {
                ctx.fillStyle = day.color
                if (dayBorderWidth > 0) {
                    ctx.strokeStyle = dayBorderColor
                    ctx.lineWidth = dayBorderWidth
                }

                ctx.beginPath()
                ctx.rect(day.x, day.y, day.size, day.size)
                ctx.fill()

                if (dayBorderWidth > 0) {
                    ctx.stroke()
                }
            })

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillStyle = theme.labels.text.fill
            ctx.font = `${theme.labels.text.fontSize}px ${theme.labels.text.fontFamily}`

            monthLegends.forEach(month => {
                ctx.save()
                ctx.translate(month.x, month.y)
                ctx.rotate(degreesToRadians(month.rotation))
                ctx.fillText(monthLegend(month.year, month.month, month.date), 0, 0)
                ctx.restore()
            })

            blockLegends.forEach(block => {
                ctx.save()
                ctx.translate(block.x, block.y)
                ctx.rotate(degreesToRadians(block.rotation))
                ctx.fillText(blockLegend(block), 0, 0)
                ctx.restore()
            })

            legends.forEach(legend => {
                const legendData = colorScaleFn.ticks(legend.itemCount).map(value => ({
                    id: value,
                    label: formatLegend(value),
                    color: colorScaleFn(value),
                }))

                renderLegendToCanvas(ctx, {
                    ...legend,
                    data: legendData,
                    containerWidth: innerWidth,
                    containerHeight: innerHeight,
                    theme,
                })
            })
        }, [
            canvasEl,
            innerHeight,
            innerWidth,
            outerWidth,
            outerHeight,
            pixelRatio,
            margin,
            days,
            dayBorderColor,
            dayBorderWidth,
            colorScale,
            blockLegend,
            blockLegends,
            monthLegend,
            monthLegends,
            legends,
            theme,
            formatLegend,
        ])

        const handleMouseHover = useCallback(
            event => {
                const data = findDayUnderCursor(
                    event,
                    canvasEl.current,
                    days,
                    days[0].size,
                    dayBorderWidth,
                    margin
                )

                if (data) {
                    setCurrentDay(data)
                    const formatedData = {
                        ...data,
                        value: formatValue(data.value),
                        data: { ...data.data },
                    }
                    showTooltipFromEvent(React.createElement(tooltip, { ...formatedData }), event)
                    !currentDay && onMouseEnter && onMouseEnter(data, event)
                    onMouseMove && onMouseMove(data, event)
                    currentDay &&
                        currentDay.id !== data.id &&
                        onMouseLeave &&
                        onMouseLeave(data, event)
                } else {
                    hideTooltip()
                    onMouseLeave && onMouseLeave(data, event)
                }
            },
            [
                canvasEl,
                margin,
                days,
                setCurrentDay,
                formatValue,
                daySpacing,
                showTooltipFromEvent,
                hideTooltip,
                onMouseEnter,
                onMouseMove,
                onMouseLeave,
            ]
        )

        const handleMouseLeave = useCallback(() => {
            setCurrentDay(null)
            hideTooltip()
        }, [setCurrentDay, hideTooltip])

        const handleClick = useCallback(
            event => {
                if (!onClick) return

                const data = findDayUnderCursor(
                    event,
                    canvasEl.current,
                    days,
                    days[0].size,
                    daySpacing,
                    margin
                )

                data && onClick(data, event)
            },
            [canvasEl, daySpacing, margin, setCurrentDay, days, onClick]
        )

        return (
            <canvas
                ref={canvasEl}
                width={outerWidth * pixelRatio}
                height={outerHeight * pixelRatio}
                style={{
                    width: outerWidth,
                    height: outerHeight,
                }}
                onMouseEnter={isInteractive ? handleMouseHover : undefined}
                onMouseMove={isInteractive ? handleMouseHover : undefined}
                onMouseLeave={isInteractive ? handleMouseLeave : undefined}
                onClick={isInteractive ? handleClick : undefined}
            />
        )
    }
)

EnhancedCalendarCanvas.displayName = 'EnhancedCalendarCanvas'
EnhancedCalendarCanvas.defaultProps = EnhancedCalendarCanvasDefaultProps
EnhancedCalendarCanvas.propTypes = EnhancedCalendarCanvasPropTypes

export default withContainer(EnhancedCalendarCanvas)
