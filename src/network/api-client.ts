/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContactFromVcard } from 'network/api/create-contact';
import { createFolder } from 'network/api/create-folder';
import { createMountpoints } from 'network/api/create-mountpoints';
import { deleteContact } from 'network/api/delete-contact';
import { deleteFolder } from 'network/api/delete-folder';
import { distributionListAction } from 'network/api/distribution-list-action';
import { emptyFolder } from 'network/api/empty-folder';
import { exportContacts } from 'network/api/export-contacts';
import { getAccountDistributionLists } from 'network/api/get-account-distribution-lists';
import { getDistributionList } from 'network/api/get-distribution-list';
import { getDistributionListMembers } from 'network/api/get-distribution-list-members';
import { getItem } from 'network/api/get-item';
import { getShareInfo } from 'network/api/get-share-info';
import { importContacts } from 'network/api/import-contacts';
import { moveContact } from 'network/api/move-contact';
import { moveFolder } from 'network/api/move-folder';
import { revokeFolderGrant } from 'network/api/revoke-folder-grant';
import { sendShareNotification } from 'network/api/send-share-notification';
import { shareFolder } from 'network/api/share-folder';
import { trashContacts } from 'network/api/trash-contacts';
import { trashFolder } from 'network/api/trash-folder';
import { updateFolder } from 'network/api/update-folder';
import { upload } from 'network/api/upload';

export const apiClient = {
	distributionListAction,
	getDistributionList,
	getDistributionListMembers,
	deleteContact,
	moveContact,
	getAccountDistributionLists,
	getShareInfo,
	createMountpoints,
	deleteFolder,
	trashFolder,
	moveFolder,
	emptyFolder,
	exportContacts,
	importContacts,
	upload,
	shareFolder,
	revokeFolderGrant,
	sendShareNotification,
	updateFolder,
	createFolder,
	getItem,
	createContactFromVcard,
	trashContacts
};
