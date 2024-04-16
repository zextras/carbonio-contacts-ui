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
import { findContactGroups } from './api/find-contact-groups';
import { getAccountDistributionLists } from './api/get-account-distribution-lists';
import { getDistributionList } from './api/get-distribution-list';
import { getDistributionListMembers } from './api/get-distribution-list-members';
import { getShareInfo } from './api/get-share-info';
import { modifyContactGroup } from './api/modify-contact';
import { moveFolder } from './api/move-folder';
import { trashFolder } from './api/trash-folder';

export const client = {
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
	moveFolder
};
