/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getMembersPartition } from './edit-dl-controller';

describe('EditDLControllerComponent', () => {
	describe('getMembersPartition', () => {
		it("should return an object with empty members if the two parameters don't contain any value", () => {
			const originalMembers: Array<string> = [];
			const updatedMembers: Array<string> = [];
			const result = getMembersPartition(originalMembers, updatedMembers);
			expect(result).toEqual({ membersToAdd: [], membersToRemove: [] });
		});

		it('should return an object with empty members if the two parameters contain the same values', () => {
			const originalMembers: Array<string> = ['john.doe@domain.org', 'mario.rossi@dominio.it'];
			const updatedMembers: Array<string> = ['mario.rossi@dominio.it', 'john.doe@domain.org'];
			const result = getMembersPartition(originalMembers, updatedMembers);
			expect(result).toEqual({ membersToAdd: [], membersToRemove: [] });
		});

		it('should return an object with 3 members to add if the second parameter contains 3 members not included in the first parameter', () => {
			const originalMembers: Array<string> = ['john.doe@domain.org', 'mario.rossi@dominio.it'];
			const updatedMembers: Array<string> = [
				'mario.rossi@dominio.it',
				'john.doe@domain.org',
				'1@dominio.it',
				'2@dominio.it',
				'3@dominio.it'
			];
			const result = getMembersPartition(originalMembers, updatedMembers);
			expect(result).toEqual({
				membersToAdd: ['1@dominio.it', '2@dominio.it', '3@dominio.it'],
				membersToRemove: []
			});
		});

		it('should return an object with 3 members to remove if the first parameter contains 3 members not included in the second parameter', () => {
			const originalMembers: Array<string> = [
				'mario.rossi@dominio.it',
				'john.doe@domain.org',
				'1@dominio.it',
				'2@dominio.it',
				'3@dominio.it'
			];
			const updatedMembers: Array<string> = ['john.doe@domain.org', 'mario.rossi@dominio.it'];
			const result = getMembersPartition(originalMembers, updatedMembers);
			expect(result).toEqual({
				membersToAdd: [],
				membersToRemove: ['1@dominio.it', '2@dominio.it', '3@dominio.it']
			});
		});

		it('should return an object with 2 members to add and 3 members to remove if the parameters contains different members', () => {
			const originalMembers: Array<string> = [
				'1@dominio.it',
				'2@dominio.it',
				'anonymous@hacker.net',
				'3@dominio.it'
			];
			const updatedMembers: Array<string> = [
				'john.doe@domain.org',
				'anonymous@hacker.net',
				'mario.rossi@dominio.it'
			];
			const result = getMembersPartition(originalMembers, updatedMembers);
			expect(result).toEqual({
				membersToAdd: ['john.doe@domain.org', 'mario.rossi@dominio.it'],
				membersToRemove: ['1@dominio.it', '2@dominio.it', '3@dominio.it']
			});
		});
	});
});
