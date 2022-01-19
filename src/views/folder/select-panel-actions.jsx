/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useContext } from 'react';
import {
	Container,
	Dropdown,
	IconButton,
	Padding,
	Icon,
	Divider
} from '@zextras/carbonio-design-system';
import { map } from 'lodash';
import styled from 'styled-components';
import { ActionsContext } from '../../ui-actions/actions-context';

const ActionIcon = styled(Icon)`
	cursor: pointer;
`;

export default function SelectPanelActions({ deselectAll }) {
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
					<ActionIcon
						icon="ArrowBack"
						color="primary"
						size="large"
						onClick={deselectAll}
						data-testid="action-button-deselect-all"
					/>
					{/* Uncomment this line to show the `Select all` Button */}
					{/* <Button type='ghost' label='Select all' color='primary' /> */}
				</Container>
				<Container background="gray5" orientation="horizontal" mainAlignment="flex-end">
					{map(primaryActions, (action) => (
						<Padding left="extralarge" key={action.label}>
							<ActionIcon
								data-testid={`primary-action-button-${action.label}`}
								icon={action.icon}
								color="primary"
								onClick={(ev) => {
									if (ev) ev.preventDefault();
									action.click();
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
							click: (ev) => {
								if (ev) ev.preventDefault();
								action.click();
							}
						}))}
					>
						<IconButton
							size="medium"
							iconColor="primary"
							icon="MoreVertical"
							data-testid="secondary-actions-open-button"
						/>
					</Dropdown>
				</Padding>
			</Container>
			<Divider />
		</>
	);
}
