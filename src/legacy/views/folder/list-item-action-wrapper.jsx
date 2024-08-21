/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useContext, useMemo } from 'react';

import { Container, Tooltip, Dropdown, IconButton } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { HoverRow } from '../../../components/styled-components';
import { ActionsContext } from '../../ui-actions/actions-context';

const HoverBarContainer = styled(Container)`
	top: 0;
	right: 0;
	display: none;
	position: absolute;
	background: linear-gradient(to right, transparent, ${({ theme }) => theme.palette.gray6.hover});
	height: 55%;
	& > * {
		margin-top: ${({ theme }) => theme.sizes.padding.small};
		margin-right: ${({ theme }) => theme.sizes.padding.small};
	}
`;

const CustomHoverRow = styled(HoverRow)`
	&:hover {
		background: ${({ theme }) => theme.palette.gray6.hover};
		& ${HoverBarContainer} {
			display: flex;
		}
	}
`;

const ListItemActionWrapper = ({ children, current, onClick, contact }) => {
	const { getContextActions, getHoverActions } = useContext(ActionsContext);

	const hoverActions = useMemo(() => getHoverActions(contact), [contact, getHoverActions]);
	const dropdownActions = useMemo(() => getContextActions(contact), [contact, getContextActions]);
	return (
		<Dropdown contextMenu items={dropdownActions} display="block" style={{ width: '100%' }}>
			<CustomHoverRow
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="unset"
				onClick={onClick}
				current={current}
			>
				{children}
				<HoverBarContainer
					orientation="horizontal"
					mainAlignment="flex-end"
					crossAlignment="center"
					padding={{ right: 'small' }}
				>
					{hoverActions.map((action) => (
						<Tooltip key={action.id} label={action.label}>
							<IconButton
								key={action.id}
								icon={action.icon}
								onClick={(ev) => {
									ev.stopPropagation();
									action.onClick(ev);
								}}
								size="small"
								disabled={action.disabled}
							/>
						</Tooltip>
					))}
				</HoverBarContainer>
			</CustomHoverRow>
		</Dropdown>
	);
};

export default ListItemActionWrapper;
