/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { EditDLControllerComponent } from '../../components/edit-dl-controller';
import { Text } from '../../components/Text';
import { DistributionList } from '../../model/distribution-list';

const EditDLBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { context: distributionList } = useBoard<DistributionList>();

	return distributionList === undefined ? (
		<Container>
			<Text color={'error'}>
				{t('label.error_try_again', 'Something went wrong, please try again')}
			</Text>
		</Container>
	) : (
		<EditDLControllerComponent
			email={distributionList.email}
			displayName={distributionList.displayName}
			members={distributionList.members}
			owners={distributionList.owners}
		/>
	);
};

export default EditDLBoard;
