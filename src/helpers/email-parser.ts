/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function parseEmail(input: string): string {
	const caputured = /.*<(.*)>/.exec(input.trim() || '');
	if (caputured && caputured.length > 1) return caputured[1];

	return input.trim();
}

export function isValidEmail(email: string | undefined): boolean {
	// eslint-disable-next-line max-len, prettier/prettier, no-useless-escape
  const validEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return validEmailRegex.test(String(email).toLowerCase());
}
