/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useMemo } from 'react';

import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import { getAction } from '@zextras/carbonio-shell-ui';
import { every, includes, isEmpty, noop, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { useActionDeleteContacts } from '../../../actions/delete-contacts';
import { useActionMoveContacts } from '../../../actions/move-contacts';
import { useActionTrashContacts } from '../../../actions/trash-contacts';
import { UIAction } from '../../../actions/types';
import { ZIMBRA_STANDARD_COLORS } from '../../../carbonio-ui-commons/constants';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts, isTrash } from '../../../carbonio-ui-commons/helpers/folders';
import { useTags } from '../../../carbonio-ui-commons/store/zustand/tags';
import { Contact } from '../../../legacy/types/contact';

export const useTagsAction = (contact: Contact): UIAction<Contact, Contact> => {
	const tagsFromStore = useTags();
	const triggerSearch = noop;

	// originally in contact-preview-content.jsx
	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc, v) => {
					if (includes(contact.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
							label: v.name,
							onClick: () => triggerSearch(v),
							customComponent: (
								<Row takeAvailableSpace mainAlignment="flex-start">
									<Row takeAvailableSpace mainAlignment="space-between">
										<Row mainAlignment="flex-end">
											<Padding right="small">
												<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex} />
											</Padding>
										</Row>
										<Row takeAvailableSpace mainAlignment="flex-start">
											<Text>{v.name}</Text>
										</Row>
									</Row>
								</Row>
							)
						});
					return acc;
				},
				[] as Array<unknown>
			),
		[contact.tags, tagsFromStore, triggerSearch]
	);
	const tagIcon = useMemo(() => (tags.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tags]);

	const onTagClick = useCallback(() => {
		contact?.tags && triggerSearch(tagsFromStore?.[contact?.tags[0]]);
	}, [contact.tags, triggerSearch, tagsFromStore]);

	const shouldDisplayTagIcon = useCallback(
		(): boolean =>
			contact.tags !== undefined &&
			contact.tags?.length !== 0 &&
			every(contact.tags, (tn) => tn !== ''),
		[contact.tags]
	);

	return {
		id: `tag`,
		icon: tagIcon,
		label: '',
		execute: onTagClick,
		canExecute: shouldDisplayTagIcon
	};
};

export const useMoveAction = (contact: Contact): UIAction<Contact, Contact> => {
	const [t] = useTranslation();
	const contactsMoveAction = useActionMoveContacts();
	const onMove = useCallback(() => {
		contactsMoveAction.execute({ contacts: [contact] });
	}, [contact, contactsMoveAction]);
	const isInTrash = isTrash(contact.parent);
	const moveActionLabel = isInTrash ? t('label.restore', 'Restore') : t('label.move', 'Move');
	const moveActionIcon = isInTrash ? 'RestoreOutline' : 'MoveOutline';
	return {
		id: 'move',
		icon: moveActionIcon,
		label: moveActionLabel,
		execute: onMove,
		canExecute: () => true
	};
};

export const useEditAction = (contact: Contact): UIAction<Contact, Contact> => {
	const [t] = useTranslation();
	const folderId = contact.parent;
	const navigate = useNavigate();
	const contactInternalId = contact.id;
	const onEdit = useCallback(
		() => navigate(`../folder/${folderId}/edit/${contactInternalId}`),
		[contactInternalId, folderId, navigate]
	);
	return {
		id: 'edit',
		icon: 'EditOutline',
		label: t('label.edit'),
		execute: onEdit,
		canExecute: () => !isTrash(contact.parent)
	};
};

export const useDeleteAction = (contact: Contact): UIAction<Contact, Contact> => {
	const folderId = contact.parent;
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();
	const navigate = useNavigate();
	const [t] = useTranslation();
	const onDelete = useCallback(() => {
		navigate(`/folder/${folderId}/contacts/${contact.id}`);
		if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
			deleteAction.execute([contact]);
		} else trashAction.execute([contact]);
	}, [navigate, folderId, contact, trashAction, deleteAction]);
	const isInTrash = isTrash(contact.parent);
	const deleteActionLabel = isInTrash
		? t('tooltip.list_trash.deletePermanently', 'Delete contact permanently')
		: t('label.delete', 'Delete');

	return {
		id: 'delete',
		icon: 'Trash2Outline',
		label: deleteActionLabel,
		execute: onDelete,
		canExecute: () => true
	};
};

export const useSendMailAction = (contact: Contact): UIAction<Contact, Contact> => {
	const [t] = useTranslation();
	const onMail = useCallback(() => {
		const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
		if (available && mailTo) {
			mailTo.execute(contact);
		}
	}, [contact]);
	return {
		id: 'send',
		icon: 'MailModOutline',
		label: t('action.mail', 'Send e-mail'),
		execute: onMail,
		canExecute: () => !isTrash(contact.parent),
		disabled: isEmpty(contact?.email)
	};
};
