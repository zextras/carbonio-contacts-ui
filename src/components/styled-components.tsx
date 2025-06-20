/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
	AnyColor,
	Avatar,
	Container,
	getColor,
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

export const HoverBarContainer = styled(Row)`
	display: none;
	position: absolute;
	top: 0;
	right: 0;
	background: linear-gradient(to right, transparent, currentColor);
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

const StyledListItem = styled(ListItem)<{ $backgroundColor: AnyColor | undefined }>`
	${({ $backgroundColor, theme }): any | ReturnType<typeof pseudoClasses> =>
		$backgroundColor && pseudoClasses(theme, $backgroundColor, 'color')}
	transition: none;

	${({ $backgroundColor, theme }): undefined | ReturnType<typeof css> =>
		$backgroundColor &&
		css`
			${HoverBarContainer} {
				background: linear-gradient(to right, transparent, ${getColor($backgroundColor, theme)});
			}
			&:focus ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${$backgroundColor}.focus`, theme)}
				);
			}

			&:hover ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${$backgroundColor}.hover`, theme)}
				);
			}

			&:active ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${$backgroundColor}.active`, theme)}
				);
			}
		`}
`;

export const EnhancedListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
	function EnhancedListItemFn(
		{ background, selectedBackground, activeBackground, active, selected, ...rest },
		ref
	) {
		return (
			<StyledListItem
				ref={ref}
				$backgroundColor={
					(active && activeBackground) || (selected && selectedBackground) || background
				}
				background={background}
				selectedBackground={selectedBackground}
				activeBackground={activeBackground}
				active={active}
				selected={selected}
				{...rest}
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
