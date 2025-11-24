# NomenclatureApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getOkpd2TreeApiV1NomenclatureTreeGet**](#getokpd2treeapiv1nomenclaturetreeget) | **GET** /api/v1/nomenclature/tree | Get Okpd2 Tree|
|[**healthApiV1NomenclatureHealthGet**](#healthapiv1nomenclaturehealthget) | **GET** /api/v1/nomenclature/health | Health|

# **getOkpd2TreeApiV1NomenclatureTreeGet**
> object getOkpd2TreeApiV1NomenclatureTreeGet()


### Example

```typescript
import {
    NomenclatureApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new NomenclatureApi(configuration);

let parentCode: string; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getOkpd2TreeApiV1NomenclatureTreeGet(
    parentCode,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **parentCode** | [**string**] |  | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|


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

# **healthApiV1NomenclatureHealthGet**
> object healthApiV1NomenclatureHealthGet()


### Example

```typescript
import {
    NomenclatureApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new NomenclatureApi(configuration);

const { status, data } = await apiInstance.healthApiV1NomenclatureHealthGet();
```

### Parameters
This endpoint does not have any parameters.


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

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

