/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Row } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

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
