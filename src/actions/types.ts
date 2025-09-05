/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { Theme } from '@emotion/react';
import { Action as DSAction } from '@zextras/carbonio-design-system';

export type UIAction<ExecArg, CanExecArg> = {
	id: string;
	label: string;
	icon: keyof Theme['icons'];
	execute: (arg?: ExecArg) => void;
	canExecute: (arg?: CanExecArg) => boolean;
	color?: DSAction['color'];
	disabled?: boolean;
};

export type Action = {
	id: string;
	label: string;
	icon: keyof Theme['icons'];
	onClick: () => void;
	color?: DSAction['color'];
	disabled?: boolean;
};

export type DeletableItem = {
	id: string;
	parent: string;
};

export type TaggableItem = {
	id: string;
	tags?: Array<string>;
};
