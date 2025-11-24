# CalculationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createCalculationApiV1CalculationsPost**](#createcalculationapiv1calculationspost) | **POST** /api/v1/calculations/ | Create Calculation|
|[**getCalculationApiV1CalculationsCalculationIdGet**](#getcalculationapiv1calculationscalculationidget) | **GET** /api/v1/calculations/{calculation_id} | Get Calculation|
|[**listCalculationsApiV1CalculationsGet**](#listcalculationsapiv1calculationsget) | **GET** /api/v1/calculations/ | List Calculations|
|[**updateCalculationApiV1CalculationsCalculationIdPut**](#updatecalculationapiv1calculationscalculationidput) | **PUT** /api/v1/calculations/{calculation_id} | Update Calculation|

# **createCalculationApiV1CalculationsPost**
> EnvelopeCalculationOut createCalculationApiV1CalculationsPost(calculationCreate)


### Example

```typescript
import {
    CalculationsApi,
    Configuration,
    CalculationCreate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new CalculationsApi(configuration);

let calculationCreate: CalculationCreate; //

const { status, data } = await apiInstance.createCalculationApiV1CalculationsPost(
    calculationCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculationCreate** | **CalculationCreate**|  | |


### Return type

**EnvelopeCalculationOut**

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

# **getCalculationApiV1CalculationsCalculationIdGet**
> EnvelopeCalculationOut getCalculationApiV1CalculationsCalculationIdGet()


### Example

```typescript
import {
    CalculationsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new CalculationsApi(configuration);

let calculationId: number; // (default to undefined)

const { status, data } = await apiInstance.getCalculationApiV1CalculationsCalculationIdGet(
    calculationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculationId** | [**number**] |  | defaults to undefined|


### Return type

**EnvelopeCalculationOut**

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

# **listCalculationsApiV1CalculationsGet**
> EnvelopeListCalculationOut listCalculationsApiV1CalculationsGet()


### Example

```typescript
import {
    CalculationsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new CalculationsApi(configuration);

let tenderId: number; // (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 20)

const { status, data } = await apiInstance.listCalculationsApiV1CalculationsGet(
    tenderId,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **tenderId** | [**number**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 20|


### Return type

**EnvelopeListCalculationOut**

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

# **updateCalculationApiV1CalculationsCalculationIdPut**
> EnvelopeCalculationOut updateCalculationApiV1CalculationsCalculationIdPut(calculationUpdate)


### Example

```typescript
import {
    CalculationsApi,
    Configuration,
    CalculationUpdate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new CalculationsApi(configuration);

let calculationId: number; // (default to undefined)
let calculationUpdate: CalculationUpdate; //

const { status, data } = await apiInstance.updateCalculationApiV1CalculationsCalculationIdPut(
    calculationId,
    calculationUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculationUpdate** | **CalculationUpdate**|  | |
| **calculationId** | [**number**] |  | defaults to undefined|


### Return type

**EnvelopeCalculationOut**

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

