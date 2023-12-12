/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ModalFooter } from '@zextras/carbonio-design-system';
import { xor } from 'lodash';
import { useTranslation } from 'react-i18next';

import { EditDLComponent } from './edit-dl';
import { getDistributionListMembers } from '../api/get-distribution-list-members';

export type EditDLControllerComponentProps = {
	email: string;
	// displayName: string;
	onClose: () => void;
	onSave: () => void;
};

export const EditDLControllerComponent: FC<EditDLControllerComponentProps> = ({
	email,
	onClose,
	onSave
}) => {
	const [members, setMembers] = useState<string[]>([]);
	const originalMembersRef = useRef<string[]>([]);
	const [totalMembers, setTotalMembers] = useState<number>(0);
	const [t] = useTranslation();

	useEffect(() => {
		getDistributionListMembers(email)
			.then((response) => {
				const memberList = response.dlm.map(({ _content }) => _content);
				setMembers(() => {
					originalMembersRef.current = memberList;
					return memberList;
				});
				setTotalMembers(response.total);
			})
			.catch((error: Error) => {
				// TODO: handle error
				console.error(error);
			});
	}, [email]);

	const onAddMembers = useCallback((newMembers: string[]) => {
		setMembers((prevState) => [...newMembers, ...prevState]);
		setTotalMembers((prevState) => prevState + newMembers.length);
	}, []);

	const onRemoveMember = useCallback((member: string) => {
		setMembers((prevState) => prevState.filter((item) => item !== member));
		setTotalMembers((prevState) => prevState - 1);
	}, []);

	const onConfirm = useCallback(() => {
		onSave();
	}, [onSave]);

	const isDirty = useMemo(() => xor(members, originalMembersRef.current).length > 0, [members]);

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
				onConfirm={onConfirm}
				confirmDisabled={!isDirty}
				secondaryActionLabel={t('label.cancel', 'cancel')}
				onSecondaryAction={onClose}
			/>
		</>
	);
};
