/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useBoard } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { EditDLControllerComponent } from '../../components/edit-dl-controller';
import { Text } from '../../components/Text';
import { useGetDistributionList } from '../../hooks/use-get-distribution-list';
import { useGetDistributionListMembers } from '../../hooks/use-get-distribution-list-members';
import { DistributionList } from '../../model/distribution-list';

export type EditDLBoardContext = Pick<DistributionList, 'id'>;

const EditDLBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { context } = useBoard<EditDLBoardContext>();
	const { distributionList, loading: loadingDL } = useGetDistributionList(context?.id);
	const {
		loading: loadingMembers,
		members = [],
		total = 0,
		more = false
	} = useGetDistributionListMembers(distributionList?.email ?? '', {
		skip: !distributionList?.email
	});

	const membersPage = useMemo(() => ({ members, total, more }), [members, more, total]);

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
			description={distributionList.description}
			members={membersPage}
			loadingMembers={loadingMembers}
			owners={distributionList.owners}
			loadingOwners={loadingDL}
		/>
	);
};

export default EditDLBoard;
