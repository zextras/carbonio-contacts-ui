/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useCallback } from 'react';

import styled from '@emotion/styled';
import { Action, Container } from '@zextras/carbonio-design-system';

import { ContextualMenu } from 'components/contextual-menu';

export const HoverBarContainer = styled(Container)`
	top: 0;
	right: 0;
	display: none;
	position: absolute;
	background: linear-gradient(
		to right,
		transparent,
		${({ theme }): string => theme.palette.gray6.hover}
	);
	width: calc(100% - 4rem);
	height: 45%;

	& > * {
		margin-top: ${({ theme }): string => theme.sizes.padding.small};
		margin-right: ${({ theme }): string => theme.sizes.padding.small};
	}
`;

export const HoverContainer = styled(Container)`
	width: 100%;
	position: relative;
	cursor: pointer;
	text-decoration: none;

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
	useCallback<React.MouseEventHandler<HTMLDivElement>>((e) => {
		if (e.detail > 1) {
			e.preventDefault();
		}
	}, []);
	return (
		<Container orientation="vertical" onClick={onClick} data-testid={'list-item'}>
			<Container orientation="horizontal" mainAlignment="flex-start">
				<ContextualMenu actions={contextualMenuActions} {...rest}>
					<HoverContainer
						background={'transparent'}
						orientation="horizontal"
						mainAlignment="flex-start"
						crossAlignment="unset"
						onClick={onClick}
					>
						{children}
						<HoverBarContainer
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="center"
						>
							{hoverActions}
						</HoverBarContainer>
					</HoverContainer>
				</ContextualMenu>
			</Container>
		</Container>
	);
};
