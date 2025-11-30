# TendersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**changeTenderStageApiV1TendersIdChangeStagePost**](#changetenderstageapiv1tendersidchangestagepost) | **POST** /api/v1/tenders/{id}/change-stage | Change Tender Stage|
|[**createTenderApiV1TendersPost**](#createtenderapiv1tenderspost) | **POST** /api/v1/tenders/ | Create Tender|
|[**deleteTenderFileApiV1TendersIdFilesFileIdDelete**](#deletetenderfileapiv1tendersidfilesfileiddelete) | **DELETE** /api/v1/tenders/{id}/files/{file_id} | Delete Tender File|
|[**getTenderFileUrlApiV1TendersIdFilesFileIdUrlGet**](#gettenderfileurlapiv1tendersidfilesfileidurlget) | **GET** /api/v1/tenders/{id}/files/{file_id}/url | Get Tender File Url|
|[**readStagesApiV1TendersStagesGet**](#readstagesapiv1tendersstagesget) | **GET** /api/v1/tenders/stages | Read Stages|
|[**readTenderApiV1TendersIdGet**](#readtenderapiv1tendersidget) | **GET** /api/v1/tenders/{id} | Read Tender|
|[**readTendersApiV1TendersGet**](#readtendersapiv1tendersget) | **GET** /api/v1/tenders/ | Read Tenders|
|[**updateTenderApiV1TendersIdPut**](#updatetenderapiv1tendersidput) | **PUT** /api/v1/tenders/{id} | Update Tender|
|[**uploadTenderFileApiV1TendersIdFilesPost**](#uploadtenderfileapiv1tendersidfilespost) | **POST** /api/v1/tenders/{id}/files | Upload Tender File|

# **changeTenderStageApiV1TendersIdChangeStagePost**
> TenderResponse changeTenderStageApiV1TendersIdChangeStagePost()

Change tender stage.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let id: number; // (default to undefined)
let targetStageCode: string; //Target stage code (default to undefined)

const { status, data } = await apiInstance.changeTenderStageApiV1TendersIdChangeStagePost(
    id,
    targetStageCode
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|
| **targetStageCode** | [**string**] | Target stage code | defaults to undefined|


### Return type

**TenderResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createTenderApiV1TendersPost**
> TenderResponse createTenderApiV1TendersPost(tenderCreate)

Create new tender.

### Example

```typescript
import {
    TendersApi,
    Configuration,
    TenderCreate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let tenderCreate: TenderCreate; //

const { status, data } = await apiInstance.createTenderApiV1TendersPost(
    tenderCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tenderCreate** | **TenderCreate**|  | |


### Return type

**TenderResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteTenderFileApiV1TendersIdFilesFileIdDelete**
> any deleteTenderFileApiV1TendersIdFilesFileIdDelete()

Delete a file from the tender.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let id: number; // (default to undefined)
let fileId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteTenderFileApiV1TendersIdFilesFileIdDelete(
    id,
    fileId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|
| **fileId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getTenderFileUrlApiV1TendersIdFilesFileIdUrlGet**
> any getTenderFileUrlApiV1TendersIdFilesFileIdUrlGet()

Get a presigned download URL for the file.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let id: number; // (default to undefined)
let fileId: number; // (default to undefined)

const { status, data } = await apiInstance.getTenderFileUrlApiV1TendersIdFilesFileIdUrlGet(
    id,
    fileId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|
| **fileId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **readStagesApiV1TendersStagesGet**
> Array<StageResponse> readStagesApiV1TendersStagesGet()

Retrieve all possible stages.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

const { status, data } = await apiInstance.readStagesApiV1TendersStagesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<StageResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **readTenderApiV1TendersIdGet**
> TenderResponse readTenderApiV1TendersIdGet()

Get tender by ID.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.readTenderApiV1TendersIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**TenderResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **readTendersApiV1TendersGet**
> Array<TenderResponse> readTendersApiV1TendersGet()

Retrieve tenders.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 100)

const { status, data } = await apiInstance.readTendersApiV1TendersGet(
    skip,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] |  | (optional) defaults to 0|
| **limit** | [**number**] |  | (optional) defaults to 100|


### Return type

**Array<TenderResponse>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateTenderApiV1TendersIdPut**
> TenderResponse updateTenderApiV1TendersIdPut(tenderUpdate)

Update tender.

### Example

```typescript
import {
    TendersApi,
    Configuration,
    TenderUpdate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let id: number; // (default to undefined)
let tenderUpdate: TenderUpdate; //

const { status, data } = await apiInstance.updateTenderApiV1TendersIdPut(
    id,
    tenderUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tenderUpdate** | **TenderUpdate**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**TenderResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **uploadTenderFileApiV1TendersIdFilesPost**
> TenderFileResponse uploadTenderFileApiV1TendersIdFilesPost()

Upload a file to the tender.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let id: number; // (default to undefined)
let file: File; // (default to undefined)
let category: string; // (default to undefined)

const { status, data } = await apiInstance.uploadTenderFileApiV1TendersIdFilesPost(
    id,
    file,
    category
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|
| **file** | [**File**] |  | defaults to undefined|
| **category** | [**string**] |  | defaults to undefined|


### Return type

**TenderFileResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)
