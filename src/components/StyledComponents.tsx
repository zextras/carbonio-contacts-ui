/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Container,
	getColor,
	ListItem,
	type ListItemProps,
	pseudoClasses,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import styled, { css, type DefaultTheme, type SimpleInterpolation } from 'styled-components';

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

export const StyledListItem = styled(ListItem).attrs<
	ListItemProps,
	{ backgroundColor?: string | keyof DefaultTheme['palette'] }
>(({ background, selectedBackground, activeBackground, active, selected }) => ({
	backgroundColor: (active && activeBackground) || (selected && selectedBackground) || background
}))`
	${({ backgroundColor, theme }): SimpleInterpolation =>
		backgroundColor && pseudoClasses(theme, backgroundColor, 'color')}
	transition: none;

	${({ backgroundColor, theme }): SimpleInterpolation =>
		backgroundColor &&
		css`
			${HoverBarContainer} {
				background: linear-gradient(to right, transparent, ${getColor(backgroundColor, theme)});
			}
			&:focus ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.focus`, theme)}
				);
			}

			&:hover ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.hover`, theme)}
				);
			}

			&:active ${HoverBarContainer} {
				background: linear-gradient(
					to right,
					transparent,
					${getColor(`${backgroundColor}.active`, theme)}
				);
			}
		`}
`;

export const TextWithLineHeight = styled(Text)`
	line-height: 1.5;
`;

export const ScrollableContainer = styled(Container)`
	overflow-y: auto;
`;
