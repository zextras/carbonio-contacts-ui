/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContactGroup } from './api/create-contact-group';
import { distributionListAction } from './api/distribution-list-action';
import { getDistributionList } from './api/get-distribution-list';
import { getDistributionListMembers } from './api/get-distribution-list-members';

export const client = {
	createContactGroup,
	distributionListAction,
	getDistributionList,
	getDistributionListMembers
};
