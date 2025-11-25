/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import styled from '@emotion/styled';
import {
	AnyColor,
	Avatar,
	Container,
	ListItem,
	type ListItemProps,
	pseudoClasses,
	Row
} from '@zextras/carbonio-design-system';

export const HoverRow = styled(Row)`
	position: relative;
	cursor: pointer;
	background: ${({ theme }): string => theme.palette.transparent.regular};

	&:hover {
		background: ${({ theme }): string => theme.palette.transparent.hover};
	}
`;

export const HoverContainer = styled(Row)``;

export const HoverBarContainer = styled(Container)`
	display: none;
	position: absolute;
	right: 0;
	background: linear-gradient(to right, transparent, currentColor 50%, currentColor 100%);
`;

export const ListItemContainer = styled(Container)`
	position: relative;
	cursor: pointer;
	${HoverBarContainer} {
		display: none;
	}

	&:hover {
		${HoverBarContainer} {
			display: flex;
		}
	}
`;

const StyledListItem = styled(ListItem)<{ $backgroundColor?: AnyColor }>`
	${({ $backgroundColor, theme }): undefined | ReturnType<typeof pseudoClasses> | string =>
		$backgroundColor && pseudoClasses(theme, $backgroundColor, 'color')}
	transition: none;
`;

export const EnhancedListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
	function EnhancedListItemFn(props, ref) {
		return (
			<StyledListItem
				ref={ref}
				$backgroundColor={
					(props.active && props.activeBackground) ||
					(props.selected && props.selectedBackground) ||
					props.background
				}
				{...props}
			/>
		);
	}
);

export const ScrollableContainer = styled(Container)`
	overflow-y: auto;
`;

export const CustomIconAvatar = styled(Avatar)`
	width: 2.625rem !important;
	height: 2.625rem !important;
	min-width: 2.625rem !important;
	min-height: 2.625rem !important;
	& > svg {
		max-width: 1.5rem;
		max-height: 1.5rem;
		min-width: 1.5rem;
		min-height: 1.5rem;
	}
`;
