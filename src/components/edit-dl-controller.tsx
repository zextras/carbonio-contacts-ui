/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';

import { ModalFooter } from '@zextras/carbonio-design-system';
import { ErrorSoapBodyResponse, soapFetch } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { EditDLComponent } from './edit-dl';
import {
	GetDistributionListMembersRequest,
	GetDistributionListMembersResponse,
	NAMESPACES
} from '../api/get-distribution-list-members';

export type EditDLControllerComponentProps = {
	email: string;
	// displayName: string;
	onClose: () => void;
};

export const EditDLControllerComponent: FC<EditDLControllerComponentProps> = ({
	email,
	onClose
}) => {
	const [members, setMembers] = useState<string[]>([]);
	const [totalMembers, setTotalMembers] = useState<number>(0);
	const [t] = useTranslation();

	useEffect(() => {
		soapFetch<
			GetDistributionListMembersRequest,
			GetDistributionListMembersResponse | ErrorSoapBodyResponse
		>('GetDistributionListMembers', {
			_jsns: NAMESPACES.account,
			dl: {
				by: 'name',
				_content: email
			}
		}).then((response) => {
			if ('Fault' in response) {
				// todo handle error
			} else {
				const memberList = response.dlm.map(({ _content }) => _content);
				setMembers(memberList);
				setTotalMembers(response.total);
			}
		});
	}, [email]);

	const onAddMembers = useCallback((newMembers: string[]) => {
		setMembers((prevState) => [...newMembers, ...prevState]);
	}, []);

	const onRemoveMember = useCallback((member: string) => {
		setMembers((prevState) => prevState.filter((item) => item !== member));
	}, []);

	return (
		<>
			<EditDLComponent
				email={email}
				members={members}
				totalMembers={totalMembers}
				onRemoveMember={onRemoveMember}
				onAddMembers={onAddMembers}
			/>
			<ModalFooter
				confirmLabel={t('label.save', 'save')}
				onConfirm={(): void => undefined}
				secondaryActionLabel={t('label.cancel', 'cancel')}
				onSecondaryAction={onClose}
			/>
		</>
	);
};