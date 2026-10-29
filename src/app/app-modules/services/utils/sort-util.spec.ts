/* 
* AMRIT – Accessible Medical Records via Integrated Technology 
* Integrated EHR (Electronic Health Records) Solution 
*
* Copyright (C) "Piramal Swasthya Management and Research Institute" 
*
* This file is part of AMRIT.
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see https://www.gnu.org/licenses/.
*/

import { sortByProperty } from './sort-util';

describe('sortByProperty', () => {
  it('should sort by a string property case-insensitively', () => {
    const input = [{ n: 'beta' }, { n: 'Alpha' }, { n: 'gamma' }];
    expect(sortByProperty(input, 'n').map((i) => i.n)).toEqual(['Alpha', 'beta', 'gamma']);
  });

  it('should not mutate the original array', () => {
    const input = [{ n: 'b' }, { n: 'a' }];
    const result = sortByProperty(input, 'n');
    expect(input.map((i) => i.n)).toEqual(['b', 'a']);
    expect(result).not.toBe(input);
  });

  it('should sort using a key function', () => {
    const input = [{ f: 'Z', l: 'a' }, { f: 'A', l: 'z' }];
    const result = sortByProperty(input, (i) => i.f + i.l);
    expect(result.map((i) => i.f)).toEqual(['A', 'Z']);
  });

  it('should treat missing/falsy values as empty strings (sorted first)', () => {
    const input: any[] = [{ n: 'b' }, { n: null }, {}, { n: 'a' }];
    const result = sortByProperty(input, 'n');
    expect(result.slice(2).map((i) => i.n)).toEqual(['a', 'b']);
  });

  it('should stringify non-string values', () => {
    const input = [{ n: 10 }, { n: 2 }];
    expect(sortByProperty(input, 'n').map((i) => i.n)).toEqual([10, 2]);
  });

  it('should return empty arrays and null/undefined unchanged', () => {
    const empty: any[] = [];
    expect(sortByProperty(empty, 'n')).toBe(empty);
    expect(sortByProperty(null as any, 'n')).toBeNull();
    expect(sortByProperty(undefined as any, 'n')).toBeUndefined();
  });
});
