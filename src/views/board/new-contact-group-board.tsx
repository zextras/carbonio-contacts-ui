/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { InputProps, useSnackbar, ChipAction } from '@zextras/carbonio-design-system';
import { useBoardHooks } from '@zextras/carbonio-shell-ui';
import { remove, uniqBy } from 'lodash';
import { useTranslation } from 'react-i18next';

import CommonContactGroupBoard, {
	EnhancedChipItem,
	isContactGroupNameInvalid
} from './common-contact-group-board';
import { client } from '../../network/client';

const NewContactGroupBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { updateBoard, closeBoard } = useBoardHooks();
	const createSnackbar = useSnackbar();

	const initialName = t('board.newContactGroup.name', 'New Group');
	const [nameValue, setNameValue] = useState(initialName);

	const [contactInputValue, setContactInputValue] = useState<Array<EnhancedChipItem>>([]);

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
		setContactInputValue([]);
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

	const contactInputOnChange = (
		newContactInputValue: Array<
			Omit<EnhancedChipItem, 'duplicated'> & { duplicated?: Pick<EnhancedChipItem, 'duplicated'> }
		>
	): void => {
		// TODO item are filtered to be uniq, because the ContactInput filters out, dropdown duplicated, only visually
		//  but provide that item inside onChange parameter
		const uniqNewContactInputValue = uniqBy(newContactInputValue, (value) => value.email);

		const uniqNewContactInputValueWithActions = uniqNewContactInputValue.map((value) => {
			const duplicated = memberListEmails.includes(value.email);

			const duplicatedChipAction: ChipAction = {
				id: 'duplicated',
				color: 'error',
				type: 'icon',
				icon: 'AlertCircle'
			};

			const duplicatedChipActionNotPresent = !value.actions?.find(
				(action) => action.id === 'duplicated'
			);

			const actions = [
				...(value.actions ?? []),
				...(duplicated && duplicatedChipActionNotPresent ? [duplicatedChipAction] : [])
			];

			return {
				...value,
				duplicated,
				actions
			};
		});

		setContactInputValue(uniqNewContactInputValueWithActions);
	};

	const removeItem = useCallback(
		(email: string) => {
			const newMemberListEmails = memberListEmails.filter((value) => value !== email);
			setMemberListEmails(newMemberListEmails);
			setContactInputValue((prevState) =>
				prevState.map((value) => {
					const duplicated = newMemberListEmails.includes(value.email);

					const actions = [...(value.actions ?? [])];
					if (!duplicated && value.duplicated) {
						remove(actions, (action) => action.id === 'duplicated');
					}

					return {
						...value,
						duplicated,
						actions
					};
				})
			);
		},
		[memberListEmails]
	);

	const contactInputIconAction = useCallback(() => {
		const valid: typeof contactInputValue = [];
		const invalid: typeof contactInputValue = [];

		contactInputValue.forEach((value) => {
			if (value.error || value.duplicated) {
				invalid.push(value);
			} else {
				valid.push(value);
			}
		});

		setContactInputValue(invalid);
		setMemberListEmails((prevState) => [...prevState, ...valid.map((value) => value.email)]);
	}, [contactInputValue]);

	return (
		<CommonContactGroupBoard
			onSave={onSave}
			discardChanges={discardChanges}
			nameValue={nameValue}
			onNameChange={onNameChange}
			contactInputValue={contactInputValue}
			contactInputOnChange={contactInputOnChange}
			contactInputIconAction={contactInputIconAction}
			removeItem={removeItem}
			memberListEmails={memberListEmails}
			isOnSaveDisabled={isContactGroupNameInvalid(nameValue)}
		/>
	);
};

export default NewContactGroupBoard;
