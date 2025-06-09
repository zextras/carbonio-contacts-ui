/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, ReactElement, FC } from 'react';

import {
	Container,
	Dropdown,
	IconButton,
	Padding,
	Divider,
	DropdownItem
} from '@zextras/carbonio-design-system';
import { map, noop } from 'lodash';

import { ContactOrGroup } from 'legacy/types/contact';
import { useMultipleSelectionContactsActions } from 'legacy/ui-actions/use-multiple-selection-contacts-actions';

interface SelectPanelActionsProps {
	folderId: string;
	selectedIds: Record<string, unknown>;
	selectedContacts: ContactOrGroup[];
	deselectAll: () => void;
}

const SelectPanelActions: FC<SelectPanelActionsProps> = ({
	folderId,
	selectedContacts,
	selectedIds,
	deselectAll
}): ReactElement => {
	const ids = useMemo(() => Object.keys(selectedIds ?? []), [selectedIds]);
	const secondaryActions = useMultipleSelectionContactsActions({
		folderId,
		deselectAll,
		selectedContacts,
		ids
	});

	const dropDownItems = useMemo(
		() =>
			map(secondaryActions, (action) => ({
				id: action.label,
				key: action.id,
				icon: action.icon,
				label: action.label,
				onClick: (ev: React.SyntheticEvent<HTMLElement> | KeyboardEvent): void => {
					if (ev) ev.preventDefault();
					action.onClick(ev);
				},
				customComponent: action.customComponent,
				items: action.items
			})),
		[secondaryActions]
	);

	return (
		<>
			<Container
				background="gray5"
				height="3rem"
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
				<Padding left="extrasmall">
					<Dropdown
						placement="right-end"
						data-testid="secondary-actions-dropdown"
						items={dropDownItems as Array<DropdownItem>}
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

export { SelectPanelActions, type SelectPanelActionsProps };
