/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from 'react';

import { Action as DSAction } from '@zextras/carbonio-design-system';

import { useActionEditDL } from '../actions/edit-dl';
import { useActionSendEmail } from '../actions/send-email';
import { DistributionList } from '../model/distribution-list';

export const useDLActions = (
	distributionList: Pick<DistributionList, 'email' | 'displayName' | 'id' | 'isOwner'> | undefined
): Array<DSAction> => {
	const sendEmailAction = useActionSendEmail();
	const editDLAction = useActionEditDL();

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

		if (editDLAction.canExecute(distributionList)) {
			actions.push({
				id: editDLAction.id,
				label: editDLAction.label,
				onClick: () => {
					editDLAction.execute(distributionList);
				},
				icon: editDLAction.icon
			});
		}
		return actions;
	}, [distributionList, editDLAction, sendEmailAction]);
};
