/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { Action as DSAction } from '@zextras/carbonio-design-system';

import { useActionSendEmail } from '../actions/send-email';
import { DistributionList } from '../model/distribution-list';

export const useDLActions = (distributionList: DistributionList | undefined): Array<DSAction> => {
	const sendEmailAction = useActionSendEmail();

	return useMemo(() => {
		if (distributionList === undefined) {
			return [];
		}
		const actions: Array<DSAction> = [];
		if (sendEmailAction.canExecute()) {
			actions.push({
				id: sendEmailAction.id,
				label: sendEmailAction.label,
				onClick: () => {
					sendEmailAction.execute([{ email: distributionList.email, isGroup: true }]);
				},
				icon: sendEmailAction.icon
			});
		}
		return actions;
	}, [distributionList, sendEmailAction]);
};
