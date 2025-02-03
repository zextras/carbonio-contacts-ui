/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { useAppDispatch } from '../../../legacy/hooks/redux';
import {
	CommonContactGroupBoard,
	isContactGroupNameInvalid
} from '../../board/common-contact-group-board';
import { createContactGroup } from '../api/create-contact-group';
import { CONTACT_GROUPS_PATH, useRedirectToContactGroup } from '../navigation';

const NewContactGroupBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { pathname } = useLocation();
	const { closeBoard } = useBoardHooks();
	const createSnackbar = useSnackbar();

	const initialName = t('board.newContactGroup.name', 'New Group');
	const [folderId, setFolderId] = useState(FOLDERS.CONTACTS);
	const [nameValue, setNameValue] = useState(initialName);
	const dispatch = useAppDispatch();

	const [memberListEmails, setMemberListEmails] = useState<string[]>([]);

	const redirectTo = useRedirectToContactGroup();

	const onSave = useCallback(() => {
		dispatch(createContactGroup({ title: nameValue, members: memberListEmails, folderId })).then(
			(res) => {
				if ('error' in res) {
					createSnackbar({
						key: new Date().toLocaleString(),
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again')
					});
					return;
				}
				const contactGroup = res.payload;
				if (pathname.includes(CONTACT_GROUPS_PATH)) {
					const element = window.document.getElementById(contactGroup.id);
					if (element) {
						element.scrollIntoView({ block: 'end' });
					}
					redirectTo(contactGroup);
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
			}
		);
	}, [
		dispatch,
		nameValue,
		memberListEmails,
		folderId,
		pathname,
		createSnackbar,
		t,
		closeBoard,
		redirectTo
	]);

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
