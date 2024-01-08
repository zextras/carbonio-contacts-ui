/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { Action as DSAction } from '@zextras/carbonio-design-system';

import { useActionSendEmail } from '../actions/send-email';
import { DistributionList } from '../model/distribution-list';

export const useDLActions = (distributionList: DistributionList): Array<DSAction> => {
	const sendEmailAction = useActionSendEmail();

	return useMemo(() => {
		const actions: Array<DSAction> = [];
		if (sendEmailAction.canExecute()) {
			actions.push({
				id: sendEmailAction.id,
				label: sendEmailAction.label,
				onClick: () => {
					sendEmailAction.execute([distributionList.email]);
				},
				icon: sendEmailAction.icon
			});
		}
		return actions;
	}, [distributionList, sendEmailAction]);
};
