/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React from 'react'
import { ResponsiveWrapper } from '@nivo/core'
import EnhancedCalendar from './EnhancedCalendar'

const ResponsiveEnhancedCalendar = props => (
    <ResponsiveWrapper>
        {({ width, height }) => <EnhancedCalendar width={width} height={height} {...props} />}
    </ResponsiveWrapper>
)

export default ResponsiveEnhancedCalendar
