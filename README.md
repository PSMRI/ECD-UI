# AMRIT - Early Childhood Developemnt (ECD) Service

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
![Build Status](https://github.com/PSMRI/ECD-API/actions/workflows/sast-and-package.yml/badge.svg)

The Early Childhood Development (ECD) Initiative by the Ministry of Health and Family Welfare (MoHFW) aims to nurture the cognitive capital of the country by enabling young children to attain their fullest potential. The initiative focuses on the critical period of brain development, which includes the 270 days of pregnancy and the first two years of the child's life, also known as the first 1,000 days.

## Features of Early Childhood Developemnt (ECD)

- **Focus on the first 1,000 days:** Recognize the critical period of brain development and emphasize the importance of interventions during this period to promote physical, cognitive, social, and emotional development.

- **Communicate with mothers and families:** Acknowledge the vital role of mothers in the holistic development of their children. Develop simple, effective, and personalized messages to communicate with mothers and other family members, highlighting their significant impact on the child's overall development.

- **Reinforce messages through multiple channels:** Establish a unified approach by involving other health providers like ASHA, ANM, and medical officers to reiterate the same messages to caregivers. Consistent information is essential to ensure that parents receive comprehensive guidance.

- **Provide credible advice:** Train resources in the field of early childhood development to deliver information and counseling through the ECD Call Centre. The trained personnel will provide credible advice, enhancing the caregivers' trust in the information provided.

- **Offer personalized advice:** Utilize the interactive platform of the ECD Call Centre to provide personalized advice to parents based on their specific needs and their child's requirements. Building on existing positive practices, suggest additional actions that caregivers can take to promote their child's development.

- **Enhance caregivers' knowledge:** Emphasize the importance of caregivers' knowledge about early childhood development. Provide them with information and resources to better understand their child's developmental needs and milestones.

- **Boost caregivers' confidence:** Empower caregivers to feel confident in their abilities to support their child's development. Encourage them to take simple but meaningful actions that contribute positively to their child's growth.

- **Collaborate with other initiatives:** Complement existing initiatives such as LaQshya, Homebased Care for Young Child, and the Comprehensive New Born Screening under RBSK. By working collaboratively, ensure a comprehensive and integrated approach to early childhood development.

- **Foster a nature-friendly environment:** Promote the importance of creating a stimulating, loving, and protective care environment for children. Encourage activities that connect children with nature and promote their overall well-being.

- **Continuously evaluate and improve:** Regularly assess the effectiveness of the ECD initiative and the ECD Call Centre. Seek feedback from parents and caregivers to identify areas for improvement and refine the messages and services provided.

## Building From Source

This microservice is built using Java and the Spring Boot framework, with MySQL as the underlying database. Before building the ECD module, ensure you have the following prerequisites:

- JDK 17
- Maven
- Nodejs v18.10.0
- MySQL

### Installation

To install the ECD module, please follow these steps:

1. Clone the repository to your local machine.
2. Install the dependencies and build the module:
   - Run the command `npm install`.
   - Run the command `npm run build`.
   - Run the command `mvn clean install`.
   - Run the command `npm start`.
3. Open your browser and access `http://localhost:4200/#/login` to view the login page of module.

## Building war files

To build deployable war files

```bash
mvn -B package --file pom.xml -P <profile_name>
```

The available profiles include dev, local, test, and ci.
Refer to `src/environments/environment.ci.template` file and ensure that the right environment variables are set for the build.

Packing with `ci` profile calls `build-ci` script in `package.json`.
It creates a `environment.ci.ts` file with all environment variables used in the generated build.

## Usage

All the features of the ECD service are exposed as REST endpoints. Please refer to the Swagger API specification for detailed information on how to utilize each feature.

The ECD module offers comprehensive management capabilities for your application.

## Filing Issues

If you encounter any issues, bugs, or have feature requests, please file them in the [main AMRIT repository](https://github.com/PSMRI/AMRIT/issues). Centralizing all feedback helps us streamline improvements and address concerns efficiently.  

## Join Our Community

We’d love to have you join our community discussions and get real-time support!  
Join our [Discord server](https://discord.gg/FVQWsf5ENS) to connect with contributors, ask questions, and stay updated.  

<!-- # ECDUi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
-->
