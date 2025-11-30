# NomenclaturesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createNomenclatureApiV1NomenclaturesPost**](#createnomenclatureapiv1nomenclaturespost) | **POST** /api/v1/nomenclatures/ | Create Nomenclature|
|[**readNomenclatureApiV1NomenclaturesIdGet**](#readnomenclatureapiv1nomenclaturesidget) | **GET** /api/v1/nomenclatures/{id} | Read Nomenclature|
|[**readNomenclaturesApiV1NomenclaturesGet**](#readnomenclaturesapiv1nomenclaturesget) | **GET** /api/v1/nomenclatures/ | Read Nomenclatures|
|[**updateNomenclatureApiV1NomenclaturesIdPut**](#updatenomenclatureapiv1nomenclaturesidput) | **PUT** /api/v1/nomenclatures/{id} | Update Nomenclature|

# **createNomenclatureApiV1NomenclaturesPost**
> NomenclatureResponse createNomenclatureApiV1NomenclaturesPost(nomenclatureCreate)

Create new nomenclature.

### Example

```typescript
import {
    NomenclaturesApi,
    Configuration,
    NomenclatureCreate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new NomenclaturesApi(configuration);

let nomenclatureCreate: NomenclatureCreate; //

const { status, data } = await apiInstance.createNomenclatureApiV1NomenclaturesPost(
    nomenclatureCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **nomenclatureCreate** | **NomenclatureCreate**|  | |


### Return type

**NomenclatureResponse**

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

# **readNomenclatureApiV1NomenclaturesIdGet**
> NomenclatureResponse readNomenclatureApiV1NomenclaturesIdGet()

Get nomenclature by ID.

### Example

```typescript
import {
    NomenclaturesApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new NomenclaturesApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.readNomenclatureApiV1NomenclaturesIdGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**NomenclatureResponse**

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

# **readNomenclaturesApiV1NomenclaturesGet**
> Array<NomenclatureResponse> readNomenclaturesApiV1NomenclaturesGet()

Retrieve nomenclatures.

### Example

```typescript
import {
    NomenclaturesApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new NomenclaturesApi(configuration);

let skip: number; // (optional) (default to 0)
let limit: number; // (optional) (default to 100)

const { status, data } = await apiInstance.readNomenclaturesApiV1NomenclaturesGet(
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

**Array<NomenclatureResponse>**

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

# **updateNomenclatureApiV1NomenclaturesIdPut**
> NomenclatureResponse updateNomenclatureApiV1NomenclaturesIdPut(nomenclatureUpdate)

Update nomenclature.

### Example

```typescript
import {
    NomenclaturesApi,
    Configuration,
    NomenclatureUpdate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new NomenclaturesApi(configuration);

let id: number; // (default to undefined)
let nomenclatureUpdate: NomenclatureUpdate; //

const { status, data } = await apiInstance.updateNomenclatureApiV1NomenclaturesIdPut(
    id,
    nomenclatureUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **nomenclatureUpdate** | **NomenclatureUpdate**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**NomenclatureResponse**

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
