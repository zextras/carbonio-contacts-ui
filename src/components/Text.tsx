/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode } from 'react';

import {
	Text as DSText,
	type TextProps,
	TextWithTooltip,
	type TextWithTooltipProps
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { MakeOptional } from '../types/utils';

interface TextExtendedProps {
	width?: string;
	centered?: boolean;
	inline?: boolean;
}

type TextWithOptionalTooltipProps =
	| ({ withTooltip: true } & MakeOptional<TextWithTooltipProps, 'children'>)
	| ({ withTooltip?: boolean } & TextProps);

const TextWithOptionalTooltip = ({
	withTooltip,
	children = null,
	...rest
}: TextWithOptionalTooltipProps): React.JSX.Element =>
	withTooltip ? (
		<TextWithTooltip {...rest}>{children as ReactNode}</TextWithTooltip>
	) : (
		<DSText {...rest}>{children}</DSText>
	);

const StyledText = styled(TextWithOptionalTooltip)<{ $width?: string; $inline?: boolean }>`
	width: ${({ $width }): string | undefined => $width};
	display: ${({ $inline }): string | undefined | false => $inline && 'inline'};
`;

export const Text = ({
	width,
	centered,
	inline,
	lineHeight = 1.5,
	withTooltip = false,
	...dsProps
}: TextExtendedProps & TextWithOptionalTooltipProps): React.JSX.Element => (
	<StyledText
		$width={width}
		$inline={inline}
		textAlign={(centered && 'center') || undefined}
		lineHeight={lineHeight}
		withTooltip={withTooltip}
		{...dsProps}
	/>
);
