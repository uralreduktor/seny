# AuthApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**loginApiV1AuthLoginPost**](#loginapiv1authloginpost) | **POST** /api/v1/auth/login | Login|
|[**registerApiV1AuthRegisterPost**](#registerapiv1authregisterpost) | **POST** /api/v1/auth/register | Register|

# **loginApiV1AuthLoginPost**
> EnvelopeToken loginApiV1AuthLoginPost(loginRequest)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    LoginRequest
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let loginRequest: LoginRequest; //

const { status, data } = await apiInstance.loginApiV1AuthLoginPost(
    loginRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **loginRequest** | **LoginRequest**|  | |


### Return type

**EnvelopeToken**

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

# **registerApiV1AuthRegisterPost**
> EnvelopeToken registerApiV1AuthRegisterPost(registerRequest)


### Example

```typescript
import {
    AuthApi,
    Configuration,
    RegisterRequest
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new AuthApi(configuration);

let registerRequest: RegisterRequest; //

const { status, data } = await apiInstance.registerApiV1AuthRegisterPost(
    registerRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **registerRequest** | **RegisterRequest**|  | |


### Return type

**EnvelopeToken**

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

