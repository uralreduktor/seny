## @tenderflow/api-client@1.0.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install @tenderflow/api-client@1.0.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *http://localhost*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*AuthApi* | [**loginAccessTokenApiV1AuthLoginPost**](docs/AuthApi.md#loginaccesstokenapiv1authloginpost) | **POST** /api/v1/auth/login | Login Access Token
*DefaultApi* | [**healthCheckHealthGet**](docs/DefaultApi.md#healthcheckhealthget) | **GET** /health | Health Check
*DefaultApi* | [**rootGet**](docs/DefaultApi.md#rootget) | **GET** / | Root
*NomenclaturesApi* | [**createNomenclatureApiV1NomenclaturesPost**](docs/NomenclaturesApi.md#createnomenclatureapiv1nomenclaturespost) | **POST** /api/v1/nomenclatures/ | Create Nomenclature
*NomenclaturesApi* | [**readNomenclatureApiV1NomenclaturesIdGet**](docs/NomenclaturesApi.md#readnomenclatureapiv1nomenclaturesidget) | **GET** /api/v1/nomenclatures/{id} | Read Nomenclature
*NomenclaturesApi* | [**readNomenclaturesApiV1NomenclaturesGet**](docs/NomenclaturesApi.md#readnomenclaturesapiv1nomenclaturesget) | **GET** /api/v1/nomenclatures/ | Read Nomenclatures
*NomenclaturesApi* | [**updateNomenclatureApiV1NomenclaturesIdPut**](docs/NomenclaturesApi.md#updatenomenclatureapiv1nomenclaturesidput) | **PUT** /api/v1/nomenclatures/{id} | Update Nomenclature
*PositionsApi* | [**deletePositionApiV1PositionsIdDelete**](docs/PositionsApi.md#deletepositionapiv1positionsiddelete) | **DELETE** /api/v1/positions/{id} | Delete Position
*PositionsApi* | [**readPositionApiV1PositionsIdGet**](docs/PositionsApi.md#readpositionapiv1positionsidget) | **GET** /api/v1/positions/{id} | Read Position
*PositionsApi* | [**updatePositionApiV1PositionsIdPut**](docs/PositionsApi.md#updatepositionapiv1positionsidput) | **PUT** /api/v1/positions/{id} | Update Position
*TendersApi* | [**changeTenderStageApiV1TendersIdChangeStagePost**](docs/TendersApi.md#changetenderstageapiv1tendersidchangestagepost) | **POST** /api/v1/tenders/{id}/change-stage | Change Tender Stage
*TendersApi* | [**createTenderApiV1TendersPost**](docs/TendersApi.md#createtenderapiv1tenderspost) | **POST** /api/v1/tenders/ | Create Tender
*TendersApi* | [**deleteTenderFileApiV1TendersIdFilesFileIdDelete**](docs/TendersApi.md#deletetenderfileapiv1tendersidfilesfileiddelete) | **DELETE** /api/v1/tenders/{id}/files/{file_id} | Delete Tender File
*TendersApi* | [**getTenderFileUrlApiV1TendersIdFilesFileIdUrlGet**](docs/TendersApi.md#gettenderfileurlapiv1tendersidfilesfileidurlget) | **GET** /api/v1/tenders/{id}/files/{file_id}/url | Get Tender File Url
*TendersApi* | [**readStagesApiV1TendersStagesGet**](docs/TendersApi.md#readstagesapiv1tendersstagesget) | **GET** /api/v1/tenders/stages | Read Stages
*TendersApi* | [**readTenderApiV1TendersIdGet**](docs/TendersApi.md#readtenderapiv1tendersidget) | **GET** /api/v1/tenders/{id} | Read Tender
*TendersApi* | [**readTendersApiV1TendersGet**](docs/TendersApi.md#readtendersapiv1tendersget) | **GET** /api/v1/tenders/ | Read Tenders
*TendersApi* | [**updateTenderApiV1TendersIdPut**](docs/TendersApi.md#updatetenderapiv1tendersidput) | **PUT** /api/v1/tenders/{id} | Update Tender
*TendersApi* | [**uploadTenderFileApiV1TendersIdFilesPost**](docs/TendersApi.md#uploadtenderfileapiv1tendersidfilespost) | **POST** /api/v1/tenders/{id}/files | Upload Tender File
*UsersApi* | [**createUserApiV1UsersPost**](docs/UsersApi.md#createuserapiv1userspost) | **POST** /api/v1/users/ | Create User
*UsersApi* | [**readUserMeApiV1UsersMeGet**](docs/UsersApi.md#readusermeapiv1usersmeget) | **GET** /api/v1/users/me | Read User Me
*UsersApi* | [**updateUserPasswordApiV1UsersMePasswordPost**](docs/UsersApi.md#updateuserpasswordapiv1usersmepasswordpost) | **POST** /api/v1/users/me/password | Update User Password


### Documentation For Models

 - [AuditLogResponse](docs/AuditLogResponse.md)
 - [BasePrice](docs/BasePrice.md)
 - [CostPrice](docs/CostPrice.md)
 - [HTTPValidationError](docs/HTTPValidationError.md)
 - [InitialMaxPrice](docs/InitialMaxPrice.md)
 - [NomenclatureCreate](docs/NomenclatureCreate.md)
 - [NomenclatureResponse](docs/NomenclatureResponse.md)
 - [NomenclatureUpdate](docs/NomenclatureUpdate.md)
 - [PositionResponse](docs/PositionResponse.md)
 - [PositionStatus](docs/PositionStatus.md)
 - [PositionUpdate](docs/PositionUpdate.md)
 - [PricePerUnit](docs/PricePerUnit.md)
 - [Quantity](docs/Quantity.md)
 - [StageResponse](docs/StageResponse.md)
 - [TenderCreate](docs/TenderCreate.md)
 - [TenderFileResponse](docs/TenderFileResponse.md)
 - [TenderResponse](docs/TenderResponse.md)
 - [TenderSource](docs/TenderSource.md)
 - [TenderUpdate](docs/TenderUpdate.md)
 - [Token](docs/Token.md)
 - [TotalPrice](docs/TotalPrice.md)
 - [UserCreate](docs/UserCreate.md)
 - [UserResponse](docs/UserResponse.md)
 - [UserUpdatePassword](docs/UserUpdatePassword.md)
 - [ValidationError](docs/ValidationError.md)
 - [ValidationErrorLocInner](docs/ValidationErrorLocInner.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="OAuth2PasswordBearer"></a>
### OAuth2PasswordBearer

- **Type**: OAuth
- **Flow**: password
- **Authorization URL**: 
- **Scopes**: N/A
