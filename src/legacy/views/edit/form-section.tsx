/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { createContext, useContext, ReactNode, ForwardedRef } from 'react';

import { Container, Text } from '@zextras/carbonio-design-system';

const levelContext = createContext(0);

type FormSectionProps = {
	background?: string;
	label: string;
	children: ReactNode;
};

export const FormSection = React.forwardRef(function FormSectionFn(
	{ background, label, children }: FormSectionProps,
	ref: ForwardedRef<HTMLDivElement>
) {
	const level = useContext(levelContext);
	return (
		<Container
			ref={ref}
			background={background}
			orientation="vertical"
			width="fill"
			height="fit"
			crossAlignment="flex-start"
			padding={{
				vertical: 'large',
				horizontal: 'small'
			}}
		>
			<Text size="large" weight={level > 0 ? 'regular' : 'medium'} overflow="break-word">
				{label}
			</Text>
			<levelContext.Provider value={level + 1}>{children}</levelContext.Provider>
		</Container>
	);
});

export const FormRow = ({ children }: { children: ReactNode }): React.JSX.Element => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		width="fill"
		padding={{
			top: 'large',
			horizontal: 'small'
		}}
	>
		{children}
	</Container>
);
