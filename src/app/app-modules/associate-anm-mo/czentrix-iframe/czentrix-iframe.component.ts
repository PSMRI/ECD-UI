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


import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {AssociateAnmMoService} from "../../services/associate-anm-mo/associate-anm-mo.service"
import { CtiService } from '../../services/cti/cti.service';
import { LoginserviceService } from '../../services/loginservice/loginservice.service';
@Component({
  selector: 'app-czentrix-iframe',
  templateUrl: './czentrix-iframe.component.html',
  styleUrls: ['./czentrix-iframe.component.css']
})
export class CzentrixIframeComponent implements OnInit {
  barMinimized = true;
  ctiHandlerURL: any;
  constructor(
    public sanitizer: DomSanitizer,
    public associateAnmMoService: AssociateAnmMoService,
    private ctiService: CtiService,
    private loginService: LoginserviceService,
  ) { }

  ngOnInit(): void {
    const ctiUrl = this.ctiService.ctiUrl + this.ctiService.eventCtiUrl + this.loginService.agentId;
    this.ctiHandlerURL = this.sanitizer.bypassSecurityTrustResourceUrl(ctiUrl);
  }

  minimizeBar() {
    this.barMinimized = true;
  }
  toggleBar() {
    if (this.barMinimized) this.barMinimized = false;
    else this.barMinimized = true;
  }

}
