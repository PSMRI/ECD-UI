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


import { UtcdatePipe } from './utcdate.pipe';

describe('UtcdatePipe', () => {
  const pipe = new UtcdatePipe();

  it('returns a blank for empty values', () => {
    expect(pipe.transform(null)).toBe(' ');
    expect(pipe.transform('')).toBe(' ');
  });

  it('keeps the UTC wall-clock time as a local date', () => {
    const result: Date = pipe.transform('2026-03-05T09:07:03Z');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(2);
    expect(result.getDate()).toBe(5);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(7);
    expect(result.getSeconds()).toBe(3);
  });
});
