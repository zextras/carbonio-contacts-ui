/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentType, createContext, FC, useCallback, useMemo } from 'react';

import { useModal, useSnackbar } from '@zextras/carbonio-design-system';
import { replaceHistory, useTags } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { contextActions, hoverActions, primaryActions, secondaryActions } from './contact-actions';
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

type GetActionsFunction = (item: any) => ActionList;

export const ActionsContext = createContext<{
	getContextActions: GetActionsFunction;
	getHoverActions: GetActionsFunction;
	getPrimaryActions: GetActionsFunction;
	getSecondaryActions: GetActionsFunction;
}>({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getContextActions: () => [],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	const [
		contextActionsCallback,
		hoverActionsCallback,
		primaryActionsCallback,
		secondaryActionsCallback
	] = useMemo(
		() => [
			contextActions({
				folderId,
				t,
				dispatch,
				replaceHistory,
				createSnackbar,
				createModal,
				selectedIds,
				tags
			}),
			hoverActions({
				folderId,
				t,
				dispatch,
				replaceHistory,
				createSnackbar,
				createModal,
				selectedIds
			}),
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
			folderId,
			t,
			dispatch,
			createSnackbar,
			createModal,
			selectedIds,
			tags,
			deselectAll,
			selectedContacts,
			ids
		]
	);

	const getContextActions = useCallback<GetActionsFunction>(
		(item: Contact): ActionList => contextActionsCallback(item),
		[contextActionsCallback]
	);
	const getHoverActions = useCallback<GetActionsFunction>(
		(item: Contact): ActionList => hoverActionsCallback(item),
		[hoverActionsCallback]
	);
	const getPrimaryActions = useCallback<GetActionsFunction>(
		(): ActionList => primaryActionsCallback(),
		[primaryActionsCallback]
	);
	const getSecondaryActions = useCallback<GetActionsFunction>(
		(): ActionList => secondaryActionsCallback(),
		[secondaryActionsCallback]
	);

	return (
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		<ActionsContext.Provider
			value={{ getContextActions, getHoverActions, getPrimaryActions, getSecondaryActions }}
		>
			{children}
		</ActionsContext.Provider>
	);
};
