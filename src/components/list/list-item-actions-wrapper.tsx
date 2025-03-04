/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useCallback } from 'react';

import { Action, Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { ContextualMenu } from '../contextual-menu';
import { HoverRow } from '../styled-components';

const HoverBarContainer = styled(Container)`
	top: 0;
	right: 0;
	display: none;
	position: absolute;
	background: linear-gradient(
		to right,
		transparent,
		${({ theme }): string => theme.palette.gray6.hover}
	);
	height: 55%;
	& > * {
		margin-top: ${({ theme }): string => theme.sizes.padding.small};
		margin-right: ${({ theme }): string => theme.sizes.padding.small};
	}
`;

const CustomHoverRow = styled(HoverRow)`
	&:hover {
		background: ${({ theme }): string => theme.palette.gray6.hover};
		& ${HoverBarContainer} {
			display: flex;
		}
	}
`;

type ListItemActionsWrapperProps = React.PropsWithChildren & {
	contextualMenuActions: Array<Action>;
	hoverActions: Array<ReactNode>;
	onClick: () => void;
};
export const ListItemActionsWrapper = ({
	contextualMenuActions,
	hoverActions,
	onClick,
	children,
	...rest
}: ListItemActionsWrapperProps): React.JSX.Element => {
	const preventTextSelection = useCallback<React.MouseEventHandler<HTMLDivElement>>((e) => {
		if (e.detail > 1) {
			e.preventDefault();
		}
	}, []);
	return (
		<Container orientation="vertical" onClick={onClick} data-testid={'list-item'}>
			<Container orientation="horizontal" mainAlignment="flex-start">
				<ContextualMenu actions={contextualMenuActions} {...rest}>
					<CustomHoverRow
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="unset"
						onClick={onClick}
						onMouseDown={preventTextSelection}
					>
						{children}
						<HoverBarContainer
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="center"
							padding={{ right: 'small' }}
						>
							{hoverActions}
						</HoverBarContainer>
					</CustomHoverRow>
				</ContextualMenu>
			</Container>
		</Container>
	);
};
