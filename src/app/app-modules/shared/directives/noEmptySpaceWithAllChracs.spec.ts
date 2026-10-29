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


import { NoEmptySpaceWithAllChracsDirective } from './noEmptySpaceWithAllChracs';

describe('NoEmptySpaceWithAllChracsDirective', () => {
  let directive: NoEmptySpaceWithAllChracsDirective;

  const keypress = (value: string, key: string) => ({
    target: { value },
    charCode: key.charCodeAt(0),
    which: key.charCodeAt(0),
    preventDefault: jasmine.createSpy('preventDefault'),
  });

  beforeEach(() => (directive = new NoEmptySpaceWithAllChracsDirective()));

  it('blocks whitespace while the field would be blank', () => {
    const ev = keypress('  ', ' ');
    directive.onKeyPress(ev);
    expect(ev.preventDefault).toHaveBeenCalled();
  });

  it('allows any character once there is content', () => {
    ['a', '~', ' '].forEach((key) => {
      const ev = keypress('x', key);
      directive.onKeyPress(ev);
      expect(ev.preventDefault).withContext(key).not.toHaveBeenCalled();
    });
  });

  it('allows a first non-blank character', () => {
    const ev = keypress('', '@');
    directive.onKeyPress(ev);
    expect(ev.preventDefault).not.toHaveBeenCalled();
  });
});
