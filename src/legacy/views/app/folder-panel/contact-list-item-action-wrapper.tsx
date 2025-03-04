/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useContext, useMemo } from 'react';

import { Container, Dropdown } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

import { ListActionIconButton } from '../../../../components/list/list-action-icon-button';
import { HoverRow } from '../../../../components/styled-components';
import { Contact } from '../../../types/contact';
import { ActionsContext } from '../../../ui-actions/actions-context';
import { useHoverActions } from '../../../ui-actions/contact-actions';

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

type ListItemActionWrapperProps = React.PropsWithChildren<{
	onClick?: () => void;
	contact: Contact;
}>;
export const ContactListItemActionWrapper = ({
	children,
	onClick,
	contact
}: ListItemActionWrapperProps): React.JSX.Element => {
	const { getContextActions } = useContext(ActionsContext);

	const hoverActions = useHoverActions(contact);
	const hoverActionButtons = useMemo<ReactNode[]>(
		() => hoverActions.map((action) => <ListActionIconButton key={action.id} action={action} />),
		[hoverActions]
	);
	const dropdownActions = useMemo(() => getContextActions(contact), [contact, getContextActions]);
	return (
		<Dropdown contextMenu items={dropdownActions} display="block" style={{ width: '100%' }}>
			<CustomHoverRow
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
					padding={{ right: 'small' }}
				>
					{hoverActionButtons}
				</HoverBarContainer>
			</CustomHoverRow>
		</Dropdown>
	);
};
