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

import { TestBed } from '@angular/core/testing';
import { StorageService } from 'ng-cryptostore';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
  let service: SessionStorageService;
  let store: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    store = jasmine.createSpyObj('StorageService', ['set', 'get']);
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: store }],
    });
    service = TestBed.inject(SessionStorageService);
  });

  it('should be created with the environment encryption key', () => {
    expect(service).toBeTruthy();
    expect(service.SECRET_KEY).toBe(environment.encKey);
  });

  it('setItem should encrypt-store the value with the secret key', () => {
    service.setItem('userID', 42);
    expect(store.set).toHaveBeenCalledWith('userID', 42, environment.encKey);
  });

  it('getItem should read the value with the secret key', () => {
    store.get.and.returnValue('abc');
    expect(service.getItem('userName')).toBe('abc');
    expect(store.get).toHaveBeenCalledWith('userName', environment.encKey);
  });

  it('getItem should return null for a missing key', () => {
    store.get.and.returnValue(null);
    expect(service.getItem('missing')).toBeNull();
  });

  it('removeItem should remove the key from sessionStorage', () => {
    const spy = spyOn(Storage.prototype, 'removeItem');
    service.removeItem('userID');
    expect(spy).toHaveBeenCalledWith('userID');
  });

  it('clear should clear sessionStorage', () => {
    const spy = spyOn(Storage.prototype, 'clear');
    service.clear();
    expect(spy).toHaveBeenCalled();
  });
});
