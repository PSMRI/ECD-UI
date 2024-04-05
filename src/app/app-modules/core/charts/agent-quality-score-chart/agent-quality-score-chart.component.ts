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
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from '../../../services/set-language/set-language.service';
import { ajax, css } from "jquery";

/**
 * DE40034072
 * 10-02-2023
 */

@Component({
  selector: 'app-agent-quality-score-chart',
  templateUrl: './agent-quality-score-chart.component.html',
  styleUrls: ['./agent-quality-score-chart.component.css'],
})
export class AgentQualityScoreChartComponent implements OnInit, DoCheck {
  currentLanguageSet: any;
  qualityGradeData: any;
  frequencyList: any[] = [];
  frequency: any;
  lastSixMonths: any = [];
  enableMonthFilter = false;
  month: any;

  constructor(
    private setLanguageService: SetLanguageService,
    private qualitySupervisorService: QualitySupervisorService,
    private confirmationService: ConfirmationService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    if(this.masterService.frequencyMasterListOfScoreChart !== undefined && this.masterService.frequencyMasterListOfScoreChart !== null) {
      this.frequencyList = this.masterService.frequencyMasterListOfScoreChart;
    }
    this.frequency = 'Year Wise';
    this.getAgentQualityScoreData();
    this.getPast6Months();
  }

  ngDoCheck() {
    if(this.masterService.frequencyMasterListOfScoreChart !== undefined && this.masterService.frequencyMasterListOfScoreChart !== null) {
      this.frequencyList = this.masterService.frequencyMasterListOfScoreChart;
    }
    // this.frequency = 'Year Wise';
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }

  getPast6Months(){
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const monthsOfCurrentYear = [];

    for (let i = currentMonth - 5; i <= currentMonth; i++) {
      const monthIndex = (i <= 0) ? 12 + i : i;
      const year = (i <= 0) ? currentYear - 1 : currentYear;
      const monthName = new Date(year, monthIndex - 1, 1).toLocaleString('default', { month: 'long' });
      this.lastSixMonths.push({ month: monthName, id: monthIndex });
    }
  }

  checkFrequency(){
    if(this.frequency === "Month Wise"){
      this.enableMonthFilter = true;
      this.month =  new Date().toLocaleString('default', { month: 'long' });
      this.getAgentQualityScoreData();
    } else {
      this.enableMonthFilter = false;
      this.month = null;
      this.getAgentQualityScoreData();
    }
  }


  /**
   * Fetching Rating data
   */
  getAgentQualityScoreData() {
    this.qualityGradeData = [];
    this.setAgentGradeData(this.qualityGradeData);
    const psmId = sessionStorage.getItem('providerServiceMapID');
    const month = (this.month !== null && this.month !== undefined) ? this.month : null;

    this.qualitySupervisorService
      .getNumberOfAgentScoreData(psmId,this.frequency, month)
      .subscribe(
        (response: any) => {
          if (response) {
            this.qualityGradeData = response;
            this.setAgentGradeData(this.qualityGradeData);
          } else {
            // this.confirmationService.openDialog(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          // this.confirmationService.openDialog(err.error, 'error');
        }
      );
  }

  /** Filtering Rating data and displaying as charts */
  setAgentGradeData(ratingData: any) {
    // let yValues: any[] = [];
    // let xValues: any[] = [];

    // ratingData.filter((resp: any) => {
    //   yValues.push(resp.value);
    //   xValues.push(resp.name);
    // });

    const chartDom = document.getElementById('agentQualityMain');
    if(chartDom){
      const myChart = echarts.init(chartDom);
    const $ = jQuery;
    $(window).on('resize', function(){
      if(myChart !== null && myChart !== undefined){
        myChart.resize();
      }
  });
    // let option: EChartsOption;
    const option: EChartsOption = {
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart',
            name: 'customer_satisfaction_chart',
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
      legend: {
        // orient: 'vertical',
        left: 'center',
      },
      series: [
        {
          name: 'Agent Grade',
          type: 'pie',
          radius: '60%',
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
  //   const option: EChartsOption = {
  //     toolbox: {
  //       show: true,
  //       feature: {
  //         saveAsImage: {
  //           title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart',
  //           name: 'customer_satisfaction_chart',
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
  //     legend: {
  //       // orient: 'vertical',
  //       left: 'center',
  //     },
  //     series: [
  //       {
  //         name: 'Agent Grade',
  //         type: 'pie',
  //         radius: '60%',
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
  }
}
