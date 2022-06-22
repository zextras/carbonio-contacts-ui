/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { createContext, FC, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { SnackbarManagerContext, ModalManagerContext } from '@zextras/carbonio-design-system';
import { Contact } from '../types/contact';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { contextActions, hoverActions, primaryActions, secondaryActions } from './contact-actions';

type ACPProps = {
	folderId: string;
	selectedIds: Array<string>;
	deselectAll: () => void;
};

type ActionObj = {
	id: string;
	label: string;
	click: (event: MouseEvent) => void;
	icon: string;
	disabled: boolean;
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
	getContextActions: (i: Contact) => [],
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	getHoverActions: (i: Contact) => [],
	getPrimaryActions: () => [],
	getSecondaryActions: () => []
});

export const ActionsContextProvider: FC<ACPProps> = ({
	children,
	folderId,
	selectedIds,
	deselectAll
}) => {
	const [t] = useTranslation();

	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);
	const createModal = useContext(ModalManagerContext);

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
				selectedIds
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
				deselectAll
			})
		],
		[createModal, createSnackbar, dispatch, folderId, t, selectedIds, deselectAll]
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
