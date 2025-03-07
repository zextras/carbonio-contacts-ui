/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { applyMultiTag } from './tag-actions';
import { generateClickableAction } from '../../actions/generate-clickable-action';
import { FOLDERS } from '../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../carbonio-ui-commons/helpers/folders';
import { useTags } from '../../carbonio-ui-commons/store/zustand/tags';
import { MakeOptional } from '../../types';
import { useActionDeleteContacts } from '../../views/contacts/actions/delete-contacts';
import { useActionTrashContacts } from '../../views/contacts/actions/trash-contacts';
import { ContactOrGroup } from '../types/contact';

type OptionallyClickableAction = MakeOptional<DSAction, 'onClick'>;

type SecondaryContactActionsFn = () => Array<OptionallyClickableAction>;

type SecondaryActionsProps = {
	folderId: string;
	deselectAll: () => void;
	selectedContacts: Array<ContactOrGroup>;
	ids: Array<string>;
};
export const useMultipleSelectionActions = ({
	folderId,
	deselectAll,
	selectedContacts,
	ids
}: SecondaryActionsProps): SecondaryContactActionsFn => {
	const [t] = useTranslation();
	const tags = useTags();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();

	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return () => [
			...(deleteAction.canExecute(selectedContacts)
				? [generateClickableAction(deleteAction, selectedContacts)]
				: []),

			applyMultiTag({
				t,
				tags,
				ids,
				itemsToTag: selectedContacts,
				deselectAll,
				folderId
			})
		];
	}
	return () => [
		...(trashAction.canExecute(selectedContacts)
			? [generateClickableAction(trashAction, selectedContacts)]
			: []),
		applyMultiTag({
			t,
			tags,
			ids,
			itemsToTag: selectedContacts,
			deselectAll,
			folderId
		})
	];
};
