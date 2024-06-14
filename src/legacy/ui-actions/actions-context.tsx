/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentType, createContext, FC, useCallback, useMemo } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import {
	useContextActions,
	useHoverActions,
	primaryActions,
	secondaryActions
} from './contact-actions';
import { useAppDispatch } from '../hooks/redux';
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
	getPrimaryActions: MultipleContactsActionsProvider;
	getSecondaryActions: MultipleContactsActionsProvider;
}>({
	getContextActions: () => [],
	getHoverActions: () => [],
	getPrimaryActions: () => [],
	getSecondaryActions: () => []
});

export const ActionsContextProvider: FC<ACPProps & { selectedContacts: Contact[] }> = ({
	children,
	folderId,
	selectedIds,
	deselectAll,
	selectedContacts
}) => {
	const [t] = useTranslation();
	const ids = useMemo(() => Object.keys(selectedIds ?? []), [selectedIds]);
	const dispatch = useAppDispatch();
	const createSnackbar = useSnackbar();
	const createModal = useModal();
	const tags = useTags();
	const contextActions = useContextActions(folderId);
	const hoverActions = useHoverActions(folderId);

	const [
		contextActionsCallback,
		hoverActionsCallback,
		primaryActionsCallback,
		secondaryActionsCallback
	] = useMemo(
		() => [
			contextActions,
			hoverActions,
			primaryActions({
				folderId,
				t,
				dispatch,
				replaceHistory,
				createSnackbar,
				createModal,
				selectedIds,
				deselectAll
			}),
			secondaryActions({
				folderId,
				t,
				dispatch,
				replaceHistory,
				createSnackbar,
				createModal,
				selectedIds,
				deselectAll,
				tags,
				ids,
				selectedContacts
			})
		],
		[
			contextActions,
			hoverActions,
			folderId,
			t,
			dispatch,
			createSnackbar,
			createModal,
			selectedIds,
			deselectAll,
			tags,
			ids,
			selectedContacts
		]
	);

	const getContextActions = useCallback<SingleContactActionsProvider>(
		(item: Contact): ActionList => contextActionsCallback(item),
		[contextActionsCallback]
	);
	const getHoverActions = useCallback<SingleContactActionsProvider>(
		(item: Contact): ActionList => hoverActionsCallback(item),
		[hoverActionsCallback]
	);
	const getPrimaryActions = useCallback<MultipleContactsActionsProvider>(
		(): ActionList => primaryActionsCallback(),
		[primaryActionsCallback]
	);
	const getSecondaryActions = useCallback<MultipleContactsActionsProvider>(
		(): ActionList => secondaryActionsCallback(),
		[secondaryActionsCallback]
	);

	return (
		<ActionsContext.Provider
			value={{ getContextActions, getHoverActions, getPrimaryActions, getSecondaryActions }}
		>
			{children}
		</ActionsContext.Provider>
	);
};
