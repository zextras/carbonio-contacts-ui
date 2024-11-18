/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Tag, Tags } from '@zextras/carbonio-shell-ui';
import { includes, reduce } from 'lodash';

import { ZIMBRA_STANDARD_COLORS } from '../../carbonio-ui-commons/constants';
import { Contact } from '../types/contact';

export function getTagsArray(tagsMap: Tags, itemTags: Contact['tags']): Array<Tag> {
	return reduce(
		tagsMap,
		(acc, v) => {
			if (includes(itemTags, v.id))
				acc.push({
					...v,
					// TOFIX: casting to number not to deal with issues in tags. nevertheless the code is working, tags need a refactor
					color: ZIMBRA_STANDARD_COLORS[parseInt(v.color?.toString() ?? '0', 10)]
						.hex as unknown as number
				});
			return acc;
		},
		[] as Array<Tag>
	);
}
