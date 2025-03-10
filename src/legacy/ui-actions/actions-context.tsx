/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { createContext, FC, useCallback, useMemo } from 'react';

import { useMultipleSelectionContactsActions } from './use-multiple-selection-contacts-actions';
import { ContactOrGroup } from '../types/contact';

type ACPProps = {
	folderId: string;
	selectedIds: Record<string, unknown>;
	deselectAll: () => void;
	children: React.ReactNode;
};

type ActionObj = {
	id: string;
	label: string;
	onClick: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
	customComponent: React.ReactNode;
	items: Array<ActionObj>;
	icon: string;
};

type ActionList = Array<ActionObj>;

type MultipleContactsActionsProvider = () => ActionList;

export const ActionsContext = createContext<{
	getSecondaryActions: MultipleContactsActionsProvider;
}>({
	getSecondaryActions: () => []
});

export const ActionsContextProvider: FC<ACPProps & { selectedContacts: ContactOrGroup[] }> = ({
	children,
	folderId,
	selectedIds,
	deselectAll,
	selectedContacts
}) => {
	const ids = useMemo(() => Object.keys(selectedIds ?? []), [selectedIds]);
	const secondaryActions = useMultipleSelectionContactsActions({
		folderId,
		deselectAll,
		selectedContacts,
		ids
	});
	const [secondaryActionsCallback] = useMemo(() => [secondaryActions], [secondaryActions]);

	const getSecondaryActions = useCallback<MultipleContactsActionsProvider>(
		// FIXME: return type of secondaryActionsCallback does not match ActionList
		(): ActionList => secondaryActionsCallback() as ActionList,
		[secondaryActionsCallback]
	);

	return (
		<ActionsContext.Provider value={{ getSecondaryActions }}>{children}</ActionsContext.Provider>
	);
};
