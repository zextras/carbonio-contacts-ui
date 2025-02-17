/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { createContext, FC, useCallback, useMemo } from 'react';

import { useContextActions, useHoverActions, useSecondaryActions } from './contact-actions';
import { Contact, ContactOrGroup } from '../types/contact';

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

type SingleContactActionsProvider = (item: Contact) => ActionList;
type MultipleContactsActionsProvider = () => ActionList;

export const ActionsContext = createContext<{
	getContextActions: SingleContactActionsProvider;
	getHoverActions: SingleContactActionsProvider;
	getSecondaryActions: MultipleContactsActionsProvider;
}>({
	getContextActions: () => [],
	getHoverActions: () => [],
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
	const contextActions = useContextActions(folderId);
	const hoverActions = useHoverActions(folderId);
	const secondaryActions = useSecondaryActions({ folderId, deselectAll, selectedContacts, ids });
	const [contextActionsCallback, hoverActionsCallback, secondaryActionsCallback] = useMemo(
		() => [contextActions, hoverActions, secondaryActions],
		[contextActions, hoverActions, secondaryActions]
	);

	const getContextActions = useCallback<SingleContactActionsProvider>(
		// FIXME: return type of contextActionsCallback does not match ActionList
		(item: Contact): ActionList => contextActionsCallback(item) as ActionList,
		[contextActionsCallback]
	);
	const getHoverActions = useCallback<SingleContactActionsProvider>(
		// FIXME: return type of hoverActionsCallback does not match ActionList
		(item: Contact): ActionList => hoverActionsCallback(item) as ActionList,
		[hoverActionsCallback]
	);
	const getSecondaryActions = useCallback<MultipleContactsActionsProvider>(
		// FIXME: return type of secondaryActionsCallback does not match ActionList
		(): ActionList => secondaryActionsCallback() as ActionList,
		[secondaryActionsCallback]
	);

	return (
		<ActionsContext.Provider value={{ getContextActions, getHoverActions, getSecondaryActions }}>
			{children}
		</ActionsContext.Provider>
	);
};
