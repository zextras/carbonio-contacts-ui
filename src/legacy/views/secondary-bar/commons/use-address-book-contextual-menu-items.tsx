/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import { Action } from '@zextras/carbonio-design-system';

import { useActionDeleteAddressBook } from '../../../../actions/delete-address-book';
import { useActionEmptyAddressBook } from '../../../../actions/empty-address-book';
import { useActionEmptyTrash } from '../../../../actions/empty-trash';
import { useActionExportAddressBook } from '../../../../actions/export-address-book';
import { useActionTrashAddressBook } from '../../../../actions/trash-address-book';
import { UIAction } from '../../../../actions/types';
import { Folder } from '../../../../carbonio-ui-commons/types/folder';

const generateMenuAction = (uiAction: UIAction<Folder, never>, addressBook: Folder): Action =>
	({
		id: uiAction.id,
		icon: uiAction.icon,
		label: uiAction.label,
		onClick: (e): void => {
			e.stopPropagation();
			uiAction.execute(addressBook);
		}
	}) satisfies Action;

export const useAddressBookContextualMenuItems = (addressBook: Folder): Array<Action> => {
	const deleteAction = useActionDeleteAddressBook();
	const trashAction = useActionTrashAddressBook();
	const emptyAddressBookAction = useActionEmptyAddressBook();
	const emptyTrashAction = useActionEmptyTrash();
	const exportAction = useActionExportAddressBook();

	return useMemo(() => {
		const result: Array<Action> = [];

		deleteAction.canExecute(addressBook) &&
			result.push(generateMenuAction(deleteAction, addressBook));
		trashAction.canExecute(addressBook) &&
			result.push(generateMenuAction(trashAction, addressBook));
		emptyAddressBookAction.canExecute(addressBook) &&
			result.push(generateMenuAction(emptyAddressBookAction, addressBook));
		emptyTrashAction.canExecute(addressBook) &&
			result.push(generateMenuAction(emptyTrashAction, addressBook));
		exportAction.canExecute(addressBook) &&
			result.push(generateMenuAction(exportAction, addressBook));

		return result;
	}, [
		addressBook,
		deleteAction,
		emptyAddressBookAction,
		emptyTrashAction,
		exportAction,
		trashAction
	]);
};
