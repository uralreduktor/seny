# AuditLogResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**user_id** | **number** |  | [optional] [default to undefined]
**action** | **string** |  | [default to undefined]
**details** | **{ [key: string]: any; }** |  | [default to undefined]
**created_at** | **string** |  | [default to undefined]

## Example

```typescript
import { AuditLogResponse } from '@tenderflow/api-client';

const instance: AuditLogResponse = {
    id,
    user_id,
    action,
    details,
    created_at,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
