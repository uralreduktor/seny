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
*AuthApi* | [**loginApiV1AuthLoginPost**](docs/AuthApi.md#loginapiv1authloginpost) | **POST** /api/v1/auth/login | Login
*AuthApi* | [**registerApiV1AuthRegisterPost**](docs/AuthApi.md#registerapiv1authregisterpost) | **POST** /api/v1/auth/register | Register
*CalculationsApi* | [**createCalculationApiV1CalculationsPost**](docs/CalculationsApi.md#createcalculationapiv1calculationspost) | **POST** /api/v1/calculations/ | Create Calculation
*CalculationsApi* | [**getCalculationApiV1CalculationsCalculationIdGet**](docs/CalculationsApi.md#getcalculationapiv1calculationscalculationidget) | **GET** /api/v1/calculations/{calculation_id} | Get Calculation
*CalculationsApi* | [**listCalculationsApiV1CalculationsGet**](docs/CalculationsApi.md#listcalculationsapiv1calculationsget) | **GET** /api/v1/calculations/ | List Calculations
*CalculationsApi* | [**updateCalculationApiV1CalculationsCalculationIdPut**](docs/CalculationsApi.md#updatecalculationapiv1calculationscalculationidput) | **PUT** /api/v1/calculations/{calculation_id} | Update Calculation
*CostComponentsApi* | [**createCostComponentApiV1CostComponentsPost**](docs/CostComponentsApi.md#createcostcomponentapiv1costcomponentspost) | **POST** /api/v1/cost-components/ | Create Cost Component
*CostComponentsApi* | [**listCostComponentsApiV1CostComponentsGet**](docs/CostComponentsApi.md#listcostcomponentsapiv1costcomponentsget) | **GET** /api/v1/cost-components/ | List Cost Components
*CostComponentsApi* | [**updateCostComponentApiV1CostComponentsComponentIdPut**](docs/CostComponentsApi.md#updatecostcomponentapiv1costcomponentscomponentidput) | **PUT** /api/v1/cost-components/{component_id} | Update Cost Component
*DocumentConstructorApi* | [**generateDocumentEndpointApiV1DocgenGeneratePost**](docs/DocumentConstructorApi.md#generatedocumentendpointapiv1docgengeneratepost) | **POST** /api/v1/docgen/generate | Generate Document Endpoint
*DocumentConstructorApi* | [**listAttributesApiV1DocgenAttributesGet**](docs/DocumentConstructorApi.md#listattributesapiv1docgenattributesget) | **GET** /api/v1/docgen/attributes | List Attributes
*DocumentConstructorApi* | [**listDocumentTypesApiV1DocgenTypesGet**](docs/DocumentConstructorApi.md#listdocumenttypesapiv1docgentypesget) | **GET** /api/v1/docgen/types | List Document Types
*DocumentConstructorApi* | [**listTemplatesApiV1DocgenTemplatesGet**](docs/DocumentConstructorApi.md#listtemplatesapiv1docgentemplatesget) | **GET** /api/v1/docgen/templates | List Templates
*DocumentsApi* | [**createPresignedUploadApiV1DocumentsPresignUploadPost**](docs/DocumentsApi.md#createpresigneduploadapiv1documentspresignuploadpost) | **POST** /api/v1/documents/presign/upload | Create Presigned Upload
*DocumentsApi* | [**deleteDocumentApiV1DocumentsDocumentIdDelete**](docs/DocumentsApi.md#deletedocumentapiv1documentsdocumentiddelete) | **DELETE** /api/v1/documents/{document_id} | Delete Document
*DocumentsApi* | [**getDocumentApiV1DocumentsDocumentIdGet**](docs/DocumentsApi.md#getdocumentapiv1documentsdocumentidget) | **GET** /api/v1/documents/{document_id} | Get Document
*DocumentsApi* | [**listDocumentsApiV1DocumentsGet**](docs/DocumentsApi.md#listdocumentsapiv1documentsget) | **GET** /api/v1/documents/ | List Documents
*HealthApi* | [**healthCheckApiHealthGet**](docs/HealthApi.md#healthcheckapihealthget) | **GET** /api/health | Health Check
*NomenclatureApi* | [**getOkpd2TreeApiV1NomenclatureTreeGet**](docs/NomenclatureApi.md#getokpd2treeapiv1nomenclaturetreeget) | **GET** /api/v1/nomenclature/tree | Get Okpd2 Tree
*NomenclatureApi* | [**healthApiV1NomenclatureHealthGet**](docs/NomenclatureApi.md#healthapiv1nomenclaturehealthget) | **GET** /api/v1/nomenclature/health | Health
*StatusHistoryApi* | [**createStatusHistoryApiV1StatusHistoryPost**](docs/StatusHistoryApi.md#createstatushistoryapiv1statushistorypost) | **POST** /api/v1/status-history/ | Create Status History
*StatusHistoryApi* | [**listStatusHistoryApiV1StatusHistoryGet**](docs/StatusHistoryApi.md#liststatushistoryapiv1statushistoryget) | **GET** /api/v1/status-history/ | List Status History
*TendersApi* | [**createTenderApiV1TendersPost**](docs/TendersApi.md#createtenderapiv1tenderspost) | **POST** /api/v1/tenders/ | Create Tender
*TendersApi* | [**deleteTenderApiV1TendersTenderIdDelete**](docs/TendersApi.md#deletetenderapiv1tenderstenderiddelete) | **DELETE** /api/v1/tenders/{tender_id} | Delete Tender
*TendersApi* | [**getTenderApiV1TendersTenderIdGet**](docs/TendersApi.md#gettenderapiv1tenderstenderidget) | **GET** /api/v1/tenders/{tender_id} | Get Tender
*TendersApi* | [**listTendersApiV1TendersGet**](docs/TendersApi.md#listtendersapiv1tendersget) | **GET** /api/v1/tenders/ | List Tenders
*TendersApi* | [**updateTenderApiV1TendersTenderIdPut**](docs/TendersApi.md#updatetenderapiv1tenderstenderidput) | **PUT** /api/v1/tenders/{tender_id} | Update Tender


### Documentation For Models

 - [AttributeOut](docs/AttributeOut.md)
 - [CalculationCreate](docs/CalculationCreate.md)
 - [CalculationOut](docs/CalculationOut.md)
 - [CalculationUpdate](docs/CalculationUpdate.md)
 - [CostComponentCreate](docs/CostComponentCreate.md)
 - [CostComponentOut](docs/CostComponentOut.md)
 - [CostComponentUpdate](docs/CostComponentUpdate.md)
 - [DocTypeOut](docs/DocTypeOut.md)
 - [DocumentCreate](docs/DocumentCreate.md)
 - [DocumentWithDownloadOut](docs/DocumentWithDownloadOut.md)
 - [DocumentWithUploadOut](docs/DocumentWithUploadOut.md)
 - [EnvelopeBool](docs/EnvelopeBool.md)
 - [EnvelopeCalculationOut](docs/EnvelopeCalculationOut.md)
 - [EnvelopeCostComponentOut](docs/EnvelopeCostComponentOut.md)
 - [EnvelopeDict](docs/EnvelopeDict.md)
 - [EnvelopeDocumentWithDownloadOut](docs/EnvelopeDocumentWithDownloadOut.md)
 - [EnvelopeDocumentWithUploadOut](docs/EnvelopeDocumentWithUploadOut.md)
 - [EnvelopeGeneratedDocumentOut](docs/EnvelopeGeneratedDocumentOut.md)
 - [EnvelopeListAttributeOut](docs/EnvelopeListAttributeOut.md)
 - [EnvelopeListCalculationOut](docs/EnvelopeListCalculationOut.md)
 - [EnvelopeListCostComponentOut](docs/EnvelopeListCostComponentOut.md)
 - [EnvelopeListDocTypeOut](docs/EnvelopeListDocTypeOut.md)
 - [EnvelopeListStatusHistoryOut](docs/EnvelopeListStatusHistoryOut.md)
 - [EnvelopeListTemplateOut](docs/EnvelopeListTemplateOut.md)
 - [EnvelopeStatusHistoryOut](docs/EnvelopeStatusHistoryOut.md)
 - [EnvelopeToken](docs/EnvelopeToken.md)
 - [GenerateDocumentRequest](docs/GenerateDocumentRequest.md)
 - [GeneratedDocumentOut](docs/GeneratedDocumentOut.md)
 - [GeneratedFileOut](docs/GeneratedFileOut.md)
 - [HTTPValidationError](docs/HTTPValidationError.md)
 - [LoginRequest](docs/LoginRequest.md)
 - [RegisterRequest](docs/RegisterRequest.md)
 - [StatusHistoryCreate](docs/StatusHistoryCreate.md)
 - [StatusHistoryOut](docs/StatusHistoryOut.md)
 - [TemplateOut](docs/TemplateOut.md)
 - [TenderCreate](docs/TenderCreate.md)
 - [TenderUpdate](docs/TenderUpdate.md)
 - [Token](docs/Token.md)
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

