import React from 'react';

import { Button, Container } from '@zextras/carbonio-design-system';
import { t } from '@zextras/carbonio-shell-ui';

import { useActionAddSharedAddressBooks } from '../../../actions/add-shared-address-books';

/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
export const FindSharesButton = (): React.JSX.Element => {
	const addSharesAction = useActionAddSharedAddressBooks();

	const label = t('label.find_shares', 'Find shares');

	function onClick(): void {
		return addSharesAction.execute();
	}

	return (
		<Container padding={{ horizontal: 'medium', vertical: 'small' }} key="button-find-shares">
			<Button
				type="outlined"
				label={label}
				width="fill"
				color="primary"
				onClick={onClick}
				disabled={!addSharesAction.canExecute()}
			/>
		</Container>
	);
};
