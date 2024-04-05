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


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ComponentFactoryResolver, ComponentRef } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssociateService {
  private container: any;
  private componentRef!: ComponentRef<any>;

  constructor(
    private http: HttpClient,
    private resolver: ComponentFactoryResolver
  ) { }

  loadComponent(component: any, data: any) {
    this.container.clear();
    const factory = this.resolver.resolveComponentFactory(component);
    this.componentRef = factory.create(this.container.injector);
    this.componentRef.instance.data = data;
    this.container.insert(this.componentRef.hostView);
  }
  setContainer(container: any) {
    this.container = container;
  }
   callClosure(reqObj: any) {
    return this.http.post(environment.updateCallClosureUrl, reqObj);
  }
  getBenCallHist(reqObj: any){
    return this.http.post(environment.getBenHistoryURL, reqObj);
  }
  patchBenCallHist(reqObj: any){
    return this.http.post(environment.patchBenHistoryURL, reqObj);
  }
}
