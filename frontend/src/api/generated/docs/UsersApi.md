# UsersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createUserApiV1UsersPost**](#createuserapiv1userspost) | **POST** /api/v1/users/ | Create User|
|[**readUserMeApiV1UsersMeGet**](#readusermeapiv1usersmeget) | **GET** /api/v1/users/me | Read User Me|
|[**updateUserPasswordApiV1UsersMePasswordPost**](#updateuserpasswordapiv1usersmepasswordpost) | **POST** /api/v1/users/me/password | Update User Password|

# **createUserApiV1UsersPost**
> UserResponse createUserApiV1UsersPost(userCreate)

Create new user.

### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserCreate
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userCreate: UserCreate; //

const { status, data } = await apiInstance.createUserApiV1UsersPost(
    userCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userCreate** | **UserCreate**|  | |


### Return type

**UserResponse**

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

# **readUserMeApiV1UsersMeGet**
> UserResponse readUserMeApiV1UsersMeGet()

Get current user.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.readUserMeApiV1UsersMeGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserResponse**

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

# **updateUserPasswordApiV1UsersMePasswordPost**
> UserResponse updateUserPasswordApiV1UsersMePasswordPost(userUpdatePassword)

Update current user password.

### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserUpdatePassword
} from '@tenderflow/api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userUpdatePassword: UserUpdatePassword; //

const { status, data } = await apiInstance.updateUserPasswordApiV1UsersMePasswordPost(
    userUpdatePassword
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userUpdatePassword** | **UserUpdatePassword**|  | |


### Return type

**UserResponse**

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
