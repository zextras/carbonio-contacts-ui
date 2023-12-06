/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';

import { EditDLComponent } from './edit-dl';

export type EditDLControllerComponentProps = {
	email: string;
	// displayName: string;
};

export const EditDLControllerComponent: FC<EditDLControllerComponentProps> = ({ email }) => (
	<EditDLComponent
		email={email}
		members={[]}
		totalMembers={0}
		onRemoveMember={function (email: string): void {
			throw new Error('Function not implemented.');
		}}
		onAddMembers={function (emails: string[]): void {
			throw new Error('Function not implemented.');
		}}
	/>
);
