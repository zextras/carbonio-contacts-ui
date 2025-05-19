/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { addContactsToStore } from '../../../legacy/store/contacts';
import {
	CommonContactGroupBoard,
	isContactGroupNameInvalid
} from '../../board/common-contact-group-board';
import { createContactGroup } from '../api/create-contact-group';
import { CONTACT_GROUPS_PATH } from '../navigation';
import { getFolderFromContactGroup } from '../utils';

const NewContactGroupBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { pathname } = useLocation();
	const { closeBoard } = useBoardHooks();
	const createSnackbar = useSnackbar();
	const navigate = useNavigate();
	const initialName = t('board.newContactGroup.name', 'New Group');
	const [folderId, setFolderId] = useState(FOLDERS.CONTACTS);
	const [nameValue, setNameValue] = useState(initialName);

	const [memberListEmails, setMemberListEmails] = useState<string[]>([]);

	const onSave = useCallback(() => {
		createContactGroup({ title: nameValue, members: memberListEmails, folderId })
			.then((contactGroup) => {
				addContactsToStore([contactGroup]);
				const folder = getFolderFromContactGroup(contactGroup);
				if (pathname.includes(CONTACT_GROUPS_PATH)) {
					const element = window.document.getElementById(contactGroup.id);
					if (element) {
						element.scrollIntoView({ block: 'end' });
					}
					folder &&
						navigate(`/contacts/folder/${folder.id}/${CONTACT_GROUPS_PATH}/${contactGroup.id}`);
				}
				createSnackbar({
					key: new Date().toLocaleString(),
					severity: 'success',
					label: t(
						'board.newContactGroup.snackbar.contact_group_created',
						'Contact group successfully created'
					)
				});
				closeBoard();
			})
			.catch(() => {
				createSnackbar({
					key: new Date().toLocaleString(),
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again')
				});
			});
	}, [nameValue, memberListEmails, folderId, pathname, createSnackbar, t, closeBoard, navigate]);

	return (
		<CommonContactGroupBoard
			onSave={onSave}
			nameValue={nameValue}
			memberListEmails={memberListEmails}
			isOnSaveDisabled={isContactGroupNameInvalid(nameValue)}
			setMemberListEmails={setMemberListEmails}
			initialFolderId={folderId}
			setFolderId={setFolderId}
			initialNameValue={initialName}
			initialMemberListEmails={[]}
			setNameValue={setNameValue}
		/>
	);
};

export default NewContactGroupBoard;
