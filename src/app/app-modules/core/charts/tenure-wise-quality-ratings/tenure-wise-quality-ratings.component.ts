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


import { Component, DoCheck, OnInit } from '@angular/core';
import { SetLanguageService } from '../../../services/set-language/set-language.service';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { ajax, css } from "jquery";

@Component({
  selector: 'app-tenure-wise-quality-ratings',
  templateUrl: './tenure-wise-quality-ratings.component.html',
  styleUrls: ['./tenure-wise-quality-ratings.component.css'],
})
export class TenureWiseQualityRatingsComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  qualityRatingData: any;
  frequencyList: any[] = [];
  frequency: any;
  roleList: any = [];
  psmId: any;
  agentRole: any;
  /**
   * DE40034072
   * 10-02-2023
   */
  constructor(
    private setLanguageService: SetLanguageService,
    private qualitySupervisorService: QualitySupervisorService,
    private confirmationService: ConfirmationService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.psmId = sessionStorage.getItem('providerServiceMapID');
    this.getRoleMaster();
    this.agentRole = "ANM"
    this.getTenureQualityRatingsData();
  }

  ngDoCheck() {
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getRoleMaster() {
    this.masterService.getRoleMaster(this.psmId).subscribe(
      (response: any) => {
        if (response) {
          const roleArr = response;
          roleArr.filter((values:any) => {
            if (values.roleName.toLowerCase() === "associate" || values.roleName.toLowerCase() === "anm" || values.roleName.toLowerCase() === "mo") {
                this.roleList.push(values);
            }
          });
          this.agentRole = 'ANM';
        } else {
          // this.confirmationService.openDialog(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        // this.confirmationService.openDialog(err.error, 'error');
      }
    );
  }


  /**
   * Fetching tenure wise quality ratings
   */
  getTenureQualityRatingsData() {
    this.qualityRatingData = [];
    this.setTenureQualityRatingData(this.qualityRatingData);

    const psmId = sessionStorage.getItem('providerServiceMapID');

    this.qualitySupervisorService
      .getTenureWiseQualityRatingsData(psmId, this.agentRole)
      .subscribe(
        (response: any) => {
          if (response) {
            this.qualityRatingData = response;
            this.setTenureQualityRatingData(this.qualityRatingData);
          } else {
            // this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          // this.confirmationService.openDialog(err.error, 'error');
        }
      );
  }

  /**
   * Filtering tenure wise quality rating and displaying it as a bar graph
   * @param ratingData
   */
  setTenureQualityRatingData(ratingData: any) {
    const yValues: any[] = [];
    const xValues: any[] = [];

    ratingData.filter((resp: any) => {
      yValues.push(resp.value);
      xValues.push(resp.name);
    });

    const chartDom = document.getElementById('mainTenureChart');
    if(chartDom){
      const myChart = echarts.init(chartDom);

    const $ = jQuery;
    $(window).on('resize', function(){
      if(myChart !== null && myChart !== undefined){
        myChart.resize();
      }
  });

    // let option: EChartsOption;
    // myChart.resize({
    //   // width: 300,
    //   height: 300,
    // });

    const option: EChartsOption = {
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart' ,
            name: 'tenure_wise_quality_ratings_chart',
          },
        },
      },
      grid: {
        left: 100
      },
      xAxis: {
        // type: 'category',
        type: 'value',
      
        // data: xValues,
      },
      yAxis: {
        type: 'category',
        data: xValues,
        // type: 'value',
        inverse: true,
      
      },
      series: [
        {
          data: yValues,
          type: 'bar',
          color: '#4fa2d0',
        },
      ],
    };

    option && myChart.setOption(option);

    }
  //   const myChart = echarts.init(chartDom);

  //   const $ = jQuery;
  //   $(window).on('resize', function(){
  //     if(myChart !== null && myChart !== undefined){
  //       myChart.resize();
  //     }
  // });

  //   // let option: EChartsOption;
  //   // myChart.resize({
  //   //   // width: 300,
  //   //   height: 300,
  //   // });

  //   const option: EChartsOption = {
  //     toolbox: {
  //       show: true,
  //       feature: {
  //         saveAsImage: {
  //           title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart' ,
  //           name: 'tenure_wise_quality_ratings_chart',
  //         },
  //       },
  //     },
  //     grid: {
  //       left: 100
  //     },
  //     xAxis: {
  //       // type: 'category',
  //       type: 'value',
      
  //       // data: xValues,
  //     },
  //     yAxis: {
  //       type: 'category',
  //       data: xValues,
  //       // type: 'value',
  //       inverse: true,
      
  //     },
  //     series: [
  //       {
  //         data: yValues,
  //         type: 'bar',
  //         color: '#4fa2d0',
  //       },
  //     ],
  //   };

  //   option && myChart.setOption(option);
  }
}
