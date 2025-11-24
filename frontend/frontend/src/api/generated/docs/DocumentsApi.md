# DocumentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createPresignedUploadApiV1DocumentsPresignUploadPost**](#createpresigneduploadapiv1documentspresignuploadpost) | **POST** /api/v1/documents/presign/upload | Create Presigned Upload|
|[**deleteDocumentApiV1DocumentsDocumentIdDelete**](#deletedocumentapiv1documentsdocumentiddelete) | **DELETE** /api/v1/documents/{document_id} | Delete Document|
|[**getDocumentApiV1DocumentsDocumentIdGet**](#getdocumentapiv1documentsdocumentidget) | **GET** /api/v1/documents/{document_id} | Get Document|
|[**listDocumentsApiV1DocumentsGet**](#listdocumentsapiv1documentsget) | **GET** /api/v1/documents/ | List Documents|

# **createPresignedUploadApiV1DocumentsPresignUploadPost**
> EnvelopeDocumentWithUploadOut createPresignedUploadApiV1DocumentsPresignUploadPost(documentCreate)


### Example

```typescript
import {
    DocumentsApi,
    Configuration,
    DocumentCreate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let documentCreate: DocumentCreate; //

const { status, data } = await apiInstance.createPresignedUploadApiV1DocumentsPresignUploadPost(
    documentCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentCreate** | **DocumentCreate**|  | |


### Return type

**EnvelopeDocumentWithUploadOut**

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

# **deleteDocumentApiV1DocumentsDocumentIdDelete**
> EnvelopeBool deleteDocumentApiV1DocumentsDocumentIdDelete()


### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let documentId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteDocumentApiV1DocumentsDocumentIdDelete(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] |  | defaults to undefined|


### Return type

**EnvelopeBool**

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

# **getDocumentApiV1DocumentsDocumentIdGet**
> EnvelopeDocumentWithDownloadOut getDocumentApiV1DocumentsDocumentIdGet()


### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let documentId: number; // (default to undefined)

const { status, data } = await apiInstance.getDocumentApiV1DocumentsDocumentIdGet(
    documentId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **documentId** | [**number**] |  | defaults to undefined|


### Return type

**EnvelopeDocumentWithDownloadOut**

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

# **listDocumentsApiV1DocumentsGet**
> EnvelopeDict listDocumentsApiV1DocumentsGet()

Return paginated list of documents.

### Example

```typescript
import {
    DocumentsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new DocumentsApi(configuration);

let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 20)

const { status, data } = await apiInstance.listDocumentsApiV1DocumentsGet(
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 20|


### Return type

**EnvelopeDict**

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

