# DocumentConstructorApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**generateDocumentEndpointApiV1DocgenGeneratePost**](#generatedocumentendpointapiv1docgengeneratepost) | **POST** /api/v1/docgen/generate | Generate Document Endpoint|
|[**listAttributesApiV1DocgenAttributesGet**](#listattributesapiv1docgenattributesget) | **GET** /api/v1/docgen/attributes | List Attributes|
|[**listDocumentTypesApiV1DocgenTypesGet**](#listdocumenttypesapiv1docgentypesget) | **GET** /api/v1/docgen/types | List Document Types|
|[**listTemplatesApiV1DocgenTemplatesGet**](#listtemplatesapiv1docgentemplatesget) | **GET** /api/v1/docgen/templates | List Templates|

# **generateDocumentEndpointApiV1DocgenGeneratePost**
> EnvelopeGeneratedDocumentOut generateDocumentEndpointApiV1DocgenGeneratePost(generateDocumentRequest)

Generate a document using a template and return metadata in a unified envelope.

### Example

```typescript
import {
    DocumentConstructorApi,
    Configuration,
    GenerateDocumentRequest
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentConstructorApi(configuration);

let generateDocumentRequest: GenerateDocumentRequest; //

const { status, data } = await apiInstance.generateDocumentEndpointApiV1DocgenGeneratePost(
    generateDocumentRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **generateDocumentRequest** | **GenerateDocumentRequest**|  | |


### Return type

**EnvelopeGeneratedDocumentOut**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listAttributesApiV1DocgenAttributesGet**
> EnvelopeListAttributeOut listAttributesApiV1DocgenAttributesGet()


### Example

```typescript
import {
    DocumentConstructorApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentConstructorApi(configuration);

let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 50)
let category: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listAttributesApiV1DocgenAttributesGet(
    page,
    pageSize,
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 50|
| **category** | [**string**] |  | (optional) defaults to undefined|


### Return type

**EnvelopeListAttributeOut**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listDocumentTypesApiV1DocgenTypesGet**
> EnvelopeListDocTypeOut listDocumentTypesApiV1DocgenTypesGet()


### Example

```typescript
import {
    DocumentConstructorApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentConstructorApi(configuration);

let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 20)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.listDocumentTypesApiV1DocgenTypesGet(
    page,
    pageSize,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 20|
| **search** | [**string**] |  | (optional) defaults to undefined|


### Return type

**EnvelopeListDocTypeOut**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listTemplatesApiV1DocgenTemplatesGet**
> EnvelopeListTemplateOut listTemplatesApiV1DocgenTemplatesGet()


### Example

```typescript
import {
    DocumentConstructorApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentConstructorApi(configuration);

let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 20)
let statusFilter: string; // (optional) (default to undefined)
let typeId: number; // (optional) (default to undefined)

const { status, data } = await apiInstance.listTemplatesApiV1DocgenTemplatesGet(
    page,
    pageSize,
    statusFilter,
    typeId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 20|
| **statusFilter** | [**string**] |  | (optional) defaults to undefined|
| **typeId** | [**number**] |  | (optional) defaults to undefined|


### Return type

**EnvelopeListTemplateOut**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

