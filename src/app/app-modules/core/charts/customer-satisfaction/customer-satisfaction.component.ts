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


import { Component, DoCheck, OnInit, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { ConfirmationService } from 'src/app/app-modules/services/confirmation/confirmation.service';
import { MasterService } from 'src/app/app-modules/services/masterService/master.service';
import { QualitySupervisorService } from 'src/app/app-modules/services/quality-supervisor/quality-supervisor.service';
import { SetLanguageService } from '../../../services/set-language/set-language.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
/**
 * DE40034072
 * 10-02-2023
 */
@Component({
  selector: 'app-customer-satisfaction',
  templateUrl: './customer-satisfaction.component.html',
  styleUrls: ['./customer-satisfaction.component.css'],

  standalone: false})
export class CustomerSatisfactionComponent implements OnInit, DoCheck, OnDestroy {
  currentLanguageSet: any;
  customerSatisfactionData: any;
  frequencyList: any[] = [];
  frequency: any;
  private chartInstance: echarts.ECharts | null = null;
  private resizeHandler: (() => void) | null = null;

  constructor(
    private setLanguageService: SetLanguageService,
    private qualitySupervisorService: QualitySupervisorService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage:SessionStorageService,
    private masterService: MasterService
  ) {}

  ngOnInit(): void {
    this.getSelectedLanguage();
    if(this.masterService.frequencyMasterList !== undefined && this.masterService.frequencyMasterList !== null) {
      this.frequencyList = this.masterService.frequencyMasterList;
    } 
    this.frequency = 'Cycle Wise';
    this.getCustomerSatisfactionData();
  }

  ngDoCheck() {
    if(this.masterService.frequencyMasterList !== undefined && this.masterService.frequencyMasterList !== null) {
      this.frequencyList = this.masterService.frequencyMasterList;
    } 
    this.frequency = 'Cycle Wise';
    this.getSelectedLanguage();
  }

  getSelectedLanguage() {
    if (
      this.setLanguageService.languageData !== undefined &&
      this.setLanguageService.languageData !== null
    )
      this.currentLanguageSet = this.setLanguageService.languageData;
  }



  /**
   * Fetching customer satisfaction data
   */
  getCustomerSatisfactionData() {
    this.customerSatisfactionData = [];
    this.setCustomerSatisfactionData(this.customerSatisfactionData);

    const psmId = this.sessionstorage.getItem('providerServiceMapID');

    this.qualitySupervisorService
      .getCustomerSatisfactionData(this.frequency, psmId)
      .subscribe(
        (response: any) => {
          if (response) {
            this.customerSatisfactionData = response;
            this.setCustomerSatisfactionData(this.customerSatisfactionData);
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
   * Filtering customer satisfaction data and displaying as chart
   * @param ratingData
   */
  setCustomerSatisfactionData(ratingData: any) {
    const yValues: any[] = [];
    const xValues: any[] = [];

    ratingData.filter((resp: any) => {
      yValues.push(resp.value);
      xValues.push(resp.name);
    });

    const chartDom = document.getElementById('mainCustomerChart');
    if(chartDom){
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
      }

      this.chartInstance = echarts.init(chartDom);
      this.resizeHandler = () => {
        if (this.chartInstance) {
          this.chartInstance.resize();
        }
      };
      window.addEventListener('resize', this.resizeHandler);


    const option = {
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart',
            name: 'customer_satisfaction_chart',
          },
        },
      },
      grid: {
        left: 100
      },
      xAxis: {
       
        type: 'value',
        // name: 'Score',
        // axisLabel: {
        //   formatter: '{value}'
        // }
        
      },
      yAxis: {
        type: 'category',
        // name: 'Frequency',
        data: xValues,
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

    option && this.chartInstance.setOption(option);
    }

  //   const myChart = echarts.init(chartDom);

  //   $(window).on('resize', function(){
  //     if(myChart !== null && myChart !== undefined){
  //       myChart.resize();
  //     }
  // });


  //   const option = {
  //     toolbox: {
  //       show: true,
  //       feature: {
  //         saveAsImage: {
  //           title: this.currentLanguageSet!== undefined ? this.currentLanguageSet.downloadChart : 'Download Chart',
  //           name: 'customer_satisfaction_chart',
  //         },
  //       },
  //     },
  //     grid: {
  //       left: 100
  //     },
  //     xAxis: {
       
  //       type: 'value',
  //       // name: 'Score',
  //       // axisLabel: {
  //       //   formatter: '{value}'
  //       // }
        
  //     },
  //     yAxis: {
  //       type: 'category',
  //       // name: 'Frequency',
  //       data: xValues,
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
    // myChart.resize({
    //   // width: 800,
    //   height: 300,
    // });
    // let option: EChartsOption;
    // option = {
    //   toolbox: {
    //     show: true,
    //     feature: {
    //       saveAsImage: {
    //         title: 'Download Chart',
    //         name: 'customer_satisfaction_chart',
    //       },
    //     },
    //   },
    //   xAxis: {
    //     type: 'category',
    //     data: xValues,
    //   },
    //   yAxis: {
    //     type: 'value',
    //   },
    //   series: [
    //     {
    //       // data: [150, 230, 50, 100],
    //       data: yValues,
    //       type: 'line',
    //       color: '#4fa2d0',
    //     },
    //   ],
    // };

    // option && myChart.setOption(option);
  }

  ngOnDestroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  }
}
