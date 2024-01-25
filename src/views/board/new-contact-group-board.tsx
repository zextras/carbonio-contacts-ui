/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { InputProps, useSnackbar } from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import CommonContactGroupBoard, { isContactGroupNameInvalid } from './common-contact-group-board';
import { client } from '../../network/client';

const NewContactGroupBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { updateBoard, closeBoard } = useBoardHooks();
	const createSnackbar = useSnackbar();

	const initialName = t('board.newContactGroup.name', 'New Group');
	const [nameValue, setNameValue] = useState(initialName);

	const [memberListEmails, setMemberListEmails] = useState<string[]>([]);

	const onNameChange = useCallback<NonNullable<InputProps['onChange']>>(
		(ev) => {
			setNameValue(ev.target.value);
			updateBoard({ title: ev.target.value });
		},
		[updateBoard]
	);

	const discardChanges = useCallback(() => {
		setNameValue(initialName);
		setMemberListEmails([]);
		updateBoard({ title: initialName });
	}, [initialName, updateBoard]);

	const onSave = useCallback(() => {
		client
			.createContactGroup(nameValue, memberListEmails)
			.then(() => {
				createSnackbar({
					key: new Date().toLocaleString(),
					type: 'success',
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
					type: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again')
				});
			});
	}, [closeBoard, createSnackbar, memberListEmails, t, nameValue]);

	return (
		<CommonContactGroupBoard
			onSave={onSave}
			discardChanges={discardChanges}
			nameValue={nameValue}
			onNameChange={onNameChange}
			memberListEmails={memberListEmails}
			isOnSaveDisabled={isContactGroupNameInvalid(nameValue)}
			setMemberListEmails={setMemberListEmails}
		/>
	);
};

export default NewContactGroupBoard;
