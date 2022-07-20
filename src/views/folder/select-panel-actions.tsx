/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Dispatch } from '@reduxjs/toolkit';
import React, { useMemo, useContext, ReactElement, FC, SyntheticEvent } from 'react';
import { Container, Dropdown, IconButton, Padding, Divider } from '@zextras/carbonio-design-system';
import { map, noop } from 'lodash';
import { ActionsContext } from '../../ui-actions/actions-context';

interface SelectPanelActionsProps {
	dispatch?: Dispatch<any>;
	deselectAll?: (e: SyntheticEvent) => void;
	folderId?: string;
	selectedIDs?: { [key: string]: boolean };
}

const SelectPanelActions: FC<SelectPanelActionsProps> = ({ deselectAll }): ReactElement => {
	const { getPrimaryActions, getSecondaryActions } = useContext(ActionsContext);

	const primaryActions = useMemo(
		() => getPrimaryActions(deselectAll),
		[deselectAll, getPrimaryActions]
	);
	const secondaryActions = useMemo(
		() => getSecondaryActions(deselectAll),
		[deselectAll, getSecondaryActions]
	);

	return (
		<>
			<Container
				background="gray5"
				height="48px"
				orientation="horizontal"
				padding={{ all: 'extrasmall' }}
			>
				<Container background="gray5" orientation="horizontal" mainAlignment="flex-start">
					<IconButton
						icon="ArrowBack"
						iconColor="primary"
						size="large"
						onClick={deselectAll ?? noop}
						data-testid="action-button-deselect-all"
					/>
					{/* Uncomment this line to show the `Select all` Button */}
					{/* <Button type='ghost' label='Select all' color='primary' /> */}
				</Container>
				<Container background="gray5" orientation="horizontal" mainAlignment="flex-end">
					{map(primaryActions, (action) => (
						<Padding left="extralarge" key={action.label}>
							<IconButton
								data-testid={`primary-action-button-${action.label}`}
								icon={action.icon}
								color="primary"
								onClick={(ev: React.SyntheticEvent<HTMLElement> | KeyboardEvent): void => {
									if (ev) ev.preventDefault();
									action.click(ev);
								}}
								size="large"
							/>
						</Padding>
					))}
				</Container>
				<Padding left="extrasmall">
					<Dropdown
						placement="right-end"
						data-testid="secondary-actions-dropdown"
						items={map(secondaryActions, (action) => ({
							id: action.label,
							icon: action.icon,
							label: action.label,
							click: (ev: React.SyntheticEvent<HTMLElement> | KeyboardEvent): void => {
								if (ev) ev.preventDefault();
								action.click(ev);
							},
							customComponent: action.customComponent,
							items: action.items
						}))}
					>
						<IconButton
							size="medium"
							iconColor="primary"
							icon="MoreVertical"
							data-testid="secondary-actions-open-button"
							onClick={noop}
						/>
					</Dropdown>
				</Padding>
			</Container>
			<Divider />
		</>
	);
};

export { SelectPanelActions, SelectPanelActionsProps };
