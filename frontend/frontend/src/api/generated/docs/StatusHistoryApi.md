# StatusHistoryApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createStatusHistoryApiV1StatusHistoryPost**](#createstatushistoryapiv1statushistorypost) | **POST** /api/v1/status-history/ | Create Status History|
|[**listStatusHistoryApiV1StatusHistoryGet**](#liststatushistoryapiv1statushistoryget) | **GET** /api/v1/status-history/ | List Status History|

# **createStatusHistoryApiV1StatusHistoryPost**
> EnvelopeStatusHistoryOut createStatusHistoryApiV1StatusHistoryPost(statusHistoryCreate)


### Example

```typescript
import {
    StatusHistoryApi,
    Configuration,
    StatusHistoryCreate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new StatusHistoryApi(configuration);

let statusHistoryCreate: StatusHistoryCreate; //

const { status, data } = await apiInstance.createStatusHistoryApiV1StatusHistoryPost(
    statusHistoryCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **statusHistoryCreate** | **StatusHistoryCreate**|  | |


### Return type

**EnvelopeStatusHistoryOut**

### Authorization

[OAuth2PasswordBearer](../README.md#OAuth2PasswordBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **listStatusHistoryApiV1StatusHistoryGet**
> EnvelopeListStatusHistoryOut listStatusHistoryApiV1StatusHistoryGet()


### Example

```typescript
import {
    StatusHistoryApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new StatusHistoryApi(configuration);

let tenderId: number; // (default to undefined)
let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 50)

const { status, data } = await apiInstance.listStatusHistoryApiV1StatusHistoryGet(
    tenderId,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tenderId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 50|


### Return type

**EnvelopeListStatusHistoryOut**

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

