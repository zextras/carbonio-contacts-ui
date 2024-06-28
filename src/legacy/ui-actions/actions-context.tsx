/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentType, createContext, FC, useCallback, useMemo } from 'react';

import { useContextActions, useHoverActions, useSecondaryActions } from './contact-actions';
import { Contact } from '../types/contact';

type ACPProps = {
	folderId: string;
	selectedIds: Array<string>;
	deselectAll: () => void;
};

type ActionObj = {
	id: string;
	label: string;
	onClick: (e: React.SyntheticEvent<HTMLElement> | KeyboardEvent) => void;
	customComponent: ComponentType;
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

export const ActionsContextProvider: FC<ACPProps & { selectedContacts: Contact[] }> = ({
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
		(item: Contact): ActionList => contextActionsCallback(item),
		[contextActionsCallback]
	);
	const getHoverActions = useCallback<SingleContactActionsProvider>(
		(item: Contact): ActionList => hoverActionsCallback(item),
		[hoverActionsCallback]
	);
	const getSecondaryActions = useCallback<MultipleContactsActionsProvider>(
		(): ActionList => secondaryActionsCallback(),
		[secondaryActionsCallback]
	);

	return (
		<ActionsContext.Provider value={{ getContextActions, getHoverActions, getSecondaryActions }}>
			{children}
		</ActionsContext.Provider>
	);
};
