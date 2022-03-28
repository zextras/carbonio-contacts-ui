/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
	Container,
	Select,
	Input,
	Text,
	Padding,
	Row,
	Divider
} from '@zextras/carbonio-design-system';
import { isEmpty, reduce, filter, first } from 'lodash';
import ModalFooter from '../../commons/modal-footer';
import { ModalHeader } from '../../commons/modal-header';
import { folderAction } from '../../../../store/actions/folder-action';
import { extractFolders } from '../../../../utils/helpers';
import ColorSelect from '../../../../commons/ColorSelect';
import { ShareFolderProperties } from './share-folder-properties';

const EditDefaultModal = ({
	currentFolder,
	accordions,
	setModal,
	dispatch,
	t,
	setActiveModal,
	createSnackbar
}) => {
	const [inputValue, setInputValue] = useState('');
	const [parent, setParent] = useState('');
	const folders = useMemo(() => extractFolders(accordions), [accordions]);
	const [folderColor, setFolderColor] = useState(currentFolder.color);
	const defaultSelection = useMemo(
		() =>
			first(
				filter(folders, (folder) => {
					if (currentFolder.parent === '1') {
						return false;
					}
					return folder.id === currentFolder.parent;
				})
			),
		[currentFolder.parent, folders]
	);

	const items = useMemo(() => {
		let accItem = [];
		if (currentFolder.parent === '1' && currentFolder.level > 2) {
			accItem = [
				{
					label: t('folder.modal.edit.body.item.empty', 'No path available'),
					value: '1',
					customComponent: (
						<Text>{t('folder.modal.edit.body.item.empty', 'No path available')}</Text>
					),
					disabled: true
				}
			];
		}
		if (currentFolder.parent !== '1') {
			accItem = [
				{
					label: t('label.root', 'root'),
					value: '1'
				}
			];
		}

		return reduce(
			folders,
			(acc, v) => {
				if (
					v.id === currentFolder.id ||
					v.id === currentFolder.parent ||
					v.parent === '3' ||
					(v.level + currentFolder.level > 3 && v.level !== 0)
				) {
					return acc;
				}
				return [
					...acc,
					{
						label: v.label,
						value: v.id
					}
				];
			},
			accItem
		);
	}, [currentFolder.level, currentFolder.id, currentFolder.parent, folders, t]);

	useMemo(() => {
		setParent(currentFolder.parent);
		setInputValue(currentFolder.label);
	}, [currentFolder.parent, currentFolder.label]);

	const disabled = useMemo(
		() =>
			currentFolder.label === inputValue &&
			currentFolder.parent === parent &&
			currentFolder.color === folderColor,
		[currentFolder, inputValue, parent, folderColor]
	);

	const onConfirm = useCallback(() => {
		dispatch(
			folderAction({
				folder: currentFolder,
				name: inputValue,
				l: parent,
				op: 'update',
				color: folderColor
			})
		).then((res) => {
			if (res.type.includes('fulfilled')) {
				createSnackbar({
					key: `edit`,
					replace: true,
					type: 'info',
					hideButton: true,
					label: t('snackbar.folder_edited', 'Address book edited successfully'),
					autoHideTimeout: 3000
				});
			} else {
				createSnackbar({
					key: `edit`,
					replace: true,
					type: 'error',
					hideButton: true,
					label: t('label.error_try_again', 'Something went wrong, please try again'),
					autoHideTimeout: 3000
				});
			}
		});
		setModal('');
	}, [dispatch, currentFolder, inputValue, parent, setModal, folderColor, createSnackbar, t]);

	const onClose = useCallback(() => setModal(''), [setModal]);

	const onInputChange = useCallback((e) => setInputValue(e.target.value), []);

	const onSelectChange = useCallback((e) => setParent(e), []);
	const showShared = useMemo(
		() => !isEmpty(currentFolder?.sharedWith) && !currentFolder.owner,
		[currentFolder?.sharedWith, currentFolder.owner]
	);

	const nameInputDisabled = useMemo(
		() => currentFolder.id === '13' || currentFolder.id === '3' || currentFolder.id === '7',
		[currentFolder.id]
	);
	return (
		<>
			<Container
				padding={{ vertical: 'medium', horizontal: 'small' }}
				mainAlignment="center"
				crossAlignment="flex-start"
				height="fit"
			>
				<ModalHeader
					onClose={onClose}
					title={`${t('label.edit_folder_properties', {
						name: currentFolder.label,
						defaultValue: "Edit {{name}}'s properties"
					})}`}
				/>

				<Container
					orientation="horizontal"
					mainAlignment="center"
					crossAlignment="flex-start"
					padding={{ vertical: 'small' }}
				>
					<Input
						label={t('modal.address_book_name', 'Address book name')}
						backgroundColor="gray5"
						defaultValue={currentFolder.label}
						onChange={onInputChange}
						disabled={nameInputDisabled}
					/>
				</Container>
				<Container>
					{items && (
						<Select
							items={items}
							background="gray5"
							label={t('modal.destination', 'Destination folder')}
							onChange={onSelectChange}
							defaultSelection={
								defaultSelection
									? {
											label: defaultSelection.label,
											value: defaultSelection.id
									  }
									: {
											label: 'Root',
											value: '1'
									  }
							}
							disablePortal
						/>
					)}
				</Container>
				<Padding top="small" />
				<ColorSelect
					onChange={(color) => setFolderColor(Number(color))}
					t={t}
					label="Select Color"
					defaultColor={folderColor}
				/>
				<Padding top="small" />
				<Container orientation="horizontal" mainAlignment="center" crossAlignment="flex-start">
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'small', bottom: 'small' }}
						width="48%"
						style={{ minHeight: '48px', maxWidth: 'calc(100% - 48px)' }}
					>
						<Text color="secondary">{t('label.type', 'Type')}</Text>
						<Row
							takeAvailableSpace
							wrap="nowrap"
							height="fit"
							width="fill"
							orientation="horizontal"
							mainAlignment="flex-start"
							padding={{ top: 'small' }}
						>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<Text size="medium" overflow="break-word">
									{t('folder.type', 'Contact Folder')}
								</Text>
							</Row>
						</Row>
					</Container>
					<Padding horizontal="small" />
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'small', bottom: 'small' }}
						width="48%"
						style={{ minHeight: '48px', maxWidth: 'calc(100% - 48px)' }}
					>
						<Text color="secondary">{t('label.contacts', 'Contacts')}</Text>
						<Row
							takeAvailableSpace
							wrap="nowrap"
							height="fit"
							width="fill"
							orientation="horizontal"
							mainAlignment="flex-start"
							padding={{ top: 'extrasmall' }}
						>
							<Row takeAvailableSpace mainAlignment="flex-start">
								<Text size="medium" overflow="break-word">
									{currentFolder.itemsCount}
								</Text>
							</Row>
						</Row>
					</Container>
				</Container>
				<Divider />
				<Padding vertical="small" />

				{showShared && (
					<ShareFolderProperties
						folder={currentFolder}
						setCurrentFolder={() => null}
						createSnackbar={createSnackbar}
						setModal={setModal}
						setActiveModal={setActiveModal}
					/>
				)}

				<ModalFooter
					onConfirm={onConfirm}
					label={t('label.edit', 'Edit')}
					t={t}
					secondaryAction={() => setActiveModal('share')}
					secondaryLabel="Add Share"
					disabled={disabled}
					secondaryBtnType="outlined"
					secondaryColor="primary"
				/>
			</Container>
		</>
	);
};

export default EditDefaultModal;
