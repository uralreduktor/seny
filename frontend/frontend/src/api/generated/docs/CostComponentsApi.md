# CostComponentsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createCostComponentApiV1CostComponentsPost**](#createcostcomponentapiv1costcomponentspost) | **POST** /api/v1/cost-components/ | Create Cost Component|
|[**listCostComponentsApiV1CostComponentsGet**](#listcostcomponentsapiv1costcomponentsget) | **GET** /api/v1/cost-components/ | List Cost Components|
|[**updateCostComponentApiV1CostComponentsComponentIdPut**](#updatecostcomponentapiv1costcomponentscomponentidput) | **PUT** /api/v1/cost-components/{component_id} | Update Cost Component|

# **createCostComponentApiV1CostComponentsPost**
> EnvelopeCostComponentOut createCostComponentApiV1CostComponentsPost(costComponentCreate)


### Example

```typescript
import {
    CostComponentsApi,
    Configuration,
    CostComponentCreate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new CostComponentsApi(configuration);

let costComponentCreate: CostComponentCreate; //

const { status, data } = await apiInstance.createCostComponentApiV1CostComponentsPost(
    costComponentCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **costComponentCreate** | **CostComponentCreate**|  | |


### Return type

**EnvelopeCostComponentOut**

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

# **listCostComponentsApiV1CostComponentsGet**
> EnvelopeListCostComponentOut listCostComponentsApiV1CostComponentsGet()


### Example

```typescript
import {
    CostComponentsApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new CostComponentsApi(configuration);

let calculationId: number; // (optional) (default to undefined)
let page: number; // (optional) (default to 1)
let pageSize: number; // (optional) (default to 50)

const { status, data } = await apiInstance.listCostComponentsApiV1CostComponentsGet(
    calculationId,
    page,
    pageSize
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **calculationId** | [**number**] |  | (optional) defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **pageSize** | [**number**] |  | (optional) defaults to 50|


### Return type

**EnvelopeListCostComponentOut**

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

# **updateCostComponentApiV1CostComponentsComponentIdPut**
> EnvelopeCostComponentOut updateCostComponentApiV1CostComponentsComponentIdPut(costComponentUpdate)


### Example

```typescript
import {
    CostComponentsApi,
    Configuration,
    CostComponentUpdate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new CostComponentsApi(configuration);

let componentId: number; // (default to undefined)
let costComponentUpdate: CostComponentUpdate; //

const { status, data } = await apiInstance.updateCostComponentApiV1CostComponentsComponentIdPut(
    componentId,
    costComponentUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **costComponentUpdate** | **CostComponentUpdate**|  | |
| **componentId** | [**number**] |  | defaults to undefined|


### Return type

**EnvelopeCostComponentOut**

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

