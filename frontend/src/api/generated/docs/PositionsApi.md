# PositionsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**deletePositionApiV1PositionsIdDelete**](#deletepositionapiv1positionsiddelete) | **DELETE** /api/v1/positions/{id} | Delete Position|
|[**readPositionApiV1PositionsIdGet**](#readpositionapiv1positionsidget) | **GET** /api/v1/positions/{id} | Read Position|
|[**updatePositionApiV1PositionsIdPut**](#updatepositionapiv1positionsidput) | **PUT** /api/v1/positions/{id} | Update Position|

# **deletePositionApiV1PositionsIdDelete**
> boolean deletePositionApiV1PositionsIdDelete()

Delete position.

### Example

```typescript
import {
    PositionsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new PositionsApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deletePositionApiV1PositionsIdDelete(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**boolean**

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

# **readPositionApiV1PositionsIdGet**
> PositionResponse readPositionApiV1PositionsIdGet()

Get position by ID.

### Example

```typescript
import {
    PositionsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new PositionsApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.readPositionApiV1PositionsIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**PositionResponse**

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

# **updatePositionApiV1PositionsIdPut**
> PositionResponse updatePositionApiV1PositionsIdPut(positionUpdate)

Update position.

### Example

```typescript
import {
    PositionsApi,
    Configuration,
    PositionUpdate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new PositionsApi(configuration);

let id: number; // (default to undefined)
let positionUpdate: PositionUpdate; //

const { status, data } = await apiInstance.updatePositionApiV1PositionsIdPut(
    id,
    positionUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **positionUpdate** | **PositionUpdate**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**PositionResponse**

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
