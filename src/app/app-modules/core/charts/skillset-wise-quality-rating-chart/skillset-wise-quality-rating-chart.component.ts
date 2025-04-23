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
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
/**
 * DE40034072
 * 10-02-2023
 */
@Component({
  selector: 'app-skillset-wise-quality-rating-chart',
  templateUrl: './skillset-wise-quality-rating-chart.component.html',
  styleUrls: ['./skillset-wise-quality-rating-chart.component.css'],
})
export class SkillsetWiseQualityRatingChartComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  qualityRatingData: any;
  roleList: any[] = [];
  frequencyList: any[] = [];

  agentRole: any;
  month: any;
  psmId: any;
  monthsOfCurrentYear: any = [];

  constructor(
    private setLanguageService: SetLanguageService,
    private qualitySupervisorService: QualitySupervisorService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage:SessionStorageService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    this.getMonthForCurrentYear();
    this.psmId = this.sessionstorage.getItem('providerServiceMapID');
    this.agentRole = 'ANM';
    this.month = new Date().toLocaleString('default', { month: 'long' });
    this.getRoleMaster();
    if(this.masterService.frequencyMasterList !== undefined && this.masterService.frequencyMasterList !== null) {
      this.frequencyList = this.masterService.frequencyMasterList;
    } 
    this.getSkillSetQualityRatingsData();
  }

  ngDoCheck() {
    if(this.masterService.frequencyMasterList !== undefined && this.masterService.frequencyMasterList !== null) {
      this.frequencyList = this.masterService.frequencyMasterList;
    } 
    // this.frequency = 'Cycle Wise';
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
   * Fetching skill set wise quality ratings
   */
  getSkillSetQualityRatingsData() {
    this.qualityRatingData = [];
    // if (this.agentRole === 'MO') {
    //   this.qualityRatingData = [
    //     {
    //       name: 'Agent MO1',
    //       value: 95,
    //     },
    //     {
    //       name: 'Agent MO2',
    //       value: 60,
    //     },
    //     {
    //       name: 'Agent MO3',
    //       value: 85,
    //     },
    //   ];
    // } else if (this.agentRole === 'Associate') {
    //   this.qualityRatingData = [
    //     {
    //       name: 'Agent Associate1',
    //       value: 30,
    //     },
    //     {
    //       name: 'Agent Associate2',
    //       value: 73,
    //     },
    //     {
    //       name: 'Agent Associate3',
    //       value: 20,
    //     },
    //   ];
    // } else {
    //   this.qualityRatingData = [
    //     {
    //       name: 'Agent ANM1',
    //       value: 91,
    //     },
    //     {
    //       name: 'Agent ANM2',
    //       value: 26,
    //     },
    //     {
    //       name: 'Agent ANM3',
    //       value: 65,
    //     },
    //     {
    //       name: 'Agent ANM4',
    //       value: 45,
    //     },
    //   ];
    // }
    this.setSkillQualityRatingData(this.qualityRatingData);
    // this.getDataByAgentFilter(this.agentRole);

    this.qualitySupervisorService
      .getSkillSetQualityRatingsData(this.psmId, this.agentRole, this.month)
      .subscribe(
        (response: any) => {
          if (response) {
            this.qualityRatingData = response;
            this.setSkillQualityRatingData(this.qualityRatingData);
            // this.getDataByAgentFilter(this.agentRole);
          } else {
            this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          this.confirmationService.openDialog(err.error, 'error');
        }
      );
  }


  getMonthForCurrentYear(){
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    for (let i = 1; i <= currentMonth; i++) {
      const monthName = new Date(currentYear, i - 1, 1).toLocaleString('default', { month: 'long' });
      this.monthsOfCurrentYear.push({ month: monthName, id: i });
    }
   }

  /**
   * Filtering skill set wise quality rating and displaying it as a bar graph
   * @param ratingData
   */
  setSkillQualityRatingData(ratingData: any) {
    const yValues: any[] = [];
    const xValues: any[] = [];

    ratingData.filter((resp: any) => {
      yValues.push(resp.value);
      xValues.push(resp.name);
    });

    this.setChartData(xValues, yValues, ratingData);
  }

  // getDataByAgentFilter(roleName: any) {
  //   let yValues: any[] = [];
  //   let xValues: any[] = [];
  //   this.qualityRatingData.filter((response: any) => {
  //     if (response.role === roleName) {
  //       yValues.push(response.value);
  //       xValues.push(response.name);
  //     }
  //   });

  //   this.setChartData(xValues, yValues);
  // }

  setChartData(xValue: any, yValue: any, ratingData: any) {
    const chartDom = document.getElementById('mainQualityChart');
    if(chartDom){
      const myChart = echarts.init(chartDom);

      const $ = jQuery;
      $(window).on('resize', function(){
        if(myChart !== null && myChart !== undefined){
          myChart.resize();
        }
    });
  
      // let option: EChartsOption;
  
     const  option: EChartsOption = {
        toolbox: {
          show: true,
          feature: {
            // dataZoom: {
            //   yAxisIndex: 'none',
            // },
            // dataView: {
            //   readOnly: false,
            // },
            // magicType: {
            //   type: ['bar'],
            // },
            // restore: {},
            saveAsImage: {
              title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart',
              name: 'skill_set_wise_quality_ratings',
            },
          },
        },
        title: {
          text: '',
          subtext: '',
          left: 'center',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        // legend: {
        //   // bottom: 3,
        //   // left: 'center',
        //   // data: xValue,
        // },
        series: [
          {
            name: 'Score',
            type: 'pie',
            radius: '65%',
            center: ['50%', '50%'],
            selectedMode: 'single',
            data: ratingData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
  
      // option && myChart.setOption(option);
      if (option) {
        myChart.setOption(option);
      }

    }
  //   const myChart = echarts.init(chartDom);

  //   const $ = jQuery;
  //   $(window).on('resize', function(){
  //     if(myChart !== null && myChart !== undefined){
  //       myChart.resize();
  //     }
  // });

  //   // let option: EChartsOption;

  //  const  option: EChartsOption = {
  //     toolbox: {
  //       show: true,
  //       feature: {
  //         // dataZoom: {
  //         //   yAxisIndex: 'none',
  //         // },
  //         // dataView: {
  //         //   readOnly: false,
  //         // },
  //         // magicType: {
  //         //   type: ['bar'],
  //         // },
  //         // restore: {},
  //         saveAsImage: {
  //           title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart',
  //           name: 'skill_set_wise_quality_ratings',
  //         },
  //       },
  //     },
  //     title: {
  //       text: '',
  //       subtext: '',
  //       left: 'center',
  //     },
  //     tooltip: {
  //       trigger: 'item',
  //       formatter: '{a} <br/>{b} : {c} ({d}%)',
  //     },
  //     // legend: {
  //     //   // bottom: 3,
  //     //   // left: 'center',
  //     //   // data: xValue,
  //     // },
  //     series: [
  //       {
  //         name: 'Score',
  //         type: 'pie',
  //         radius: '65%',
  //         center: ['50%', '50%'],
  //         selectedMode: 'single',
  //         data: ratingData,
  //         emphasis: {
  //           itemStyle: {
  //             shadowBlur: 10,
  //             shadowOffsetX: 0,
  //             shadowColor: 'rgba(0, 0, 0, 0.5)',
  //           },
  //         },
  //       },
  //     ],
  //   };

  //   option && myChart.setOption(option);

    // option = {
    //   xAxis: {
    //     type: 'category',
    //     data: xValue,
    //   },
    //   yAxis: {
    //     type: 'value',
    //   },
    //   series: [
    //     {
    //       data: yValue,
    //       type: 'bar',
    //       color: '#4fa2d0',
    //     },
    //   ],
    // };

    // option && myChart.setOption(option);
  }
}
