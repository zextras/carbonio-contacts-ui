/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { SyntheticEvent } from 'react';

import { CreateModalFn, CreateSnackbarFn } from '@zextras/carbonio-design-system';
import { ErrorSoapBodyResponse, FOLDERS } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';

import { FolderAction } from '../../../../carbonio-ui-commons/types/actions';
import { exportContacts } from '../../../store/actions/export-address-book';
import { folderAction } from '../../../store/actions/folder-action';
import { getFolder } from '../../../store/actions/get-folder';
import { AppDispatch, StoreProvider } from '../../../store/redux';
import { ContactsFolder, ExportContactsResponse } from '../../../types/contact';
import { FolderActionsType } from '../../../types/folder';
import { importContacts } from '../parts/import-contacts/import-contacts';
import { SharesInfoModal } from '../shares-info-modal';

export const actionsRetriever = (
	folder: ContactsFolder,
	setAction: (action: string) => void,
	setCurrentFolder: (folder: ContactsFolder) => void,
	t: TFunction,
	dispatch: AppDispatch,
	createModal: CreateModalFn,
	createSnackbar: CreateSnackbarFn,
	trashFolder: ContactsFolder
): Array<FolderAction> => [
	{
		id: FolderActionsType.NEW,
		icon: 'AddressBookOutline',
		label: t('label.new_address_book', 'New address book'),
		onClick: (): void => {
			setAction(FolderActionsType.NEW);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.MOVE,
		icon: 'MoveOutline',
		label: t('folder.action.move', 'Move'),
		onClick: (): void => {
			setAction(FolderActionsType.MOVE);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.SHARE,
		icon: 'ShareOutline',
		label: t('folder.share_folder', 'Share address book'),
		onClick: (): void => {
			setAction(FolderActionsType.SHARE);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.EMPTY,
		icon: folder.id === FOLDERS.TRASH ? 'DeletePermanentlyOutline' : 'EmptyFolderOutline',
		label:
			folder.id === FOLDERS.TRASH
				? t('folder.action.empty.trash', 'Empty trash')
				: t('folder.action.empty.folder', 'Empty address book'),
		disabled: folder.id === FOLDERS.TRASH ? false : !folder.itemsCount,
		onClick: (): void => {
			setAction(FolderActionsType.EMPTY);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.EDIT,
		icon: 'Edit2Outline',
		label: t('folder.action.edit', 'Edit address book'),
		onClick: (): void => {
			setAction(FolderActionsType.EDIT);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.DELETE,
		icon: 'Trash2Outline',
		label:
			folder?.path?.includes?.(`/${trashFolder?.label}/`) && folder?.id !== FOLDERS.TRASH
				? t('folder.action.delete_permanently', 'Delete address book permanently')
				: t('folder.action.delete', 'Delete address book'),
		onClick: (): void => {
			setAction(FolderActionsType.DELETE);
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.REMOVE_FROM_LIST,
		icon: 'CloseOutline',
		label: t('share.remove_from_this_list', 'Remove from this list'),
		onClick: (e: SyntheticEvent): void => {
			if (e) {
				e.stopPropagation();

				dispatch(folderAction({ folder, l: folder.parent, op: 'delete' })).then((res) => {
					if (res.type.includes('fulfilled')) {
						createSnackbar({
							key: `edit`,
							replace: true,
							type: 'info',
							hideButton: true,
							label: t('share.share_removed_succesfully', 'Shared removed successfuly'),
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
			}
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.SHARE_INFO,
		icon: 'InfoOutline',
		label: t('share.share_info', "Shared address book's info"),
		onClick: (e: SyntheticEvent): void => {
			if (e) {
				e.stopPropagation();
			}
			setCurrentFolder(folder);
			dispatch(getFolder(folder.id)).then((res) => {
				if (res.type.includes('fulfilled')) {
					const closeModal = createModal(
						{
							children: (
								<StoreProvider>
									<SharesInfoModal
										onClose={(): void => {
											closeModal();
										}}
										folder={res.payload}
									/>
								</StoreProvider>
							)
						},
						true
					);
				}
			});
		}
	},
	{
		id: FolderActionsType.EXPORT_CONTACTS,
		icon: 'DownloadOutline',
		label: t('label.export_address_book', 'Export csv file'),
		onClick: (e: SyntheticEvent): void => {
			if (e) {
				e.stopPropagation();
			}
			exportContacts({ folderId: folder.id })
				.then((response: ExportContactsResponse | ErrorSoapBodyResponse) => {
					if ('Fault' in response) {
						throw new Error(response.Fault.Reason.Text, { cause: response.Fault });
					}
					if (response) {
						const blob = new Blob([response.content[0]._content], { type: 'application/csv' });
						const url = window.URL.createObjectURL(blob);
						const a = document.createElement('a');
						a.href = url;
						a.download = `${folder.label}.csv`;
						a.click();
						window.URL.revokeObjectURL(url);
					}
				})
				.catch(() => {
					createSnackbar({
						key: new Date().toDateString(),
						replace: true,
						type: 'error',
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000,
						hideButton: true
					});
				});
			setCurrentFolder(folder);
		}
	},
	{
		id: FolderActionsType.IMPORT_CONTACTS,
		icon: 'UploadOutline',
		label: t('label.import_address_book', 'Import csv file'),
		onClick: (): void => {
			setCurrentFolder(folder);
			importContacts({
				folderId: folder.id,
				folderName: folder.label,
				createModal,
				createSnackbar,
				t
			});
		}
	}
];
