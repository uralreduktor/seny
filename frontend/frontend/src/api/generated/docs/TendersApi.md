# TendersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createTenderApiV1TendersPost**](#createtenderapiv1tenderspost) | **POST** /api/v1/tenders/ | Create Tender|
|[**deleteTenderApiV1TendersTenderIdDelete**](#deletetenderapiv1tenderstenderiddelete) | **DELETE** /api/v1/tenders/{tender_id} | Delete Tender|
|[**getTenderApiV1TendersTenderIdGet**](#gettenderapiv1tenderstenderidget) | **GET** /api/v1/tenders/{tender_id} | Get Tender|
|[**listTendersApiV1TendersGet**](#listtendersapiv1tendersget) | **GET** /api/v1/tenders/ | List Tenders|
|[**updateTenderApiV1TendersTenderIdPut**](#updatetenderapiv1tenderstenderidput) | **PUT** /api/v1/tenders/{tender_id} | Update Tender|

# **createTenderApiV1TendersPost**
> object createTenderApiV1TendersPost(tenderCreate)

Create tender.  Authentication required.

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

**object**

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

# **deleteTenderApiV1TendersTenderIdDelete**
> object deleteTenderApiV1TendersTenderIdDelete()

Delete tender by id.  Authentication required.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let tenderId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteTenderApiV1TendersTenderIdDelete(
    tenderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tenderId** | [**number**] |  | defaults to undefined|


### Return type

**object**

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

# **getTenderApiV1TendersTenderIdGet**
> object getTenderApiV1TendersTenderIdGet()

Get tender by id.  Authentication required.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let tenderId: number; // (default to undefined)

const { status, data } = await apiInstance.getTenderApiV1TendersTenderIdGet(
    tenderId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tenderId** | [**number**] |  | defaults to undefined|


### Return type

**object**

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

# **listTendersApiV1TendersGet**
> object listTendersApiV1TendersGet()

Return list of all tenders.  Authentication required.

### Example

```typescript
import {
    TendersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 10)

const { status, data } = await apiInstance.listTendersApiV1TendersGet(
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 10|


### Return type

**object**

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

# **updateTenderApiV1TendersTenderIdPut**
> object updateTenderApiV1TendersTenderIdPut(tenderUpdate)

Update tender by id.  Authentication required.

### Example

```typescript
import {
    TendersApi,
    Configuration,
    TenderUpdate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new TendersApi(configuration);

let tenderId: number; // (default to undefined)
let tenderUpdate: TenderUpdate; //

const { status, data } = await apiInstance.updateTenderApiV1TendersTenderIdPut(
    tenderId,
    tenderUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tenderUpdate** | **TenderUpdate**|  | |
| **tenderId** | [**number**] |  | defaults to undefined|


### Return type

**object**

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

