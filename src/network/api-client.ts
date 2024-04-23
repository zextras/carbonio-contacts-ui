/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { deleteContactAction } from './api/contact-action';
import { createContactGroup } from './api/create-contact-group';
import { createMountpoints } from './api/create-mountpoints';
import { deleteFolder } from './api/delete-folder';
import { distributionListAction } from './api/distribution-list-action';
import { emptyFolder } from './api/empty-folder';
import { exportContacts } from './api/export-contacts';
import { findContactGroups } from './api/find-contact-groups';
import { getAccountDistributionLists } from './api/get-account-distribution-lists';
import { getDistributionList } from './api/get-distribution-list';
import { getDistributionListMembers } from './api/get-distribution-list-members';
import { getShareInfo } from './api/get-share-info';
import { importContacts } from './api/import-contacts';
import { modifyContactGroup } from './api/modify-contact';
import { moveFolder } from './api/move-folder';
import { sendShareNotification } from './api/send-share-notification';
import { trashFolder } from './api/trash-folder';
import { updateFolder } from './api/update-folder';
import { upload } from './api/upload';

export const apiClient = {
	createContactGroup,
	distributionListAction,
	getDistributionList,
	getDistributionListMembers,
	findContactGroups,
	deleteContactAction,
	getAccountDistributionLists,
	modifyContactGroup,
	getShareInfo,
	createMountpoints,
	deleteFolder,
	trashFolder,
	moveFolder,
	emptyFolder,
	exportContacts,
	importContacts,
	upload,
	sendShareNotification,
	updateFolder
};
