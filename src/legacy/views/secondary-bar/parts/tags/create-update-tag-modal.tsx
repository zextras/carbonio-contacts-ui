/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';

import { Input, Padding, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { changeTagColor, createTag, renameTag } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { ItemType } from './types';
import {
	ColorSelect,
	ColorSelectProps
} from '../../../../../carbonio-ui-commons/components/select/color-select';
import { useAppDispatch } from '../../../../hooks/redux';
import { contactAction } from '../../../../store/actions/contact-action';
import { Contact } from '../../../../types/contact';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';

type ComponentProps = {
	onClose: () => void;
	editMode?: boolean;
	tag?: ItemType;
	contact?: Contact;
};
const NonSupportedCharacters = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
const CreateUpdateTagModal: FC<ComponentProps> = ({
	onClose,
	editMode = false,
	tag,
	contact
}): ReactElement => {
	const createSnackbar = useSnackbar();
	const [t] = useTranslation();
	const [name, setName] = useState(tag?.name || '');
	const [color, setColor] = useState(tag?.color || 0);
	const dispatch = useAppDispatch();
	const title = useMemo(
		() =>
			editMode
				? t('label.edit_tag_name', { name: tag?.name, defaultValue: 'Edit "{{name}}" tag' })
				: t('label.create_tag', 'Create a new Tag'),
		[editMode, t, tag?.name]
	);
	const label = useMemo(() => t('label.tag_name', 'Tag name'), [t]);
	const handleColorChange = useCallback<ColorSelectProps['onChange']>(
		(c) => setColor(Number(c)),
		[]
	);
	const handleNameChange = useCallback((ev) => setName(ev.target.value), []);

	const showMaxLengthWarning = useMemo(() => name.length >= 128, [name]);
	const showSpecialCharWarning = useMemo(() => NonSupportedCharacters.test(name), [name]);

	const showWarning = useMemo(
		() => showMaxLengthWarning || showSpecialCharWarning,
		[showMaxLengthWarning, showSpecialCharWarning]
	);
	const disabled = useMemo(() => name === '' || showWarning, [name, showWarning]);

	const applyNewlyCreatedTag = useCallback(
		({ id, tagName }) => {
			dispatch(
				contactAction({
					op: 'tag',
					contactsIDs: [id],
					tagName
				})
			) // eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then(() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						hideButton: true,
						severity: 'info',
						label: t('snackbar.tag_applied', {
							tag: tagName,
							defaultValue: '"{{tag}}" tag applied'
						}),
						autoHideTimeout: 3000
					});
				})
				.catch(() => {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: `tag`,
						replace: true,
						severity: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				});
		},
		[createSnackbar, dispatch, t]
	);
	const onCreate = useCallback(
		() =>
			createTag({ name, color }).then((res: any) => {
				if (res.tag) {
					if (contact) {
						applyNewlyCreatedTag({ id: contact.id, tagName: res.tag?.[0]?.name });
					} else {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						createSnackbar({
							key: `new-tag`,
							replace: true,
							severity: 'info',
							label: t('messages.snackbar.tag_created', {
								name,
								defaultValue: 'Tag {{name}} successfully created'
							}),
							autoHideTimeout: 3000,
							hideButton: true
						});
					}
				}
				onClose();
			}),
		[name, color, onClose, contact, applyNewlyCreatedTag, createSnackbar, t]
	);
	const onUpdate = useCallback(() => {
		Promise.all([renameTag(`${tag?.id}`, name), changeTagColor(`${tag?.id}`, Number(color))])
			.then(() => {
				onClose();
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				createSnackbar({
					key: `update-tag`,
					replace: true,
					severity: 'info',
					label: t('messages.snackbar.tag_updated', 'Tag successfully updated'),
					autoHideTimeout: 3000,
					hideButton: true
				});
			})
			.catch(() => {
				onClose();
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				createSnackbar({
					key: `update-tag-error`,
					replace: true,
					severity: 'error',
					label: t(
						'messages.snackbar.tag_not_updated',
						'Something went wrong, tag not updated. Please try again.'
					),
					autoHideTimeout: 3000,
					hideButton: true
				});
			});
	}, [color, createSnackbar, name, onClose, t, tag]);

	return (
		<>
			<ModalHeader onClose={onClose} title={title} />
			<Input
				label={label}
				value={name}
				onChange={handleNameChange}
				backgroundColor="gray5"
				textColor={showWarning ? 'error' : 'text'}
				hasError={showWarning}
			/>

			{showWarning && (
				<Padding all="small">
					{showMaxLengthWarning && (
						<Text size="extrasmall" color="error" overflow="break-word">
							{t('label.tag_max_length', 'Max 128 characters are allowed')}
						</Text>
					)}
					{showSpecialCharWarning && (
						<Text size="extrasmall" color="error" overflow="break-word">
							{t('label.no_special_char_allowed', 'Name should not contain any special character')}
						</Text>
					)}
				</Padding>
			)}

			<Padding top="small" />
			<ColorSelect
				onChange={handleColorChange}
				label={t('label.select_color', 'Select Color')}
				defaultColor={color}
			/>
			<ModalFooter
				onConfirm={editMode ? onUpdate : onCreate}
				label={editMode ? t('label.edit', 'edit') : t('label.create', 'Create')}
				disabled={disabled}
			/>
		</>
	);
};

export default CreateUpdateTagModal;
