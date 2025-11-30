# UserCreate


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** |  | [default to undefined]
**is_active** | **boolean** |  | [optional] [default to undefined]
**is_superuser** | **boolean** |  | [optional] [default to false]
**full_name** | **string** |  | [optional] [default to undefined]
**password** | **string** |  | [default to undefined]

## Example

```typescript
import { UserCreate } from '@tenderflow/api-client';

const instance: UserCreate = {
    email,
    is_active,
    is_superuser,
    full_name,
    password,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
